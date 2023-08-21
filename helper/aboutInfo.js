const { events } = require("../models/User");
const Reviews = require('../models/Reviews');
const Magazines = require('../models/Magazine');
const Articles = require('../models/Article');
const NewsLetter = require('../models/NewsLetter');
const Interviews = require('../models/Interviews');
const Events = require('../models/Events');
const News = require('../models/News');
const Resources = require('../models/Resources');

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

async function getStats(req, res, User) {

    try {
        const userCount = await User.countDocuments({});
        const newsLetterCount = await NewsLetter.countDocuments({});
        const reviewCount = await Reviews.countDocuments({});
        const magazineCount = await Magazines.countDocuments({});
        const articleCount = await Articles.countDocuments({});
        const interviewCount = await Interviews.countDocuments({});
        const eventCount = await Events.countDocuments({});
        const newsCount = await News.countDocuments({});
        const resourceCount = await Resources.countDocuments({});
        const contentCount = magazineCount + articleCount // + interviewCount + eventCount + newsCount + resourceCount;

        return res.status(200).json({'users': userCount, 'reviews': reviewCount, 'contents': contentCount, 'newsLetter': newsLetterCount, 'interview': interviewCount, 'news': newsCount, 'events': eventCount, 'resources': resourceCount});

    }
    catch(error)
    {
        return res.status(500).send('Something Went Wrong');
    }

}

module.exports = {
    getTeamDetails: getTeamDetails,
    getStats: getStats,
}