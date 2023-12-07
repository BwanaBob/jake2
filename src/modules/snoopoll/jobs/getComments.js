module.exports = {
  name: "getComments",
  frequency: 5000,
  async getData(redditClient) {
    // try {
    //   // Call snoowrap function, e.g., getComments
    //   const comments = await redditClient.getComments('subreddit', { limit: 5 });

    //   // Process comments and return relevant data
    //   const commentData = comments.map((comment) => ({
    //     id: comment.id,
    //     text: comment.body,
    //     // Add more properties as needed
    //   }));

    //   return commentData;
    // } catch (error) {
    //   console.error('Error in Job 1:', error);
    //   return 'Error occurred in Job 1';
    // }
    return "Data from getComments FILE";
  },
};
