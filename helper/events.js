const { isValidObjectId, mongoose } = require('mongoose');
const slugify = require('slugify');
require('dotenv').config();

const maxTextLength = 5000;

async function uploadEvents(req, res, Events, Like, Reviews, User) {
    try {
      // Step 1: Check and process Events content (text or file)
      let content = '';
  
      if (req.body.text) {
        // Handle plain text upload
        content = req.body.text;
      } else {
        return res.status(400).json({ error: 'No Events content provided.' });
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
  
      // Step 6: Create a new Events instance and save it to the database
      const events = await Events.create({
        user: userId,
        content: content,
        thumbnail: thumbnailLink,
        title: title,
        category: categoryIds,
      });
  
      // Respond with success
      return res.status(200).json({ message: 'Events uploaded successfully.', events });
    } catch (err) {
      return res.status(500).json({ error: 'Server error while uploading the Events.' });
    }
}  

async function readEvents(req, res, Events, Like, Reviews, User) {
  try {
    const { id } = req.params;

    // Validate Events ID format
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ error: 'Invalid Events ID format.' });
    }

    // Find the Events by its ID and select specific fields
    const events = await Events.findById(id)
      .select('content thumbnail category created_at user views')
      .populate('user', 'username dp')
      .populate('category', 'name');

    if (!events) {
      return res.status(404).json({ error: 'Events not found.' });
    }

    // Increment the view count for the Events
    events.views += 5;
    await events.save();

    const views = events.views;

    // Fetch likes for the magazine
    const likes = await Like.find({ likeableId: id, likeableType: 'Events' });

    // Fetch reviews for the magazine
    const reviews = await Reviews.find({ product: id, commentType: 'Events' });

    // Response data with Events details and user info
    const responseData = {
      content: events.content,
      thumbnail: events.thumbnail,
      category: events.category,
      created_at: events.created_at,
      views,
      user: {
        username: events.user.username,
        dp: events.user.dp,
      },
      likes,
      reviews
    };

    return res.status(200).json(responseData);
  } catch (err) {
    return res.status(500).json({ error: 'Server error while reading the Events.' });
  }
}

async function updateEvents(req, res, Events, Like, Review, User) {
  try {
    const { id, userId } = req.params;
    const { title, content } = req.body; // Assuming both title and content can be provided in the request body

    // Validate Events ID format
    if (!isValidObjectId(id)) {
      return res.status(400).json({ error: 'Invalid Events ID.' });
    }

    // Find the Events by its ID
    const events = await Events.findById(id);

    if (!events) {
      return res.status(404).json({ error: 'Events not found.' });
    }

    const user = await User.findOne({id: userId});
    if (user.role !== 'Admin' && user.role !== 'Co-founder')
    {
        return res.status(403).json({error: 'You are NOT allowed to perform this action'});
    }

    // Update the title and/or content properties of the Events
    if (title) {
      events.title = title;
    }

    if (content) {
      events.content = content;
    }

    await events.save();

    return res.status(200).json({success: 'Content Successfully Updated'});
  } catch (err) {
    return res.status(500).json({ error: 'Server error while updating the Events.' });
  }
}

async function deleteEvents(req, res, Events, Like, Review, User) {
  try {
    const { id } = req.params;

    // Validate Events ID format
    if (!isValidObjectId(id)) {
      return res.status(400).json({ error: 'Invalid Events ID.' });
    }

    // Find the Events by its ID
    const events = await Events.findById(id);

    if (!events) {
      return res.status(404).json({ error: 'Events not found.' });
    }

    // Delete the Events
    await Events.findByIdAndDelete(id);

    // Response data indicating successful deletion
    const responseData = {
      message: 'Events deleted successfully.',
    };

    return res.status(200).json(responseData);
  } catch (err) {
    return res.status(500).json({ error: 'Server error while deleting the Events.' });
  }
}

