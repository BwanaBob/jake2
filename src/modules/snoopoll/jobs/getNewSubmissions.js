const processedSubmissionIds = new Set();

module.exports = {
  name: "getNewSubmissions",
  frequency: 50000,
  async getData(redditClient) {
    try {
      // const submissions = await redditClient.getNew(["OPLTesting+OnPatrolLive"], {limit: 2});
      const submissions = await redditClient
        .getSubreddit("OnPatrolLive+LAFireandRescue+OPLTesting")
        .getNew({ limit: 2 });

      const newSubmissions = submissions.filter(
        (submission) => !processedSubmissionIds.has(submission.id)
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
