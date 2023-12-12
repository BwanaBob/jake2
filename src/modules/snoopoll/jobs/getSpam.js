module.exports = {
  name: "getSpam",
  frequency: 31000,
  limit: 10,
  async getData(redditClient, afterDate) {
    try {
      const spams = await redditClient
        .getSubreddit("OnPatrolLive+LAFireandRescue+OPLTesting")
        .getSpam({ limit: this.limit });
      return spams;
    } catch (error) {
      console.error("Error in getSpam:", error);
      return "Error occurred in getSpam";
    }
  },
};
