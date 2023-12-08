const Snoopoll= require('./src/modules/snoopoll/snoopoll.js');
const snoopoll = new Snoopoll('./src/modules/snoopoll/jobs');
const log = require("./src/modules/logger.js");

// Event handlers
snoopoll.on('start', () => {
  log.execute({ emoji: '🚥', module: 'SnooPoll', feature: "Started" });
});
snoopoll.on('stop', () => {
  log.execute({ emoji: '🛑', module: 'SnooPoll', feature: "Stopped" });
});
snoopoll.on('frequencyChanged', (newFrequency) => {
  log.execute({ emoji: '⏱️', module: 'SnooPoll', feature: "FrequencyChange", message: `${newFrequency} milliseconds` });
});
snoopoll.on('jobFrequencyChanged', (job) => {
  log.execute({ emoji: '⏱️', module: job.name, feature: "FrequencyChange", message: `${job.frequency} milliseconds` });
});
// snoopoll.on('data', (data) => {
//   console.log('Received data:', data);
// });
snoopoll.on('getNewComments', (data) => {
  log.execute({ emoji: '💬', module: 'getNewComments', feature: "Received", message: `${data.length} comments` });
});
snoopoll.on('getNewSubmissions', (data) => {
  log.execute({ emoji: '📌', module: 'getNewSubmissions', feature: "Received", message: `${data.length} submissions` });
});
snoopoll.on('getNewModmail', (data) => {
  log.execute({ emoji: '✉️', module: 'getNewModmail', feature: "Received", message: `${data.length} conversations` });
});
snoopoll.on('getSpam', (data) => {
  log.execute({ emoji: '📫', module: 'getSpam', feature: "Received", message: `${data.length} items` });
});
snoopoll.on('getModQueue', (data) => {
  // console.log('Received New ModQueue Item:', data.length);
  log.execute({ emoji: '📋', module: 'ModQueue', feature: "Received", message: data.length });
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
