const Snoopoll = require("./src/modules/snoopoll/snoopoll.js");
const Discordwrap = require("./src/modules/discordwrap/discordwrap.js");
const log = require("./src/modules/logger.js");
const snoopoll = new Snoopoll("./src/modules/snoopoll/jobs");
const discordwrap = new Discordwrap();
const CronJob = require('cron').CronJob;

// Static CRON jobs (for now)

const cronSlow = CronJob.from({
	// cronTime: '30 * * * * *',
  cronTime: '5 23 * * FRI,SAT',
	onTick: function () {
    log.execute({
      emoji: "⏲️",
      module: "CRON",
      feature: "Go Slow",
      message: `CRON job executed`,
    });
    snoopoll.setFrequency(27000);
	},
	start: true,
	timeZone: 'America/Chicago'
});

const cronFast = CronJob.from({
	// cronTime: '0 * * * * *',
  cronTime: '55 17 * * FRI,SAT',
	onTick: function () {
    log.execute({
      emoji: "⏲️",
      module: "CRON",
      feature: "Go Fast",
      message: `CRON job executed`,
    });
    snoopoll.setFrequency(7000);
	},
	start: true,
	timeZone: 'America/Chicago'
});

// Event handlers
snoopoll.on("start", (data) => {
  log.execute({
    emoji: "🟢",
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

// // Adjust job 1 frequency (e.g., change to 11 seconds)
// setTimeout(() => {
//   snoopoll.setJobFrequency("getNewSubmissions", 11000);
// }, 25000);

// Stop snoopoll after 130 seconds
// setTimeout(() => {
//   snoopoll.stop();
// }, 130000);
