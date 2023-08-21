const { isValidObjectId, mongoose } = require('mongoose');
const slugify = require('slugify');
require('dotenv').config();

const maxTextLength = 5000;

async function uploadInterviews(req, res, Interviews, Like, Reviews, User) {
    try {
      // Step 1: Check and process Interviews content (text or file)
      let content = '';
  
      if (req.body.text) {
        // Handle plain text upload
        content = req.body.text;
      } else {
        return res.status(400).json({ error: 'No Interviews content provided.' });
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

      const { video } = req.body;
      if (!video) {
        return res.status(400).json({ error: 'No video provided.' });
      }
  
      // Step 5: Store the list of category IDs in the database field
      const { categories } = req.body;
      const categoryIds = Array.isArray(categories) ? categories : [];
      if (categoryIds.some((categoryId) => !mongoose.isValidObjectId(categoryId))) {
        return res.status(400).json({ error: 'Invalid category provided.' });
      }
  
      // Step 6: Create a new Interviews instance and save it to the database
      const interviews = await Interviews.create({
        user: userId,
        content: content,
        thumbnail: thumbnailLink,
        title: title,
        category: categoryIds,
        video: video
      });
  
      // Respond with success
      return res.status(200).json({ message: 'Interviews uploaded successfully.', interviews });
    } catch (err) {
      return res.status(500).json({ error: 'Server error while uploading the Interviews.' });
    }
}  

async function readInterviews(req, res, Interviews, Like, Reviews, User) {
  try {
    const { id } = req.params;

    // Validate Interviews ID format
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ error: 'Invalid Interviews ID format.' });
    }

    // Find the Interviews by its ID and select specific fields
    const interviews = await Interviews.findById(id)
      .select('content video thumbnail category created_at user views')
      .populate('user', 'username dp')
      .populate('category', 'name');

    if (!interviews) {
      return res.status(404).json({ error: 'Interviews not found.' });
    }

    // Increment the view count for the Interviews
    interviews.views += 5;
    await interviews.save();

    const views = interviews.views;

    // Fetch likes for the magazine
    const likes = await Like.find({ likeableId: id, likeableType: 'Interviews' });

    // Fetch reviews for the magazine
    const reviews = await Reviews.find({ product: id, commentType: 'Interviews' });

    // Response data with Interviews details and user info
    const responseData = {
      content: interviews.content,
      thumbnail: interviews.thumbnail,
      category: interviews.category,
      created_at: interviews.created_at,
      views,
      user: {
        username: interviews.user.username,
        dp: interviews.user.dp,
      },
      video: interviews.video,
      likes,
      reviews
    };

    return res.status(200).json(responseData);
  } catch (err) {
    return res.status(500).json({ error: 'Server error while reading the Interviews.' });
  }
}

async function updateInterviews(req, res, Interviews, Like, Review, User) {
  try {
    const { id, userId } = req.params;
    const { title, content, video } = req.body; // Assuming both title and content can be provided in the request body

    // Validate Interviews ID format
    if (!isValidObjectId(id)) {
      return res.status(400).json({ error: 'Invalid Interviews ID.' });
    }

    // Find the Interviews by its ID
    const interviews = await Interviews.findById(id);

    if (!interviews) {
      return res.status(404).json({ error: 'Interviews not found.' });
    }

    const user = await User.findOne({id: userId});
    if (user.role === 'User')
    {
        return res.status(403).json({error: 'You are NOT allowed to perform this action'});
    }

    // Update the title and/or content properties of the Interviews
    if (video) {
        return res.status(403).json({error: 'Cannot change Video'});
      }
    
    if (title) {
      interviews.title = title;
    }

    if (content) {
      interviews.content = content;
    }

    await interviews.save();

    return res.status(200).json({success: 'Content Successfully Updated'});
  } catch (err) {
    return res.status(500).json({ error: 'Server error while updating the Interviews.' });
  }
}

async function deleteInterviews(req, res, Interviews, Like, Review, User) {
  try {
    const { id } = req.params;

    // Validate Interviews ID format
    if (!isValidObjectId(id)) {
      return res.status(400).json({ error: 'Invalid Interviews ID.' });
    }

    // Find the Interviews by its ID
    const interviews = await Interviews.findById(id);

    if (!interviews) {
      return res.status(404).json({ error: 'Interviews not found.' });
    }

    // Delete the Interviews
    await Interviews.findByIdAndDelete(id);

    // Response data indicating successful deletion
    const responseData = {
      message: 'Interviews deleted successfully.',
    };

    return res.status(200).json(responseData);
  } catch (err) {
    return res.status(500).json({ error: 'Server error while deleting the Interviews.' });
  }
}

