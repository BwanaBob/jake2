module.exports = {
  name: "getNewComments",
  frequency: 5000,
  async getData(redditClient) {
    try {
      const comments = await redditClient.getNewComments("OPLTesting", {
        limit: 2,
      });

      // Process comments and return relevant data
      const commentData = comments.map((comment) => ({
        id: comment.id,
        text: comment.body,
        // Add more properties as needed
      }));

      return commentData;
    } catch (error) {
      console.error("Error in getNewComments:", error);
      return "Error occurred in getNewComments";
    }
  },
};