async function toggleLikeEvents(req, res, Events, Like, Review, User) {
  try {
    const { userId } = req.body;
    const { id } = req.params;

    // Validate Events ID format
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ error: 'Invalid Events ID.' });
    }

    // Check if the user has already liked the Events
    const like = await Like.findOne({ user: userId, likeableId: id, likeableType: 'Events' });

    if (!like) {
      // If the user has not liked the Events, create a new Like document
      await Like.create({
        user: userId,
        likeableId: id,
        likeableType: 'Events',
        liked: true,
      });

      return res.status(200).json({ message: 'Events liked successfully.' });
    }

    // If the user has already liked the Events, toggle the state of the 'liked' property
    like.liked = !like.liked;
    await like.save();

    return res.status(200).json({ message: like.liked ? 'Events liked.' : 'Events unliked.' });
  } catch (err) {
    return res.status(500).json({ error: 'Server error while toggling like.' });
  }
}

async function shareEvents(req, res, Events, Like, Review, User) {
  try {
    const { id } = req.params;

    // Validate Events ID format
    if (!isValidObjectId(id)) {
      return res.status(400).json({ error: 'Invalid Events ID.' });
    }

    // Find the Events by its ID and extract necessary information
    const events = await Events.findById(id).select('title');
    if (!events) {
      return res.status(404).json({ error: 'Events not found.' });
    }

    // Check if the Events title is a valid string
    if (typeof events.title !== 'string' || events.title.trim() === '') {
      return res.status(500).json({ error: 'Invalid Events title.' });
    }

    // Generate a unique identifier using the Events ID (you can use any other method to generate a unique identifier)
    const uniqueIdentifier = id;

    // Generate the URL-friendly slug from the Events title
    const slugifiedTitle = slugify(events.title, { lower: true, remove: /[*+~.()'"!:@]/g }); // Customize the remove option as needed

    // Append the unique identifier to the slugified title to create the shareable URL
    const shareableURL = `${process.env.HEADER}events/${slugifiedTitle}-${uniqueIdentifier}`;

    return res.status(200).json(shareableURL);
  } catch (err) {
    return res.status(500).json({ error: 'Server error while getting the shareable URL.' });
  }
}

async function commentEvents(req, res, Events, Like, Review, User) {
  try {
    const { id } = req.params;
    const { review, ratings, userId } = req.body;

    // Validate Events ID format
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ error: 'Invalid Events ID.' });
    }

    // Check if the Events exists
    const events = await Events.findById(id);
    if (!events) {
      return res.status(404).json({ error: 'Events not found.' });
    }

    // Validate ratings
    if (!Number.isInteger(ratings) || ratings < 1 || ratings > 5) {
      return res.status(400).json({ error: 'Invalid ratings. Ratings must be between 1 and 5.' });
    }

    // Create or update the review
    let existingReview = await Review.findOne({ user: userId, product: id, commentType: 'Events' });

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
          commentType: 'Events',
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
    console.error('Error commenting on Events:', err);
    return res.status(500).json({ error: 'Server error while commenting on the Events.' });
  }
}

async function recentEvents(req, res, Events, Like, Review, User) {
    try {
      // Fetch Eventss sorted by the "created_at" field in descending order
      const recentEventss = await Events.find().sort({ created_at: -1 });
  
      return res.status(200).json(recentEventss);
    } catch (err) {
      return res.status(500).json({ error: 'Server error while fetching recent Eventss.' });
    }
}

async function topEvents(req, res, Events, Like, Review, User) {
  try {
    const currentDate = new Date();
    const topEventss = await Events.aggregate([
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
          preserveNullAndEmptyArrays: true, // Handle Eventss with no likes
        },
      },
      {
        $unwind: {
          path: '$reviews',
          preserveNullAndEmptyArrays: true, // Handle Eventss with no reviews
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
              { $multiply: ['$ageInDays', 0.1] }, // Use the age of the Events in days
            ],
          },
        },
      },
      {
        $sort: { score: -1 }, // Sort by score in descending order
      },
    ]);

    if (topEventss.length === 0) {
      return res.status(404).json({ error: 'No top Eventss found.' });
    }

    return res.status(200).json(topEventss);
  } catch (err) {
    return res.status(500).json({ error: 'Server error while fetching top Eventss.' });
  }
}

module.exports = {
  uploadEvents,
  readEvents,
  updateEvents,
  deleteEvents,
  toggleLikeEvents,
  shareEvents,
  commentEvents,
  recentEvents,
  topEvents,
}
