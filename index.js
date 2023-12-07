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
// snoopoll.on('data', (data) => {
//   console.log('Received data:', data);
// });
snoopoll.on('getNewComments', (data) => {
  console.log('Received New Comments:', data.length);
});
snoopoll.on('getNewSubmissions', (data) => {
  console.log('Received New Submissions:', data.length);
});
snoopoll.on('getNewModmail', (data) => {
  console.log('Received New Modmail:', data.length);
});
snoopoll.on('getSpam', (data) => {
  console.log('Received New Spam:', data.length);
});
snoopoll.on('getModQueue', (data) => {
  console.log('Received New ModQueue Item:', data.length);
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
