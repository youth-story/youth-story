async function toggleNewsLetter(req, res, NewsLetter) {
    const { user_id } = req.body;
  
    try {
        
        const newsletter = await NewsLetter.findOne({ user_id: user_id });

        if (newsletter) {
            await NewsLetter.deleteOne({ user_id: user_id });
        } else {
            const newNewsletter = new NewsLetter({ user_id: user_id });
            await newNewsletter.save();
        }

        return res.status(200).send('Subscription toggled successfully');

    } catch (error) {
        console.log(error);
      return res.status(500).send('Something went wrong');
    }
  }

async function addReview(req, res, Reviews, User, AWS)
{
    const { name, review, ratings } = req.body;

    if (!review || !ratings) {
    return res.status(400).send('Please fill all fields');
    } else if (review.trim().length > 1000) {
    return res.status(400).send('Max review limit exceeded');
    }

    try {
    const user = await User.findOne({ username: name });

    if (!user) {
        return res.status(400).send('User not found');
    }

    const newReview = await Reviews.create({ name: user.username,review: review, ratings: ratings });
    newReview.save();

    const params = {
        Destination: {
        ToAddresses: ['youthstory.d2d@gmail.com']
        },
        Message: {
        Body: {
            Text: {
            Data: `${review}`
            }
        },
        Subject: {
            Data: `Review by @${user.username} - ${ratings} Stars`
        }
        },
        Source: 'youthstory.d2d@gmail.com'
    };

    const ses = new AWS.SES();
    ses.sendEmail(params, (err, data) => {
        if (err) {
            console.log(err);
        return res.status(500).send('Error sending email');
        } else {
        return res.status(200).send('Review Added Successfully');
        }
    });

    } catch (error) {
        return res.status(500).send('Something Went Wrong');
    }

}

async function addSponsor(req, res, Partners, User, AWS)
{
    const { company, reachedBy, email, message} = req.body;

    if (!message || !email || !reachedBy || !company) {
    return res.status(400).send('Please fill all fields');
    } else if (message.trim().length > 2000) {
    return res.status(400).send('Max review limit exceeded');
    }

    try {
    const user = await User.findOne({ username: reachedBy });

    if (!user) {
        return res.status(400).send('User not found');
    }

    const newSponsor = await Partners.create({ reachedBy: user.username, message: message, company: company, email: email });
    newSponsor.save();

    const params = {
        Destination: {
        ToAddresses: ['youthstory.d2d@gmail.com']
        },
        Message: {
        Body: {
            Text: {
            Data: `${message} `
            }
        },
        Subject: {
            Data: `Sponsorship by @${user.username} from ${company}`
        }
        },
        Source: 'youthstory.d2d@gmail.com'
    };

    const ses = new AWS.SES();
    ses.sendEmail(params, (err, data) => {
        if (err) {
            console.log(err);
        return res.status(500).send('Error sending request');
        } else {
        return res.status(200).send('Sponsor Request sent Successfully!');
        }
    });

    } catch (error) {
        console.log(error);
        return res.status(500).send('Something Went Wrong');
    }

}

async function applyCareers(req, res, Careers, User, AWS)
{
    const { username, resume, job_id } = req.body;

    if (!username || !resume || !job_id) {
    return res.status(400).send('Please fill all fields');
    } 

    try {
    const user = await User.findOne({ username: username });

    if (!user) {
        return res.status(400).send('User not found');
    }

    const career = await Careers.findOne({_id: job_id});

    if (!career)
    {
        return res.status(400).send('Job Posting doesnot exist');
    }

    await career.updateOne(
        { _id: job_id },
        { $push: { applicants: {username, resume} } }
      );

    const params = {
        Destination: {
        ToAddresses: ['youthstory.d2d@gmail.com']
        },
        Message: {
        Body: {
            Text: {
            Data: `Hello team, \n \n New application for ${career.job_title}(listed by ${career.listed_by} on ${career.createdAt}) by \n \n username: ${username}, \t email: ${user.email}, \t resume: ${resume} \n \n Hope this one gets selected! \n \n Thanks and regards, \n Youth Story team`
            }
        },
        Subject: {
            Data: `Careers |${career.job_title}| Application by @${user.username}`
        }
        },
        Source: 'youthstory.d2d@gmail.com'
    };

    const ses = new AWS.SES();
    ses.sendEmail(params, (err, data) => {
        if (err) {
            console.log(err);
        return res.status(500).send('Error sending request');
        } else {
        return res.status(200).send('Application sent Successfully!');
        }
    });

    } catch (error) {
        console.log(error);
        return res.status(500).send('Something Went Wrong');
    }
}
  
  module.exports = {
    toggleNewsLetter: toggleNewsLetter,
    addReview: addReview,
    addSponsor: addSponsor,
    applyCareers: applyCareers,
  };
  