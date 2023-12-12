module.exports = {
  name: "getModmail",
  frequency: 0,
  limit: 10,
  async getData(redditClient, afterDate) {
    try {
      const messages = await redditClient
        .getSubreddit("OnPatrolLive+LAFireandRescue+OPLTesting")
        .getModmail({ limit: this.limit });
      return messages;
    } catch (error) {
      console.error("Error in getModmail:", error);
      return "Error occurred in getModmail";
    }
  },
};
