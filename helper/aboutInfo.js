const { events } = require("../models/User");

async function getTeamDetails(req, res, User) {

    try {
        const founders = await User.find({ role: { $in: ['Co-Founder'] } });
        const designers = await User.find({ role: { $in: ['Designer'] } });
        const editors = await User.find({ role: { $in: ['Editor'] } });
        const marketers = await User.find({ role: { $in: ['Sales'] } });

        return res.status(200).json({'founders': founders, 'designers': designers, 'editors': editors, 'marketers': marketers});
    }
    catch(error)
    {
        return res.status(500).send('Something Went Wrong');
    }

}

async function getPartnerDetails(req, res, Partner) {

    try {
        const partners = await Partner.find({}, 'logo').select('_id name');
        const logosWithIds = partners.map((partner) => ({
        _id: partner._id,
        logo: partner.logo,
        name: partner.name,
        }));
        return res.status(200).send(logosWithIds);
    }
    catch (error)
    {
        return res.status(500).send('Something Went Wrong');
    }

}

async function getTopReviews(req, res, Reviews) {

    try {
        const reviews = await Reviews.find({ ratings: { $gte: 4 } })
          .limit(5)
          .exec();
      
        return res.status(200).json({ reviews });
      } catch (error) {
        console.error('Error retrieving reviews:', error);
        return res.status(500).send('Something went wrong');
      }      

}

async function getStats(req, res, User, Partners, Reviews) {

    try {
        const userCount = await User.countDocuments({});
        const partnerCount = await Partners.countDocuments({});
        const reviewCount = await Reviews.countDocuments({});
        // const magazineCount = await Magazines.countDocuments({});
        // const articleCount = await Articles.countDocuments({});
        // const interviewCount = await Interviews.countDocuments({});
        // const eventCount = await Events.countDocuments({});
        // const newsCount = await News.countDocuments({});
        // const resourceCount = await Resources.countDocuments({});
        const contentCount = magazineCount + articleCount // + interviewCount + eventCount + newsCount + resourceCount;

        return res.status(200).json({'users': userCount, 'partners': partnerCount, 'reviews': reviewCount, 'contents': contentCount});

    }
    catch(error)
    {
        return res.status(500).send('Something Went Wrong');
    }

}

module.exports = {
    getTeamDetails: getTeamDetails,
    getPartnerDetails: getPartnerDetails,
    getTopReviews: getTopReviews,
    getStats: getStats,
}