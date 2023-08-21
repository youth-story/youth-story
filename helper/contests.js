const { isValidObjectId, mongoose } = require('mongoose');
const slugify = require('slugify');
require('dotenv').config();

const maxTextLength = 5000;

async function uploadCareers(req, res, Careers, Applicant, User) {
  try {
    // Step 1: Check and process Careers content (text or file)
    const {userId, job_title, job_description, type, pay} = req.body;

    // Step 2: Validate and store user ID
    if (!userId)
    {
      return res.status(403).json({error: 'User Not Found'});
    }
    const user = await User.findOne({_id: userId});
    if (!user)
    {
      return res.status(403).json({error: 'User Not Found'});
    }

    // Step 3: Store the Google Drive link directly in the database as the thumbnail
    if (!job_title || !job_description || !type || !pay || !job_title.trim().length || !job_description.trim().length) {
      return res.status(400).json({ error: 'Please provide all details' });
    }

    // Create a new Careers instance and save it to the database
    const careers = await Careers.create({
        job_title: job_title,
        job_description: job_description,
        type: type,
        pay: pay,
        listed_by: userId
    });
    await careers.save();

    // Respond with success
    return res.status(200).send('Careers uploaded successfully.');
  } catch (err) {
    return res.status(500).json({ error: 'Server error while uploading the Careers.' });
  }
}

async function readCareers(req, res, Careers, Applicant, User) {
    try {
      const { id, userId } = req.params;
  
      // Validate Careers ID format
      if (!mongoose.isValidObjectId(id)) {
        return res.status(400).json({ error: 'Invalid Careers ID format.' });
      }
  
      // Find the Careers by its ID and select specific fields
      const careers = await Careers.findById(id)
        .select('job_title job_description listed_by type pay status views createdAt')
        .populate('listed_by', 'username dp');
  
      if (!careers) {
        return res.status(404).json({ error: 'Careers not found.' });
      }
  
      // Check if the user is the lister
      const isLister = careers.listed_by._id.equals(userId);
  
      // Increment the view count for the Careers
      careers.views += 5;
      await careers.save();
  
      const views = careers.views;
  
      // Fetch applicants' details if the user is the lister
      let applicants = [];
      if (isLister) {
        applicants = await Applicant.find({ career: id })
          .populate('user', 'username dp')
          .select('user resume message');
      }
  
      // Response data with Careers details and lister info
      let responseData = {
        job_title: careers.job_title,
        job_description: careers.job_description,
        listed_by: {
          username: careers.listed_by.username,
          dp: careers.listed_by.dp,
        },
        type: careers.type,
        pay: careers.pay,
        status: careers.status,
        views,
        createdAt: careers.createdAt,
      };
  
      // Include applicants' details if the user is the lister
      if (isLister) {
        responseData = {
          ...responseData,
          applicants: applicants.map((applicant) => ({
            name: applicant.user.username,
            dp: applicant.user.dp,
            resume: applicant.resume,
            message: applicant.message,
          })),
        };
      }
  
      return res.status(200).json(responseData);
    } catch (err) {
      console.log(err);
      return res.status(500).json({ error: 'Server error while reading the Careers.' });
    }
}  

async function updateCareers(req, res, Careers, Applicant, User) {
  try {
    const { id } = req.params;
    const { title, desc, type, pay, status, userId } = req.body; // Assuming both title and content can be provided in the request body

    // Validate Careers ID format
    if (!isValidObjectId(id)) {
      return res.status(400).json({ error: 'Invalid Careers ID.' });
    }

    // Find the Careers by its ID
    const careers = await Careers.findById(id);

    if (!careers) {
      return res.status(404).json({ error: 'Careers not found.' });
    }

    if (careers.listed_by != userId)
    {
        console.log(careers.listed_by, userId);
        return res.status(403).json({error: 'You are NOT allowed to perform this action'});
    }

    // Update the title and/or content properties of the Careers
    if (title) {
      careers.title = title;
    }

    if (desc) {
      careers.job_description = desc;
    }

    if (type)
    {
        careers.type = type;
    }

    if (pay)
    {
        careers.pay = pay;
    }

    if (status != 1 && status != 0)
    {
        return res.status(400).json({error: 'Wrong status sent'});
    }
    else
    {
        careers.status = status;
    }

    await careers.save();

    return res.status(200).json({success: 'Content Successfully Updated'});
  } catch (err) {
    return res.status(500).json({ error: 'Server error while updating the Careers.' });
  }
}

