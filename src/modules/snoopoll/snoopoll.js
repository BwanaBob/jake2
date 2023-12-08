const EventEmitter = require("events");
// const options = require("./options.json");
const fs = require("fs");
const path = require("path");
require("dotenv").config();
const snoowrap = require("snoowrap");
const log = require("../logger.js");

class Snoopoll extends EventEmitter {
  constructor(jobFolder) {
    super();
    this.redditClient = new snoowrap({
      userAgent: process.env.REDDIT_USER_AGENT,
      clientId: process.env.REDDIT_CLIENT_ID,
      clientSecret: process.env.REDDIT_CLIENT_SECRET,
      username: process.env.REDDIT_USERNAME,
      password: process.env.REDDIT_PASSWORD,
    });
    this.frequency = 7000; // Default frequency is 7 seconds
    this.jobs = this.loadJobs(jobFolder);
    this.interval = null;
  }

  loadJobs(jobFolder) {
    const jobs = [];
    const files = fs.readdirSync(jobFolder);

    files.forEach((file) => {
      if (file.endsWith(".js")) {
        const jobPath = path.resolve(jobFolder, file);
        const jobModule = require(jobPath);
        const job = {
          name: jobModule.name || "Unnamed Job",
          frequency: jobModule.frequency ?? 0,
          lastRun: 0,
          getData: jobModule.getData || (() => "Default Data"),
        };
        jobs.push(job);
        log.execute({ emoji: '💾', module: job.name, feature: "Job Loaded" });
      }
    });
    return jobs;
  }

  start() {
    if (!this.interval) {
      this.interval = setInterval(() => this.emitData(), this.frequency);
      this.emit("start");
    }
  }

  stop() {
    clearInterval(this.interval);
    this.interval = null;
    this.emit("stop");
  }

  setFrequency(milliseconds) {
    if (milliseconds > 0) {
      this.frequency = milliseconds;
      if (this.interval) {
        // Restart the interval with the new frequency
        this.stop();
        this.start();
      }
      this.emit("frequencyChanged", this.frequency);
    }
  }

  setJobFrequency(jobName, newFrequency) {
    var jobIndex = this.jobs.findIndex((job) => job.name === jobName);
    if (jobIndex >= 0 && jobIndex < this.jobs.length) {
      this.jobs[jobIndex].frequency = newFrequency;
      this.emit("jobFrequencyChanged", {
        name: this.jobs[jobIndex].name,
        frequency: newFrequency,
      });
    }
  }

  emitData() {
    const currentTime = Date.now();
    // Find the job that has waited the longest
    const nextJob = this.jobs.reduce(
      (prev, current) => {
        const elapsed = currentTime - current.lastRun - current.frequency;
        if (
          current.frequency > 0 &&
          (prev.job === null || elapsed > prev.elapsed)
        ) {
          return { job: current, elapsed };
        }
        return prev;
      },
      { job: null, elapsed: 0 }
    ).job;

    if (nextJob) {
      nextJob.lastRun = currentTime;

      // synchronus getData
      // this.emit("data", nextJob.getData());

      // Call getData and emit the result when the promise is resolved
      nextJob
        .getData(this.redditClient)
        .then((data) => {
          // Emit data from the chosen job

          if (data.length > 0) {
            this.emit(nextJob.name, data);
          } else {
            log.execute({ emoji: '🚫', module: nextJob.name, feature: "Received", message: "0 records" });
          }
        })
        .catch((error) => {
          console.error(`Error in ${nextJob.name}:`, error);
        });
    }
  }
}

module.exports = Snoopoll;
