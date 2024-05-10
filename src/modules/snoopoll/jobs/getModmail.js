module.exports = {
  name: "getModmail",
  frequency: 0,
  limit: 3,
  async getData(redditClient, afterDate) {
    try {
      const messages = await redditClient
      // .getSubreddit("OnPatrolLive+LAFireandRescue+OPLTesting")
      .getSubreddit("OnPatrolLive+Police247")
      .getModmail({ limit: this.limit });
      return messages;
    } catch (error) {
      console.error("Error in getModmail:", error.message);
      return "Error occurred in getModmail";
    }
  },
};
