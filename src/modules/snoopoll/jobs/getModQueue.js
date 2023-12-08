const processedModQueueItemIds = new Set();

module.exports = {
  name: "getModQueue",
  frequency: 60000,
  limit: 5,
  async getData(redditClient, afterDate) {
    try {
      // const ModQueueItems = await redditClient.getNewModQueueItems("OnPatrolLive+LAFireandRescue+OPLTesting", { limit: 2 });
      const modQueueItems = await redditClient
        .getSubreddit("OnPatrolLive+LAFireandRescue+OPLTesting")
        .getModqueue({ limit: this.limit });

      const newModQueueItems = modQueueItems.filter(
        (modQueueItem) =>
          !processedModQueueItemIds.has(modQueueItem.id) &&
          afterDate < modQueueItem.created_utc
      );
      // Update the set of processed ModQueueItem IDs
      newModQueueItems.forEach((modQueueItem) => {
        processedModQueueItemIds.add(modQueueItem.id);
      });

      return newModQueueItems;
    } catch (error) {
      console.error("Error in getNewModQueueItems:", error);
      return "Error occurred in getNewModQueueItems";
    }
  },
};
