const { isValidObjectId, mongoose } = require('mongoose');
const slugify = require('slugify');
require('dotenv').config();

const maxTextLength = 5000;

async function uploadMagazine(req, res, Magazine, User) {
  try {
    // Step 1: Check and process Magazine content (text or file)
    let desc = '';

    if (req.body.desc) {
      // Handle plain text upload
      desc = req.body.desc;
    } else {
      return res.status(400).json({ error: 'No Magazine description provided.' });
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
    const { cover } = req.body;
    if (!cover) {
      return res.status(400).json({ error: 'No cover provided.' });
    }

    const { title } = req.body;
    if (!title) {
      return res.status(400).json({ error: 'No title provided.' });
    }

    // Step 4: Store the list of category IDs in the database field
    const { file } = req.body;
    if (!file) {
      return res.status(400).json({ error: 'No file provided' });
    }

    // Create a new Magazine instance and save it to the database
    const magazine = await Magazine.create({
      description: desc,
      file: file,
      title: title,
      cover: cover,
    });
    await magazine.save();

    // Respond with success
    return res.status(200).send('Magazine uploaded successfully.');
  } catch (err) {
    console.error('Error uploading Magazine:', err);
    return res.status(500).json({ error: 'Server error while uploading the Magazine.' });
  }
}

async function readMagazine(req, res, Magazine, Like, Reviews, User) {
  try {
    const { id } = req.params;

    // Validate Magazine ID format
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ error: 'Invalid Magazine ID format.' });
    }

    // Find the Magazine by its ID and select specific fields
    const magazine = await Magazine.findById(id);

    if (!magazine) {
      return res.status(404).json({ error: 'Magazine not found.' });
    }

    // Increment the view count for the Magazine
    magazine.downloads += 5;
    await magazine.save();

    const downloads = magazine.downloads;

    // Fetch likes for the magazine
    const likes = await Like.find({ likeableId: id, likeableType: 'Magazine' });

    // Fetch reviews for the magazine
    const reviews = await Reviews.find({ product: id, commentType: 'Magazine' });

    // Response data with Magazine details and author info
    const responseData = {
      description: magazine.description,
      cover: magazine.cover,
      file: magazine.file,
      created_at: magazine.created_at,
      downloads,
      likes,
      reviews,
    };

    return res.status(200).json(responseData);
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: 'Server error while reading the Magazine.' });
  }
}

async function updateMagazine(req, res, Magazine, User) {
  try {
    const { id, userId } = req.params;
    const { title, desc, cover, file, } = req.body; // Assuming both title and content can be provided in the request body

    // Validate Magazine ID format
    if (!isValidObjectId(id)) {
      return res.status(400).json({ error: 'Invalid Magazine ID.' });
    }

    // Find the Magazine by its ID
    const magazine = await Magazine.findById(id);

    if (!magazine) {
      return res.status(404).json({ error: 'Magazine not found.' });
    }

    const user = await User.findOne({id: userId});
    if (user.role !== 'Admin' && user.role !== 'Co-founder')
    {
        return res.status(403).json({error: 'You are NOT allowed to perform this action'});
    }

    // Update the title and/or content properties of the Magazine
    if (title) {
      magazine.title = title;
    }

    if (desc) {
      magazine.description = desc;
    }

    if (cover) {
        magazine.cover = cover;
    }

    if (file) {
        magazine.file = file;
    }

    await magazine.save();

    return res.status(200).json({success: 'Content Successfully Updated'});
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: 'Server error while updating the Magazine.' });
  }
}

async function deleteMagazine(req, res, Magazine, User) {
  try {
    const { id } = req.params;

    // Validate Magazine ID format
    if (!isValidObjectId(id)) {
      return res.status(400).json({ error: 'Invalid Magazine ID.' });
    }

    // Find the Magazine by its ID
    const magazine = await Magazine.findById(id);

    if (!magazine) {
      return res.status(404).json({ error: 'Magazine not found.' });
    }

    // Delete the Magazine
    await Magazine.findByIdAndDelete(id);

    // Response data indicating successful deletion
    const responseData = {
      message: 'Magazine deleted successfully.',
    };

    return res.status(200).json(responseData);
  } catch (err) {
    return res.status(500).json({ error: 'Server error while deleting the Magazine.' });
  }
}

