const processedConversationIds = new Set();

module.exports = {
  name: "getNewModmail",
  frequency: 77000,
  limit: 10,
  async getData(redditClient, afterDate) {
    try {
      const conversations = await redditClient
        .getSubreddit("OnPatrolLive+LAFireandRescue+OPLTesting")
        .getNewModmailConversations({ limit: this.limit });

      const newConversations = conversations.filter(
        (conversation) =>
          !processedConversationIds.has(conversation.id) &&
          afterDate < conversation.created_utc
      );
      // Update the set of processed comment IDs
      newConversations.forEach((conversation) => {
        processedConversationIds.add(conversation.id);
      });

      return newConversations;
    } catch (error) {
      console.error("Error in getNewModmail:", error);
      return "Error occurred in getNewModmail";
    }
  },
};
