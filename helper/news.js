const { isValidObjectId, mongoose } = require('mongoose');
const slugify = require('slugify');
require('dotenv').config();

const maxTextLength = 5000;

async function uploadNews(req, res, News, Like, Reviews, User) {
    try {
      // Step 1: Check and process News content (text or file)
      let content = '';
      console.log(req.body);
  
      if (req.body.text) {
        // Handle plain text upload
        content = req.body.text;
      } else {
        return res.status(400).json({ error: 'No Content provided.' });
      }
  
      // Step 2: Validate and store user ID
      const { userId } = req.body;
      if (!userId) {
        return res.status(400).json({ error: 'User ID not provided.' });
      }
  
      // Check if the user exists and has the role 'Admin'
      const user = await User.findOne({ _id: userId });
      if (!user) {
        return res.status(404).json({ error: 'User Not Found' });
      } else if (user.role === 'User') {
        return res.status(401).json({ error: 'You are NOT allowed to publish content.' });
      }
  
      // Step 3: Store the Google Drive link directly in the database as the thumbnail
      const { thumbnailLink } = req.body;
      if (!thumbnailLink) {
        return res.status(400).json({ error: 'No thumbnail link provided.' });
      }
  
      // Step 4: Validate and store the title
      const { title } = req.body;
      if (!title) {
        return res.status(400).json({ error: 'No title provided.' });
      }
  
      // Step 5: Store the list of category IDs in the database field
      const { categories } = req.body;
      const categoryIds = Array.isArray(categories) ? categories : [];
      if (categoryIds.some((categoryId) => !mongoose.isValidObjectId(categoryId))) {
        return res.status(400).json({ error: 'Invalid category provided.' });
      }
  
      // Step 6: Create a new News instance and save it to the database
      const news = await News.create({
        user: userId,
        content: content,
        thumbnail: thumbnailLink,
        title: title,
        category: categoryIds,
      });
  
      // Respond with success
      return res.status(200).json({ message: 'Content uploaded successfully.', news });
    } catch (err) {
      console.log(err);
      return res.status(500).json({ error: 'Server error while uploading the content.' });
    }
}  

async function readNews(req, res, News, Like, Reviews, User) {
  try {
    const { id } = req.params;

    // Validate News ID format
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ error: 'Invalid News ID format.' });
    }

    // Find the News by its ID and select specific fields
    const news = await News.findById(id)
      .select('content thumbnail category created_at user views')
      .populate('user', 'username dp')
      .populate('category', 'name');

    if (!news) {
      return res.status(404).json({ error: 'News not found.' });
    }

    // Increment the view count for the News
    news.views += 5;
    await news.save();

    const views = news.views;

    // Fetch likes for the magazine
    const likes = await Like.find({ likeableId: id, likeableType: 'News' });

    // Fetch reviews for the magazine
    const reviews = await Reviews.find({ product: id, commentType: 'News' });

    // Response data with News details and user info
    const responseData = {
      content: news.content,
      thumbnail: news.thumbnail,
      category: news.category,
      created_at: news.created_at,
      views,
      user: {
        username: news.user.username,
        dp: news.user.dp,
      },
      likes,
      reviews
    };

    return res.status(200).json(responseData);
  } catch (err) {
    return res.status(500).json({ error: 'Server error while reading the News.' });
  }
}

async function updateNews(req, res, News, Like, Review, User) {
  try {
    const { id, userId } = req.params;
    const { title, content } = req.body; // Assuming both title and content can be provided in the request body

    // Validate News ID format
    if (!isValidObjectId(id)) {
      return res.status(400).json({ error: 'Invalid News ID.' });
    }

    // Find the News by its ID
    const news = await News.findById(id);

    if (!news) {
      return res.status(404).json({ error: 'News not found.' });
    }

    const user = await User.findOne({id: userId});
    if (user.role === 'User')
    {
        return res.status(403).json({error: 'You are NOT allowed to perform this action'});
    }

    // Update the title and/or content properties of the News
    if (title) {
      news.title = title;
    }

    if (content) {
      news.content = content;
    }

    await news.save();

    return res.status(200).json({success: 'Content Successfully Updated'});
  } catch (err) {
    return res.status(500).json({ error: 'Server error while updating the News.' });
  }
}

async function deleteNews(req, res, News, Like, Review, User) {
  try {
    const { id } = req.params;

    // Validate News ID format
    if (!isValidObjectId(id)) {
      return res.status(400).json({ error: 'Invalid News ID.' });
    }

    // Find the News by its ID
    const news = await News.findById(id);

    if (!news) {
      return res.status(404).json({ error: 'News not found.' });
    }

    // Delete the News
    await News.findByIdAndDelete(id);

    // Response data indicating successful deletion
    const responseData = {
      message: 'News deleted successfully.',
    };

    return res.status(200).json(responseData);
  } catch (err) {
    return res.status(500).json({ error: 'Server error while deleting the News.' });
  }
}

async function toggleLikeNews(req, res, News, Like, Review, User) {
  try {
    const { userId } = req.body;
    const { id } = req.params;

    // Validate News ID format
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ error: 'Invalid Content ID.' });
    }

    // Check if the user has already liked the News
    const like = await Like.findOne({ user: userId, likeableId: id, likeableType: 'News' });

    if (!like) {
      // If the user has not liked the News, create a new Like document
      await Like.create({
        user: userId,
        likeableId: id,
        likeableType: 'News',
        liked: true,
      });

      return res.status(200).json({ message: 'Content liked successfully.' });
    }

    // If the user has already liked the News, toggle the state of the 'liked' property
    like.liked = !like.liked;
    await like.save();

    return res.status(200).json({ message: like.liked ? 'Content liked.' : 'Content unliked.' });
  } catch (err) {
    return res.status(500).json({ error: 'Server error while toggling like.' });
  }
}

