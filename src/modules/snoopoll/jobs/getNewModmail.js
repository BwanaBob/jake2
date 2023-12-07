const processedConversationIds = new Set();

module.exports = {
  name: "getNewModmail",
  frequency: 30000,
  async getData(redditClient) {
    try {
      // const conversations = await redditClient.getNewModmailConversations({ limit: 2 });
      const conversations = await redditClient
        .getSubreddit("OnPatrolLive+LAFireandRescue+OPLTesting")
        .getNewModmailConversations({ limit: 2 });
      const newConversations = conversations.filter(
        (conversation) => !processedConversationIds.has(conversation.id)
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
