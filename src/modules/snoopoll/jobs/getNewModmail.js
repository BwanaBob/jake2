module.exports = {
  name: "getNewModmail",
  frequency: 7000,
  limit: 10,
  async getData(redditClient, afterDate) {
    try {
      const conversations = await redditClient
        .getSubreddit("OnPatrolLive+LAFireandRescue+OPLTesting")
        .getNewModmailConversations({ limit: this.limit });
      return conversations;
    } catch (error) {
      console.error("Error in getNewModmail:", error);
      return "Error occurred in getNewModmail";
    }
  },
};
