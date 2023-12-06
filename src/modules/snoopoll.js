const EventEmitter = require("events");

class Snoopoll extends EventEmitter {
  constructor() {
    super();
    this.frequency = 7000; // Default frequency is 7 seconds
    this.jobs = [
      {
        name: "getComments",
        frequency: 9000,
        lastRun: 0,
        getData: () => "Data from getComments",
      },
      {
        name: "getPosts",
        frequency: 30000,
        lastRun: 0,
        getData: () => "Data from getPosts",
      },
      {
        name: "getSpam",
        frequency: 50000,
        lastRun: 0,
        getData: () => "Data from getSpam",
      },
      {
        name: "getModmail",
        frequency: 60000,
        lastRun: 0,
        getData: () => "Data from getModmail",
      },
      {
        name: "getModqueue",
        frequency: 10000,
        lastRun: 0,
        getData: () => "Data from getModqueue",
      },
    ];
    this.interval = null;
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
        return elapsed > prev.elapsed ? { job: current, elapsed } : prev;
      },
      { job: null, elapsed: 0 }
    ).job;

    if (nextJob) {
      nextJob.lastRun = currentTime;
      this.emit("data", nextJob.getData());
    }
  }
}

module.exports = Snoopoll;