async function shareNews(req, res, News, Like, Review, User) {
  try {
    const { id } = req.params;

    // Validate News ID format
    if (!isValidObjectId(id)) {
      return res.status(400).json({ error: 'Invalid News ID.' });
    }

    // Find the News by its ID and extract necessary information
    const news = await News.findById(id).select('title');
    if (!news) {
      return res.status(404).json({ error: 'News not found.' });
    }

    // Check if the News title is a valid string
    if (typeof news.title !== 'string' || news.title.trim() === '') {
      return res.status(500).json({ error: 'Invalid News title.' });
    }

    // Generate a unique identifier using the News ID (you can use any other method to generate a unique identifier)
    const uniqueIdentifier = id;

    // Generate the URL-friendly slug from the News title
    const slugifiedTitle = slugify(news.title, { lower: true, remove: /[*+~.()'"!:@]/g }); // Customize the remove option as needed

    // Append the unique identifier to the slugified title to create the shareable URL
    const shareableURL = `${process.env.HEADER}news/${slugifiedTitle}-${uniqueIdentifier}`;

    return res.status(200).json(shareableURL);
  } catch (err) {
    return res.status(500).json({ error: 'Server error while getting the shareable URL.' });
  }
}

async function commentNews(req, res, News, Like, Review, User) {
  try {
    const { id } = req.params;
    const { review, ratings, userId } = req.body;

    // Validate News ID format
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ error: 'Invalid News ID.' });
    }

    // Check if the News exists
    const news = await News.findById(id);
    if (!news) {
      return res.status(404).json({ error: 'News not found.' });
    }

    // Validate ratings
    if (!Number.isInteger(ratings) || ratings < 1 || ratings > 5) {
      return res.status(400).json({ error: 'Invalid ratings. Ratings must be between 1 and 5.' });
    }

    // Create or update the review
    let existingReview = await Review.findOne({ user: userId, product: id, commentType: 'News' });

    if (review) {
      // If review is provided in the request body, create/update the review
      if (existingReview) {
        existingReview.review = review;
        existingReview.ratings = ratings;
        await existingReview.save();
      } else {
        await Review.create({
          user: userId,
          product: id,
          commentType: 'News',
          review: review,
          ratings: ratings,
        });
      }
    } else {
      // If review is not provided, check if a review already exists and remove it
      if (existingReview) {
        await existingReview.remove();
      }
    }

    return res.status(200).json({ message: 'Review/comment updated successfully.' });
  } catch (err) {
    console.error('Error commenting on News:', err);
    return res.status(500).json({ error: 'Server error while commenting on the News.' });
  }
}

async function recentNews(req, res, News, Like, Review, User) {
    try {
      // Fetch Newss sorted by the "created_at" field in descending order
      const recentNewss = await News.find().sort({ created_at: -1 });
  
      return res.status(200).json(recentNewss);
    } catch (err) {
      return res.status(500).json({ error: 'Server error while fetching recent Newss.' });
    }
}

async function topNews(req, res, News, Like, Review, User) {
  try {
    const currentDate = new Date();
    const topNewss = await News.aggregate([
      {
        $lookup: {
          from: 'likes',
          localField: '_id',
          foreignField: 'likeableId',
          as: 'likes',
        },
      },
      {
        $lookup: {
          from: 'reviews',
          localField: '_id',
          foreignField: 'product',
          as: 'reviews',
        },
      },
      {
        $unwind: {
          path: '$likes',
          preserveNullAndEmptyArrays: true, // Handle Newss with no likes
        },
      },
      {
        $unwind: {
          path: '$reviews',
          preserveNullAndEmptyArrays: true, // Handle Newss with no reviews
        },
      },
      {
        $group: {
          _id: '$_id',
          title: { $first: '$title' },
          likes: { $sum: { $cond: [{ $eq: ['$likes.liked', true] }, 1, 0] } }, // Count the number of likes
          totalRatings: { $sum: '$reviews.ratings' }, // Sum of all ratings
          views: { $first: '$views' },
          created_at: { $first: '$created_at' },
        },
      },
      {
        $addFields: {
          ageInDays: {
            $divide: [
              { $subtract: [currentDate, '$created_at'] },
              1000 * 60 * 60 * 24, // Convert milliseconds to days
            ],
          },
        },
      },
      {
        $addFields: {
          score: {
            $add: [
              { $multiply: ['$likes', 0.4] },
              { $multiply: ['$views', 0.3] },
              { $multiply: ['$totalRatings', 0.2] },
              { $multiply: ['$ageInDays', 0.1] }, // Use the age of the News in days
            ],
          },
        },
      },
      {
        $sort: { score: -1 }, // Sort by score in descending order
      },
    ]);

    if (topNewss.length === 0) {
      return res.status(404).json({ error: 'No top Newss found.' });
    }

    return res.status(200).json(topNewss);
  } catch (err) {
    return res.status(500).json({ error: 'Server error while fetching top Newss.' });
  }
}

module.exports = {
  uploadNews,
  readNews,
  updateNews,
  deleteNews,
  toggleLikeNews,
  shareNews,
  commentNews,
  recentNews,
  topNews,
}
