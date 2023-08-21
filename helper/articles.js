const { isValidObjectId, mongoose } = require('mongoose');
const slugify = require('slugify');
require('dotenv').config();

const maxTextLength = 5000;

async function uploadArticle(req, res, Article, User) {
  try {
    // Step 1: Check and process article content (text or file)
    let content = '';

    if (req.body.text) {
      // Handle plain text upload
      content = req.body.text;
    } else {
      return res.status(400).json({ error: 'No article content provided.' });
    }

    // Step 2: Validate and store user ID
    const {userId} = req.body;
    if (!userId)
    {
      return res.status(403).json({error: 'User Not Found'});
    }
    const user = await User.findOne({_id: userId});
    if (!user)
    {
      return res.status(403).json({error: 'User Not Found'});
    }
    else if (user.role === 'User')
    {
      return res.status(401).json({error: 'You are NOT allowed to publish content'});
    }

    // Step 3: Store the Google Drive link directly in the database as the thumbnail
    const { thumbnailLink } = req.body;
    if (!thumbnailLink) {
      return res.status(400).json({ error: 'No thumbnail link provided.' });
    }

    const { title } = req.body;
    if (!title) {
      return res.status(400).json({ error: 'No title provided.' });
    }

    // Step 4: Store the list of category IDs in the database field
    const { categories } = req.body;
    const categoryIds = Array.isArray(categories) ? categories : [];
    if (categoryIds.some((categoryId) => !mongoose.isValidObjectId(categoryId))) {
      return res.status(400).json({ error: 'Invalid category provided.' });
    }

    // Create a new Article instance and save it to the database
    const article = await Article.create({
      author: userId,
      content: content,
      thumbnail: thumbnailLink,
      title: title,
      category: categoryIds,
    });
    await article.save();

    // Respond with success
    return res.status(200).send('Article uploaded successfully.');
  } catch (err) {
    console.error('Error uploading article:', err);
    return res.status(500).json({ error: 'Server error while uploading the article.' });
  }
}

async function readArticle(req, res, Article, User) {
  try {
    const { id } = req.params;

    // Validate article ID format
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ error: 'Invalid article ID format.' });
    }

    // Find the article by its ID and select specific fields
    const article = await Article.findById(id)
      .select('content thumbnail category created_at author views')
      .populate('author', 'username dp')
      .populate('category', 'name');

    if (!article) {
      return res.status(404).json({ error: 'Article not found.' });
    }

    // Increment the view count for the article
    article.views += 5;
    await article.save();

    const views = article.views;

    // Fetch likes for the magazine
    const likes = await Like.find({ likeableId: id, likeableType: 'Article' });

    // Fetch reviews for the magazine
    const reviews = await Reviews.find({ product: id, commentType: 'Article' });

    // Response data with article details and author info
    const responseData = {
      content: article.content,
      thumbnail: article.thumbnail,
      category: article.category,
      created_at: article.created_at,
      views,
      author: {
        username: article.author.username,
        dp: article.author.dp,
      },
      likes,
      reviews
    };

    return res.status(200).json(responseData);
  } catch (err) {
    return res.status(500).json({ error: 'Server error while reading the article.' });
  }
}

async function updateArticle(req, res, Article, User) {
  try {
    const { id, userId } = req.params;
    const { title, content } = req.body; // Assuming both title and content can be provided in the request body

    // Validate article ID format
    if (!isValidObjectId(id)) {
      return res.status(400).json({ error: 'Invalid article ID.' });
    }

    // Find the article by its ID
    const article = await Article.findById(id);

    if (!article) {
      return res.status(404).json({ error: 'Article not found.' });
    }

    const user = await User.findOne({id: userId});
    if (user.role !== 'Admin' && user.role !== 'Co-founder')
    {
        return res.status(403).json({error: 'You are NOT allowed to perform this action'});
    }

    // Update the title and/or content properties of the article
    if (title) {
      article.title = title;
    }

    if (content) {
      article.content = content;
    }

    await article.save();

    return res.status(200).json({success: 'Content Successfully Updated'});
  } catch (err) {
    return res.status(500).json({ error: 'Server error while updating the article.' });
  }
}

async function deleteArticle(req, res, Article, User) {
  try {
    const { id } = req.params;

    // Validate article ID format
    if (!isValidObjectId(id)) {
      return res.status(400).json({ error: 'Invalid article ID.' });
    }

    // Find the article by its ID
    const article = await Article.findById(id);

    if (!article) {
      return res.status(404).json({ error: 'Article not found.' });
    }

    // Delete the article
    await Article.findByIdAndDelete(id);

    // Response data indicating successful deletion
    const responseData = {
      message: 'Article deleted successfully.',
    };

    return res.status(200).json(responseData);
  } catch (err) {
    return res.status(500).json({ error: 'Server error while deleting the article.' });
  }
}

