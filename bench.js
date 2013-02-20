
// Usage:
// npm install
// node bench.js --cpu 10 -t 57 -n 100 -c 10

var opts = require('optimist')
  .usage('Measures NodeJS eventloop performance under cuncurrent load.\nUsage: $0 --cpu 10 -t 57 -n 100 -c 10')
  .demand(['cpu', 't', 'n', 'c'])
  .describe('cpu', '[int] Percentage of CPU time within each request. Any value between 0 and 100')
  .describe('t', '[int] Time of the request')
  .describe('n', '[int] Number of requests to make')
  .describe('c', '[int] Concurrency level');

var argv = opts.argv,
    totalTime = argv.t,
    n = argv.n,
    c = argv.c,
    cpuPart = argv.cpu,
    ioPart = 100 - cpuPart,
    ioTime = totalTime / 100 * ioPart,
    cpuTime = totalTime / 100 * cpuPart;

measureRequests(n, c, function(ms, avg){
  var xTimes = Math.round(avg / totalTime);
  console.log(
    'IO/CPU = %d/%d, %dms/req | took %dms, avg %dms/req (x%d)',
    ioPart, cpuPart, totalTime, ms, avg, xTimes
  );
});

function request(callback) {
  var reqStart = +Date.now();
  setTimeout(function(){ // I/O work
    var cpuStart = +Date.now();
    while (Date.now() - cpuStart < cpuTime); // CPU work
    callback(Date.now() - reqStart);
  }, ioTime);
};

function measureRequests(n, c, callback) {
  var x = n,
      l = n,
      s = +Date.now(),
      total = 0;

  var measure = function() {
    x-- > 0 && request(function(ms){
      // console.log(ms);
      total += ms;
      if (--l) {
        measure()
      } else {
        callback(Date.now() - s, Math.round(total / n));
      }
    });
  };
  while (c--) {
    measure();  
  }
};
