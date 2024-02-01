const EventEmitter = require("events");
const snoowrap = require("snoowrap");
const log = require("../logger.js");
const fs = require("fs");
const path = require("path");
require("dotenv").config();
const options = require("../../../options.json");
const minFrequency = require("./minFrequency,js");

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
    this.frequency = options.snooPoll.frequency || 7000; // Default frequency is 7 seconds
    this.jobs = this.loadJobs(jobFolder);
    this.interval = null;
    this.connectedAt = Date.now() / 1000 - 20000; // get past 20 seconds
    this.processedIds = new Set();
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
          limit: jobModule.limit || 25,
          getData: jobModule.getData || (() => "Default Data"),
        };
        jobs.push(job);
        log.execute({ emoji: "💾", module: job.name, feature: "Job Loaded" });
      }
    });
    this.reportFrequency(jobs);
    return jobs;
  }

  start() {
    if (!this.interval) {
      this.interval = setInterval(() => this.emitData(), this.frequency);
      this.emit("start", { frequency: this.frequency, jobs: this.jobs.length });
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
      this.reportFrequency(this.jobs);
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
      this.reportFrequency(this.jobs);
    }
  }

  reportFrequency(jobs) {
    // console.log(jobs.length);
    const jobFreqs = jobs
      .map((job) => job.frequency)
      .filter((freq) => freq > 0);
    // const newJobFreqs = jobFreqs.filter((freq) => freq > 0);
    // console.log(newJobFreqs);
    log.execute({
      emoji: "🧮",
      module: "SnooPoll",
      feature: "ReportFreq",
      message: `Current: ${this.frequency} | Ideal: ${minFrequency.minFrequency(
        jobFreqs
      )}`,
    });
  }

  emitData() {
    const currentTime = Date.now();
    // Find the job that has waited the longest
    const nextJob = this.jobs.reduce(
      (prev, current) => {
        const elapsed = currentTime - current.lastRun - current.frequency;
        if (
          current.frequency > 0 &&
          elapsed > 0 &&
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
      // Call getData and emit the result when the promise is resolved
      nextJob
        .getData(this.redditClient, this.connectedAt)
        .then((data) => {
          const newData = data.filter((item) => {
            if (this.processedIds.has(item.id)) {
              return false;
            }
            if (item.created_utc && this.connectedAt > item.created_utc) {
              return false;
            }
            if (
              item.lastUupdated &&
              this.connectedAt > new Date(item.lastUpdated).getTime() / 1000
            ) {
              return false;
            }
            return true;
          });

          if (newData.length > 0) {
            newData.forEach((datum) => {
              // this.emit(nextJob.name, datum);
              this.processedIds.add(datum.id);
              this.emit("data", nextJob.name, datum);
            });
          } else {
            // log.execute({
            //   emoji: "🚫",
            //   module: nextJob.name,
            //   feature: "Received",
            //   message: "  0 records",
            // });
          }
        })
        .catch((error) => {
          console.error(`Error in ${nextJob.name}:`, error.message);
        });
    }
  }
}

module.exports = Snoopoll;
