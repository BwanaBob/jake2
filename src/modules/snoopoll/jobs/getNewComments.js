module.exports = {
  name: "getNewComments",
  frequency: 7000,
  limit: 20,
  async getData(redditClient, afterDate) {
    try {
      const comments = await redditClient
        .getSubreddit("OnPatrolLive+LAFireandRescue+OPLTesting")
        .getNewComments({ limit: this.limit });
      return comments;
    } catch (error) {
      console.error("Error in getNewComments:", error);
      return "Error occurred in getNewComments";
    }
  },
};
