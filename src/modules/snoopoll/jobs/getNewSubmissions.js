const processedSubmissionIds = new Set();

module.exports = {
  name: "getNewSubmissions",
  frequency: 30000,
  limit: 10,
  async getData(redditClient, afterDate) {
    try {
      const submissions = await redditClient
        .getSubreddit("OnPatrolLive+LAFireandRescue+OPLTesting")
        .getNew({ limit: this.limit });

      const newSubmissions = submissions.filter(
        (submission) =>
          !processedSubmissionIds.has(submission.id) &&
          afterDate < submission.created_utc
      );
      // Update the set of processed comment IDs
      newSubmissions.forEach((submission) => {
        processedSubmissionIds.add(submission.id);
      });

      return newSubmissions;
    } catch (error) {
      console.error("Error in getNewSubmissions:", error);
      return "Error occurred in getNewSubmissions";
    }
  },
};
