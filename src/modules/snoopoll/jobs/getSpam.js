module.exports = {
  name: "getSpam",
  frequency: 31000,
  limit: 7,
  async getData(redditClient, afterDate) {
    try {
      const spams = await redditClient
      // .getSubreddit("OnPatrolLive+LAFireandRescue+OPLTesting")
      .getSubreddit("OnPatrolLive")
        .getSpam({ limit: this.limit });
      return spams;
    } catch (error) {
      console.error("Error in getSpam:", error);
      return "Error occurred in getSpam";
    }
  },
};
