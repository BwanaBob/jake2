const processedModQueueItemIds = new Set();

module.exports = {
  name: "getModQueue",
  frequency: 5000,
  async getData(redditClient) {
    try {
      // const ModQueueItems = await redditClient.getNewModQueueItems("OnPatrolLive+LAFireandRescue+OPLTesting", { limit: 2 });
      const modQueueItems = await redditClient
        .getSubreddit("OnPatrolLive+LAFireandRescue+OPLTesting")
        .getModqueue({ limit: 2 });
      const newModQueueItems = modQueueItems.filter(
        (modQueueItem) => !processedModQueueItemIds.has(modQueueItem.id)
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
