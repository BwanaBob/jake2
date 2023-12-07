const Snoopoll= require('./src/modules/snoopoll/snoopoll.js');
const snoopoll = new Snoopoll('./src/modules/snoopoll/jobs');

// Event handlers
snoopoll.on('start', () => {
  console.log('Snoopoll started.');
});
snoopoll.on('stop', () => {
  console.log('Snoopoll stopped.');
});
snoopoll.on('frequencyChanged', (newFrequency) => {
  console.log(`Snoopoll frequency changed to ${newFrequency} milliseconds.`);
});
snoopoll.on('jobFrequencyChanged', (job) => {
  console.log(`Snoopoll job frequency for job: "${job.name}" changed to ${job.frequency} milliseconds.`);
});
snoopoll.on('data', (data) => {
  console.log('Received data:', data);
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
