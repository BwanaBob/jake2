const processedCommentIds = new Set();

module.exports = {
  name: "getNewComments",
  frequency: 6000,
  limit: 15,
  async getData(redditClient, afterDate) {
    try {
      // const comments = await redditClient.getNewComments("OnPatrolLive+LAFireandRescue+OPLTesting", { limit: 2 });
      const comments = await redditClient
        .getSubreddit("OnPatrolLive+LAFireandRescue+OPLTesting")
        .getNewComments({ limit: this.limit });

      const newComments = comments.filter(
        (comment) =>
          !processedCommentIds.has(comment.id) &&
          afterDate < comment.created_utc
      );
      // Update the set of processed comment IDs
      newComments.forEach((comment) => {
        processedCommentIds.add(comment.id);
      });

      return newComments;
    } catch (error) {
      console.error("Error in getNewComments:", error);
      return "Error occurred in getNewComments";
    }
  },
};
