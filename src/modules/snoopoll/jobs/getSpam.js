const processedSpamIds = new Set();

module.exports = {
  name: "getSpam",
  frequency: 8000,
  async getData(redditClient) {
    try {
      const spams = await redditClient
        .getSubreddit("OnPatrolLive+LAFireandRescue+OPLTesting")
        .getSpam({ limit: 2 });

      const newSpams = spams.filter((spam) => !processedSpamIds.has(spam.id));

      // Update the set of processed spam IDs
      newSpams.forEach((spam) => {
        processedSpamIds.add(spam.id);
      });

      return newSpams;
    } catch (error) {
      console.error("Error in getNewspams:", error);
      return "Error occurred in getNewspams";
    }
  },
};
