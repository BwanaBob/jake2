const Snoopoll= require('./src/modules/snoopoll/snoopoll.js');
const snoopoll = new Snoopoll('./src/modules/snoopoll/jobs');
const log = require("./src/modules/logger.js");

// Event handlers
snoopoll.on('start', (data) => {
  log.execute({ emoji: '🚥', module: 'SnooPoll', feature: "Started", message: `${String(data.frequency / 1000).padStart(3, " ")} sec ${String(data.jobs).padStart(3, " ")} jobs` });
});
snoopoll.on('stop', () => {
  log.execute({ emoji: '🛑', module: 'SnooPoll', feature: "Stopped" });
});
snoopoll.on('frequencyChanged', (newFrequency) => {
  log.execute({ emoji: '⌛', module: 'SnooPoll', feature: "FrequencyChange", message: `${String(newFrequency / 1000).padStart(3," ")} sec` });
});
snoopoll.on('jobFrequencyChanged', (job) => {
  log.execute({ emoji: '⌛', module: job.name, feature: "FrequencyChange", message: `${String(job.frequency / 1000).padStart(3," ")} sec` });
});
// snoopoll.on('data', (data) => {
//   console.log('Received data:', data);
// });
snoopoll.on('getNewComments', (data) => {
  log.execute({ emoji: '💬', module: 'getNewComments', feature: "Received", message: `${String(data.length).padStart(3," ")} comments` });
});
snoopoll.on('getNewSubmissions', (data) => {
  log.execute({ emoji: '📌', module: 'getNewSubmissions', feature: "Received", message: `${String(data.length).padStart(3," ")} submissions` });
});
snoopoll.on('getNewModmail', (data) => {
  log.execute({ emoji: '📨', module: 'getNewModmail', feature: "Received", message: `${String(data.length).padStart(3," ")} conversations` });
});
snoopoll.on('getSpam', (data) => {
  log.execute({ emoji: '📫', module: 'getSpam', feature: "Received", message: `${String(data.length).padStart(3," ")} items` });
});
snoopoll.on('getModQueue', (data) => {
  // console.log('Received New ModQueue Item:', data.length);
  log.execute({ emoji: '📋', module: 'ModQueue', feature: "Received", message: String(data.length).padStart(3," ") });
});


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
