async function toggleNewsLetter(req, res, NewsLetter) {
    const { user_id } = req.body;
  
    try {
        
        const newsletter = await NewsLetter.findOne({ user_id: user_id });

        if (newsletter) {
            await NewsLetter.deleteOne({ user_id: user_id });
            return res.status(200).send('Subscription removed successfully');
        } else {
            const newNewsletter = new NewsLetter({ user_id: user_id });
            await newNewsletter.save();
            return res.status(200).send('Subscription added successfully');
        }

    } catch (error) {
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

async function suggestPerson(req, res, User, SuggestPerson, AWS) {
    try {
      const { user_id, name, social } = req.body;
  
      if (!user_id || !name || !social) {
        return res.status(400).send('Please fill all fields');
      }
  
      const user = await User.findById(user_id);
  
      if (!user) {
        return res.status(400).send('User not found');
      }
  
      const suggestion = {
        suggested: name,
        social: social,
      };
  
      let suggesterEntry = await SuggestPerson.findOne({ suggester: user_id });
  
      if (!suggesterEntry) {
        // If there is no existing entry, create a new one
        suggesterEntry = new SuggestPerson({
          suggester: user_id,
          suggestions: [suggestion],
        });
      } else {
        suggesterEntry.suggestions.push(suggestion);
      }
  
      // Save the updated suggesterEntry to the database
      await suggesterEntry.save();
  
      const params = {
        Destination: {
          ToAddresses: ['youthstory.d2d@gmail.com'],
        },
        Message: {
          Body: {
            Text: {
              Data: `@${user.username} recommends us to interview ${name} and the suggested person's social media is ${social}.`,
            },
          },
          Subject: {
            Data: `Suggestion by @${user.username}`,
          },
        },
        Source: 'youthstory.d2d@gmail.com',
      };
  
      const ses = new AWS.SES();
      ses.sendEmail(params, (err, data) => {
        if (err) {
          console.error(err);
          return res.status(500).send('Error sending request');
        } else {
          return res.status(200).send('Suggestion Request sent Successfully!');
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
    suggestPerson: suggestPerson,
  };
  