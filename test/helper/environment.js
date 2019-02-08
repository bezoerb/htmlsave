const htmlsave = require('../..');
const {PerformanceObserver, performance} = require('perf_hooks');
const obs = new PerformanceObserver(items => {
  console.log(items.getEntries()[0].duration);
  performance.clearMarks();
});
obs.observe({entryTypes: ['measure']});

global.performance = performance;
global.htmlsave = htmlsave;
