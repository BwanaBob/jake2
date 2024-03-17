module.exports = {
  name: "getNewSubmissions",
  frequency: 30000,
  limit: 5,
  async getData(redditClient, afterDate) {
    try {
      const submissions = await redditClient
      // .getSubreddit("OnPatrolLive+LAFireandRescue+OPLTesting")
      .getSubreddit("OnPatrolLive+OPLTesting")
        .getNew({ limit: this.limit });
      return submissions;
    } catch (error) {
      console.error("Error in getNewSubmissions:", error.message);
      return "Error occurred in getNewSubmissions";
    }
  },
};
