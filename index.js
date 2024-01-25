const Snoopoll = require("./src/modules/snoopoll/snoopoll.js");
const Discordwrap = require("./src/modules/discordwrap/discordwrap.js");
const log = require("./src/modules/logger.js");

const snoopoll = new Snoopoll("./src/modules/snoopoll/jobs");
const discordwrap = new Discordwrap();

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
  await discordwrap.postItem(jobName, data);
});

// Start snoopoll
snoopoll.start();

// a

// // Adjust job 1 frequency (e.g., change to 11 seconds)
// setTimeout(() => {
//   snoopoll.setJobFrequency("getNewSubmissions", 11000);
// }, 25000);

// // Stop snoopoll after 60 seconds
// setTimeout(() => {
//   snoopoll.stop();
// }, 60000);
