module.exports = {
  name: "getModQueue",
  frequency: 60000,
  limit: 15,
  async getData(redditClient, afterDate) {
    try {
      const modQueueItems = await redditClient
        .getSubreddit("OnPatrolLive+LAFireandRescue+OPLTesting")
        .getModqueue({ limit: this.limit });
      return modQueueItems;
    } catch (error) {
      console.error("Error in getNewModQueueItems:", error);
      return "Error occurred in getNewModQueueItems";
    }
  },
};