async function toggleLikeInterviews(req, res, Interviews, Like, Review, User) {
  try {
    const { userId } = req.body;
    const { id } = req.params;

    // Validate Interviews ID format
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ error: 'Invalid Interviews ID.' });
    }

    // Check if the user has already liked the Interviews
    const like = await Like.findOne({ user: userId, likeableId: id, likeableType: 'Interviews' });

    if (!like) {
      // If the user has not liked the Interviews, create a new Like document
      await Like.create({
        user: userId,
        likeableId: id,
        likeableType: 'Interviews',
        liked: true,
      });

      return res.status(200).json({ message: 'Interviews liked successfully.' });
    }

    // If the user has already liked the Interviews, toggle the state of the 'liked' property
    like.liked = !like.liked;
    await like.save();

    return res.status(200).json({ message: like.liked ? 'Interviews liked.' : 'Interviews unliked.' });
  } catch (err) {
    return res.status(500).json({ error: 'Server error while toggling like.' });
  }
}

async function shareInterviews(req, res, Interviews, Like, Review, User) {
  try {
    const { id } = req.params;

    // Validate Interviews ID format
    if (!isValidObjectId(id)) {
      return res.status(400).json({ error: 'Invalid Interviews ID.' });
    }

    // Find the Interviews by its ID and extract necessary information
    const interviews = await Interviews.findById(id).select('title');
    if (!interviews) {
      return res.status(404).json({ error: 'Interviews not found.' });
    }

    // Check if the Interviews title is a valid string
    if (typeof interviews.title !== 'string' || interviews.title.trim() === '') {
      return res.status(500).json({ error: 'Invalid Interviews title.' });
    }

    // Generate a unique identifier using the Interviews ID (you can use any other method to generate a unique identifier)
    const uniqueIdentifier = id;

    // Generate the URL-friendly slug from the Interviews title
    const slugifiedTitle = slugify(interviews.title, { lower: true, remove: /[*+~.()'"!:@]/g }); // Customize the remove option as needed

    // Append the unique identifier to the slugified title to create the shareable URL
    const shareableURL = `${process.env.HEADER}interviews/${slugifiedTitle}-${uniqueIdentifier}`;

    return res.status(200).json(shareableURL);
  } catch (err) {
    return res.status(500).json({ error: 'Server error while getting the shareable URL.' });
  }
}

async function commentInterviews(req, res, Interviews, Like, Review, User) {
  try {
    const { id } = req.params;
    const { review, ratings, userId } = req.body;

    // Validate Interviews ID format
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ error: 'Invalid Interviews ID.' });
    }

    // Check if the Interviews exists
    const interviews = await Interviews.findById(id);
    if (!interviews) {
      return res.status(404).json({ error: 'Interviews not found.' });
    }

    // Validate ratings
    if (!Number.isInteger(ratings) || ratings < 1 || ratings > 5) {
      return res.status(400).json({ error: 'Invalid ratings. Ratings must be between 1 and 5.' });
    }

    // Create or update the review
    let existingReview = await Review.findOne({ user: userId, product: id, commentType: 'Interviews' });

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
          commentType: 'Interviews',
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
    console.error('Error commenting on Interviews:', err);
    return res.status(500).json({ error: 'Server error while commenting on the Interviews.' });
  }
}

async function recentInterviews(req, res, Interviews, Like, Review, User) {
    try {
      // Fetch Interviewss sorted by the "created_at" field in descending order
      const recentInterviewss = await Interviews.find().sort({ created_at: -1 });
  
      return res.status(200).json(recentInterviewss);
    } catch (err) {
      return res.status(500).json({ error: 'Server error while fetching recent Interviewss.' });
    }
}

async function topInterviews(req, res, Interviews, Like, Review, User) {
  try {
    const currentDate = new Date();
    const topInterviewss = await Interviews.aggregate([
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
          preserveNullAndEmptyArrays: true, // Handle Interviewss with no likes
        },
      },
      {
        $unwind: {
          path: '$reviews',
          preserveNullAndEmptyArrays: true, // Handle Interviewss with no reviews
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
              { $multiply: ['$ageInDays', 0.1] }, // Use the age of the Interviews in days
            ],
          },
        },
      },
      {
        $sort: { score: -1 }, // Sort by score in descending order
      },
    ]);

    if (topInterviewss.length === 0) {
      return res.status(404).json({ error: 'No top Interviewss found.' });
    }

    return res.status(200).json(topInterviewss);
  } catch (err) {
    return res.status(500).json({ error: 'Server error while fetching top Interviewss.' });
  }
}

module.exports = {
  uploadInterviews,
  readInterviews,
  updateInterviews,
  deleteInterviews,
  toggleLikeInterviews,
  shareInterviews,
  commentInterviews,
  recentInterviews,
  topInterviews,
}
