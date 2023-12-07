module.exports = {
  name: "getNewSubmissions",
  frequency: 50000,
  async getData(redditClient) {
    try {
      const submissions = await redditClient.getNew("OPLTesting", {
        limit: 2,
      });

      // Process comments and return relevant data
      const submissionData = submissions.map((submission) => ({
        id: submission.id,
        text: submission.title,
        // Add more properties as needed
      }));

      return submissionData;
    } catch (error) {
      console.error("Error in getNewSubmissions:", error);
      return "Error occurred in getNewSubmissions";
    }
  },
};