async function toggleLikeArticle(req, res, Article, Like, User) {
  try {
    const { userId } = req.body;
    const { id } = req.params;

    // Validate article ID format
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ error: 'Invalid article ID.' });
    }

    // Check if the user has already liked the article
    const like = await Like.findOne({ user: userId, likeableId: id, likeableType: 'Article' });

    if (!like) {
      // If the user has not liked the article, create a new Like document
      await Like.create({
        user: userId,
        likeableId: id,
        likeableType: 'Article',
        liked: true,
      });

      return res.status(200).json({ message: 'Article liked successfully.' });
    }

    // If the user has already liked the article, toggle the state of the 'liked' property
    like.liked = !like.liked;
    await like.save();

    return res.status(200).json({ message: like.liked ? 'Article liked.' : 'Article unliked.' });
  } catch (err) {
    console.error('Error toggling like for article:', err);
    return res.status(500).json({ error: 'Server error while toggling like.' });
  }
}

async function shareArticle(req, res, Article, User) {
  try {
    const { id } = req.params;

    // Validate article ID format
    if (!isValidObjectId(id)) {
      return res.status(400).json({ error: 'Invalid article ID.' });
    }

    // Find the article by its ID and extract necessary information
    const article = await Article.findById(id).select('title');
    if (!article) {
      return res.status(404).json({ error: 'Article not found.' });
    }

    // Check if the article title is a valid string
    if (typeof article.title !== 'string' || article.title.trim() === '') {
      return res.status(500).json({ error: 'Invalid article title.' });
    }

    // Generate a unique identifier using the article ID (you can use any other method to generate a unique identifier)
    const uniqueIdentifier = id;

    // Generate the URL-friendly slug from the article title
    const slugifiedTitle = slugify(article.title, { lower: true, remove: /[*+~.()'"!:@]/g }); // Customize the remove option as needed

    // Append the unique identifier to the slugified title to create the shareable URL
    const shareableURL = `${process.env.HEADER}articles/${slugifiedTitle}-${uniqueIdentifier}`;

    return res.status(200).json(shareableURL);
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: 'Server error while getting the shareable URL.' });
  }
}

async function commentArticle(req, res, Article, Review, User) {
  try {
    const { id } = req.params;
    const { review, ratings, userId } = req.body;

    // Validate article ID format
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ error: 'Invalid article ID.' });
    }

    // Check if the article exists
    const article = await Article.findById(id);
    if (!article) {
      return res.status(404).json({ error: 'Article not found.' });
    }

    // Validate ratings
    if (!Number.isInteger(ratings) || ratings < 1 || ratings > 5) {
      return res.status(400).json({ error: 'Invalid ratings. Ratings must be between 1 and 5.' });
    }

    // Create or update the review
    let existingReview = await Review.findOne({ user: userId, product: id, commentType: 'Article' });

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
          commentType: 'Article',
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
    console.error('Error commenting on article:', err);
    return res.status(500).json({ error: 'Server error while commenting on the article.' });
  }
}

async function recentArticle(req, res, Article, User) {
    try {
      // Fetch articles sorted by the "created_at" field in descending order
      const recentArticles = await Article.find().sort({ created_at: -1 });
  
      return res.status(200).json(recentArticles);
    } catch (err) {
      return res.status(500).json({ error: 'Server error while fetching recent articles.' });
    }
}

async function topArticle(req, res, Article, User) {
  try {
    const currentDate = new Date();
    const topArticles = await Article.aggregate([
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
          preserveNullAndEmptyArrays: true, // Handle articles with no likes
        },
      },
      {
        $unwind: {
          path: '$reviews',
          preserveNullAndEmptyArrays: true, // Handle articles with no reviews
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
              { $multiply: ['$ageInDays', 0.1] }, // Use the age of the article in days
            ],
          },
        },
      },
      {
        $sort: { score: -1 }, // Sort by score in descending order
      },
    ]);

    if (topArticles.length === 0) {
      return res.status(404).json({ error: 'No top articles found.' });
    }

    return res.status(200).json(topArticles);
  } catch (err) {
    return res.status(500).json({ error: 'Server error while fetching top articles.' });
  }
}

module.exports = {
  uploadArticle,
  readArticle,
  updateArticle,
  deleteArticle,
  toggleLikeArticle,
  shareArticle,
  commentArticle,
  recentArticle,
  topArticle,
}
