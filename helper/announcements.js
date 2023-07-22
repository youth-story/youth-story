async function createAnnouncements(req, res, Announcements, User)
{
    const {announcement, username} = req.body;

    if (announcement.trim().length > 2000)
    {
        return res.status(400).send("Max limit for announcement is 2000 characters");
    }

    try {
        const user = await User.findOne({username: username});
        if (!user)
        {
            return res.status(400).send('User doesnot exist');
        }
       else if ((user.role.includes("Admin") || user.role.includes("Co-Founder")))
        {
            return res.status(400).send("You don't have permission to make announcements");
        }

        const announcement_created = await Announcements.create({announcement: announcement});
        return res.status(200).send("Announcement created Successfully");

    }
    catch(error)
    {
        console.log(error);
        return res.status(500).send('Something went wrong');
    }

}

async function getAnnouncement(req, res, Announcements)
{

    try {
        const announcements = await Announcements.find({});
        return res.status(200).json({"announcements": announcements});
    }
    catch(error)
    {
        return res.status(500).send('Something went wrong');
    }

}

async function deleteAnnouncement(req, res, Announcements, User)
{
    const {announcement_id} = req.body;

    try {
        await Announcements.deleteOne({_id: announcement_id});
        return res.status(200).send("Announcement deleted Successfully");
    }
    catch(error)
    {
        return res.status(500).send('Something went wrong');
    }

}

module.exports = {
    createAnnouncements: createAnnouncements,
    getAnnouncement: getAnnouncement,
    deleteAnnouncement: deleteAnnouncement
};