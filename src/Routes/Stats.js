const Stats = (app, db, verifyToken) => {
  app.get("/admin-stats", verifyToken, async (req, res) => {
    try {
      const projectsCount = await db.projectsCollection.countDocuments();
      const blogsCount = await db.blogsCollection.countDocuments();
      const totalReview = await db.testmonialCollection.countDocuments();
      const subscribersCount = await db.subscriberCollection.countDocuments();
      const totalMessages = await db.contactCollection.countDocuments();

      // New messages count (unread status)
      const newMessagesCount = await db.contactCollection.countDocuments({
        status: "unread",
      });

      // Recent 5 messages for the table
      const recentMessages = await db.contactCollection
        .find()
        .sort({ createdAt: -1 })
        .limit(5)
        .toArray();

      res.send({
        projectsCount,
        blogsCount,
        subscribersCount,
        totalMessages,
        newMessagesCount,
        recentMessages,
        totalReview,
      });
    } catch (error) {
      res.status(500).send({ message: "Internal Server Error" });
    }
  });
};

export default Stats;