async function toggleLikeMagazine(req, res, Magazine, Like, User) {
  try {
    const { userId } = req.body;
    const { id } = req.params;

    // Validate Magazine ID format
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ error: 'Invalid Magazine ID.' });
    }

    // Check if the user has already liked the Magazine
    const like = await Like.findOne({ user: userId, likeableId: id, likeableType: 'Magazine' });

    if (!like) {
      // If the user has not liked the Magazine, create a new Like document
      await Like.create({
        user: userId,
        likeableId: id,
        likeableType: 'Magazine',
        liked: true,
      });

      return res.status(200).json({ message: 'Magazine liked successfully.' });
    }

    // If the user has already liked the Magazine, toggle the state of the 'liked' property
    like.liked = !like.liked;
    await like.save();

    return res.status(200).json({ message: like.liked ? 'Magazine liked.' : 'Magazine unliked.' });
  } catch (err) {
    console.error('Error toggling like for Magazine:', err);
    return res.status(500).json({ error: 'Server error while toggling like.' });
  }
}

async function shareMagazine(req, res, Magazine, User) {
  try {
    const { id } = req.params;

    // Validate Magazine ID format
    if (!isValidObjectId(id)) {
      return res.status(400).json({ error: 'Invalid Magazine ID.' });
    }

    // Find the Magazine by its ID and extract necessary information
    const magazine = await Magazine.findById(id).select('title');
    if (!magazine) {
      return res.status(404).json({ error: 'Magazine not found.' });
    }

    // Check if the Magazine title is a valid string
    if (typeof magazine.title !== 'string' || magazine.title.trim() === '') {
      return res.status(500).json({ error: 'Invalid Magazine title.' });
    }

    // Generate a unique identifier using the Magazine ID (you can use any other method to generate a unique identifier)
    const uniqueIdentifier = id;

    // Generate the URL-friendly slug from the Magazine title
    const slugifiedTitle = slugify(magazine.title, { lower: true, remove: /[*+~.()'"!:@]/g }); // Customize the remove option as needed

    // Append the unique identifier to the slugified title to create the shareable URL
    const shareableURL = `${process.env.HEADER}magazine/${slugifiedTitle}-${uniqueIdentifier}`;

    return res.status(200).json(shareableURL);
  } catch (err) {
    return res.status(500).json({ error: 'Server error while getting the shareable URL.' });
  }
}

async function commentMagazine(req, res, Magazine, Review, User) {
  try {
    const { id } = req.params;
    const { review, ratings, userId } = req.body;

    // Validate Magazine ID format
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ error: 'Invalid Magazine ID.' });
    }

    // Check if the Magazine exists
    const magazine = await Magazine.findById(id);
    if (!magazine) {
      return res.status(404).json({ error: 'Magazine not found.' });
    }

    // Validate ratings
    if (!Number.isInteger(ratings) || ratings < 1 || ratings > 5) {
      return res.status(400).json({ error: 'Invalid ratings. Ratings must be between 1 and 5.' });
    }

    // Create or update the review
    let existingReview = await Review.findOne({ user: userId, product: id, commentType: 'Magazine' });

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
          commentType: 'Magazine',
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
    console.error('Error commenting on Magazine:', err);
    return res.status(500).json({ error: 'Server error while commenting on the Magazine.' });
  }
}

async function recentMagazine(req, res, Magazine, User) {
    try {
      // Fetch Magazines sorted by the "created_at" field in descending order
      const recentMagazines = await Magazine.find().sort({ created_at: -1 });
  
      return res.status(200).json(recentMagazines);
    } catch (err) {
      return res.status(500).json({ error: 'Server error while fetching recent Magazines.' });
    }
}

async function downloadMagazine(req, res, Magazine, User) {
    try {
        const { id } = req.params;
        const magazine = await Magazine.findById(id);
        const pdfLink = magazine.file; // Assuming `file` contains the URL of the PDF
        res.status(200).json({ pdfLink });
      } catch (error) {
        res.status(500).json({ error: 'Server error while fetching PDF.' });
      }
}

module.exports = {
  uploadMagazine,
  readMagazine,
  updateMagazine,
  deleteMagazine,
  toggleLikeMagazine,
  shareMagazine,
  commentMagazine,
  recentMagazine,
  downloadMagazine,
}