async function deleteCareers(req, res, Careers, Applicant, User) {
  try {
    const { id } = req.params;
    const {userId} = req.body;

    // Validate Careers ID format
    if (!isValidObjectId(id)) {
      return res.status(400).json({ error: 'Invalid Careers ID.' });
    }

    // Find the Careers by its ID
    const careers = await Careers.findById(id);

    if (!careers) {
      return res.status(404).json({ error: 'Careers not found.' });
    }

    if (careers.listed_by != userId)
    {
        return res.status(403).json({error: 'You are NOT allowed to perform this action'});
    }

    // Delete the Careers
    await Careers.findByIdAndDelete(id);

    // Response data indicating successful deletion
    const responseData = {
      message: 'Careers deleted successfully.',
    };

    return res.status(200).json(responseData);
  } catch (err) {
    return res.status(500).json({ error: 'Server error while deleting the Careers.' });
  }
}

async function shareCareers(req, res, Careers, Applicant, User) {
    try {
      const { id } = req.params;
  
      // Validate Careers ID format
      if (!isValidObjectId(id)) {
        return res.status(400).json({ error: 'Invalid Careers ID.' });
      }
  
      // Find the Careers by its ID and extract necessary information
      const careers = await Careers.findById(id).select('job_title');
      if (!careers) {
        return res.status(404).json({ error: 'Careers not found.' });
      }
  
      // Check if the Careers title is a valid string
      if (typeof careers.job_title !== 'string' || careers.job_title.trim() === '') {
        return res.status(400).json({ error: 'Invalid Careers title.' });
      }
  
      // Generate a unique identifier using the Careers ID (you can use any other method to generate a unique identifier)
      const uniqueIdentifier = id;
  
      // Generate the URL-friendly slug from the Careers title
      const slugifiedTitle = slugify(careers.job_title, { lower: true, remove: /[*+~.()'"!:@]/g }); // Customize the remove option as needed
  
      // Append the unique identifier to the slugified title to create the shareable URL
      const shareableURL = `${process.env.HEADER}careers/${slugifiedTitle}-${uniqueIdentifier}`;
  
      return res.status(200).json(shareableURL);
    } catch (err) {
      return res.status(500).json({ error: 'Server error while getting the shareable URL.' });
    }
}  

async function applyCareers(req, res, Careers, Applicant, User) {
  try {
    const { id } = req.params;
    const { resume, message , userId } = req.body;

    // Validate Careers ID format
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ error: 'Invalid Careers ID.' });
    }
    if (!mongoose.isValidObjectId(userId)) {
        return res.status(400).json({ error: 'User not found' });
      }

    if (!resume || !message)
    {
        return res.status(400).json({error: 'Please fill all details'});
    }

    const careers = await Careers.findById(id);

    if (careers.listed_by == userId)
    {
        return res.status(400).json({error: 'You cannot apply to your own job post'});
    }

    if (careers.status == 0)
    {
        return res.status(400).json({error: 'This job post is not accepting new applications'});
    }

    const applicant = new Applicant({
        user: userId,
        career: id,
        resume: resume,
        message: message,
    });

    await applicant.save();

    return res.status(200).json({success: 'Your application is recorded'});

  } catch (err) {
    return res.status(500).json({ error: 'Server error while sending job application' });
  }
}

async function recentCareers(req, res, Careers, Applicant, User) {
    try {
      // Fetch Careerss sorted by the "created_at" field in descending order
      const recentCareerss = await Careers.find().sort({ created_at: -1 });
  
      return res.status(200).json(recentCareerss);
    } catch (err) {
      return res.status(500).json({ error: 'Server error while fetching recent Careerss.' });
    }
}

async function topCareers(req, res, Careers, Applicant, User) {
    try {
        // Find all careers and populate the 'listed_by' field with user details (username, dp)
        const popularCareers = await Careers.find()
          .populate('listed_by', 'username dp');
    
        // Calculate the number of applicants for each career
        const careersWithApplicants = await Promise.all(popularCareers.map(async (career) => {
          const applicantsCount = await Applicant.countDocuments({ career: career._id });
          return { ...career.toObject(), applicantsCount };
        }));
    
        // Sort the careers based on popularity (views and applicants count)
        const sortedCareers = careersWithApplicants.sort((a, b) => {
          const popularityA = a.views + a.applicantsCount;
          const popularityB = b.views + b.applicantsCount;
          return popularityB - popularityA; // Sort in descending order of popularity
        });
    
        // Select necessary fields to return in the response
        const popularCareersData = sortedCareers.map((career) => ({
          _id: career._id,
          job_title: career.job_title,
          job_description: career.job_description,
          listed_by: {
            _id: career.listed_by._id,
            username: career.listed_by.username,
            dp: career.listed_by.dp,
          },
          type: career.type,
          pay: career.pay,
          status: career.status,
          views: career.views,
          applicantsCount: career.applicantsCount,
          createdAt: career.createdAt,
        }));
    
        return res.status(200).json(popularCareersData);
      } catch (err) {
        return res.status(500).json({ error: 'Server error while fetching popular careers.' });
      }
}

module.exports = {
  uploadCareers,
  readCareers,
  updateCareers,
  deleteCareers,
  shareCareers,
  applyCareers,
  recentCareers,
  topCareers,
}
