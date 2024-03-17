module.exports = {
  name: "getModQueue",
  frequency: 20000,
  limit: 7,
  async getData(redditClient, afterDate) {
    try {
      const modQueueItems = await redditClient
      // .getSubreddit("OnPatrolLive+LAFireandRescue+OPLTesting")
      .getSubreddit("OnPatrolLive+OPLTesting")
        .getModqueue({ limit: this.limit });
      return modQueueItems;
    } catch (error) {
      console.error("Error in getNewModQueueItems:", error.message);
      return "Error occurred in getNewModQueueItems";
    }
  },
};
