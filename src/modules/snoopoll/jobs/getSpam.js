const processedSpamIds = new Set();

module.exports = {
  name: "getSpam",
  frequency: 31000,
  limit: 10,
  async getData(redditClient, afterDate) {
    try {
      const spams = await redditClient
        .getSubreddit("OnPatrolLive+LAFireandRescue+OPLTesting")
        .getSpam({ limit: this.limit });

      const newSpams = spams.filter(
        (spam) => !processedSpamIds.has(spam.id) && afterDate < spam.created_utc
      );

      // Update the set of processed spam IDs
      newSpams.forEach((spam) => {
        processedSpamIds.add(spam.id);
      });

      return newSpams;
    } catch (error) {
      console.error("Error in getSpam:", error);
      return "Error occurred in getSpam";
    }
  },
};
