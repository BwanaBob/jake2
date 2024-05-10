module.exports = {
  name: "getNewComments",
  frequency: 9000,
  limit: 20,
  async getData(redditClient, afterDate) {
    try {
      const comments = await redditClient
      // .getSubreddit("OnPatrolLive+LAFireandRescue+Police247+OPLTesting")
      .getSubreddit("OnPatrolLive+Police247")
        .getNewComments({ limit: this.limit });
      return comments;
    } catch (error) {
      console.error("Error in getNewComments:", error.message);
      return "Error occurred in getNewComments";
    }
  },
};
