module.exports = {
  name: "getNewModmail",
  frequency: 125000,
  limit: 3,
  async getData(redditClient, afterDate) {
    try {
      const conversations = await redditClient
      // .getSubreddit("OnPatrolLive+LAFireandRescue+OPLTesting")
      .getSubreddit("OnPatrolLive")
        .getNewModmailConversations({ limit: this.limit });
      return conversations;
    } catch (error) {
      console.error("Error in getNewModmail:", error.message);
      return "Error occurred in getNewModmail";
    }
  },
};
