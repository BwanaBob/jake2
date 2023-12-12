const Snoopoll = require("./src/modules/snoopoll/snoopoll.js");
const log = require("./src/modules/logger.js");

const snoopoll = new Snoopoll("./src/modules/snoopoll/jobs");

// Event handlers
snoopoll.on("start", (data) => {
  log.execute({
    emoji: "🚥",
    module: "SnooPoll",
    feature: "Started",
    message: `${String(data.frequency / 1000).padStart(3, " ")} sec ${String(
      data.jobs
    ).padStart(3, " ")} jobs`,
  });
});
snoopoll.on("stop", () => {
  log.execute({ emoji: "🛑", module: "SnooPoll", feature: "Stopped" });
});
snoopoll.on("frequencyChanged", (newFrequency) => {
  log.execute({
    emoji: "⌛",
    module: "SnooPoll",
    feature: "FrequencyChange",
    message: `${String(newFrequency / 1000).padStart(3, " ")} sec`,
  });
});
snoopoll.on("jobFrequencyChanged", (job) => {
  log.execute({
    emoji: "⌛",
    module: job.name,
    feature: "FrequencyChange",
    message: `${String(job.frequency / 1000).padStart(3, " ")} sec`,
  });
});

snoopoll.on("data", async (jobName, data) => {
  let logEmoji = "💬";
  switch (jobName) {
    case "getNewComments":
      logEmoji = "💬";
      break;
    case "getNewSubmissions":
      logEmoji = "📌";
      break;
    case "getNewModmail":
      logEmoji = "📨";
      break;
    case "getSpam":
      logEmoji = "📫";
      break;
    case "getModQueue":
      logEmoji = "📋";
      break;
    default:
      logEmoji = "💬";
  }

  let authorUser = "Unknown";
  let subreddit = "Unknown";
  switch (data.constructor.name) {
    case "ModmailConversation":
      subreddit = data.owner.displayName;

      const userMessages = data.messages.filter(
        (message) => !message.author.name.isMod
      );

      if (userMessages.length > 0) {
        authorUser = userMessages[0].author.name.name;
      } else {
        authorUser = data.messages[0].author.name.name;
      }

      log.execute({
        emoji: logEmoji,
        module: jobName,
        feature: "Received",
        guild: subreddit,
        userName: authorUser,
        message: `${data.constructor?.name} Id: ${data.id}`,
      });
      break;
    default:
      // case "comment":
      // case "submission":
      authorUser = (await data.author?.name) || "Unknown";
      subreddit = (await data.subreddit?.display_name) || "Unknown";
      log.execute({
        emoji: logEmoji,
        module: jobName,
        feature: "Received",
        guild: subreddit,
        userName: authorUser,
        message: `${data.constructor?.name} Id: ${data.id}`,
      });

      break;
  }
});

// snoopoll.on('getNewComments', async (data) => {
//   const authorUser = await data.author?.name || "Unknown";
//   const subreddit = await data.subreddit?.display_name || "Unknown";
//   log.execute({ emoji: '💬', module: 'getNewComments', feature: "Received", guild: subreddit, userName: authorUser, message: `${data.constructor.name} Id: ${data.id}` });
// });
// snoopoll.on('getNewSubmissions', (data) => {
//   log.execute({ emoji: '📌', module: 'getNewSubmissions', feature: "Received", message: `${data.constructor.name} Id: ${data.id}` });
// });
// snoopoll.on('getNewModmail', (data) => {
//   log.execute({ emoji: '📨', module: 'getNewModmail', feature: "Received", message: `${data.constructor.name} Id: ${data.id}` });
// });
// snoopoll.on('getSpam', (data) => {
//   log.execute({ emoji: '📫', module: 'getSpam', feature: "Received", message: `${data.constructor.name} Id: ${data.id}` });
// });
// snoopoll.on('getModQueue', (data) => {
//   // console.log('Received New ModQueue Item:', data.length);
//   log.execute({ emoji: '📋', module: 'ModQueue', feature: "Received", message: `${data.constructor.name} Id: ${data.id}` });
// });

// Start snoopoll
snoopoll.start();

// Adjust frequency (e.g., change to 5 seconds)
setTimeout(() => {
  snoopoll.setFrequency(5000);
}, 15000);

// Adjust job 1 frequency (e.g., change to 11 seconds)
setTimeout(() => {
  snoopoll.setJobFrequency("getNewSubmissions", 11000);
}, 25000);

// Stop snoopoll after 60 seconds
setTimeout(() => {
  snoopoll.stop();
}, 60000);
