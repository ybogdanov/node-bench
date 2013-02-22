
// Usage:
// npm install
// node bench.js --cpu 10 -t 57 -n 100 -c 10

var opts = require('optimist')
  .usage([
    'Measures NodeJS eventloop performance under cuncurrent load.',
    'Usage: $0 --cpu 10 -t 57 -n 100 -c 10',
    '       $0 --cpu 10 -t [50,30,40] -n 100 -c 10'
  ].join('\n'))
  .demand(['cpu', 't', 'n', 'c'])
  .describe('cpu', '[int] Percentage of CPU time within each request. Any value between 0 and 100')
  .describe('t', '[int|array] Time of the request (if array given, runs multiple parallel reqs)')
  .describe('n', '[int] Number of requests to make')
  .describe('c', '[int] Concurrency level');

var argv = opts.argv,
    totalTime = typeof argv.t == 'string' ? JSON.parse(argv.t) : argv.t,
    n = argv.n,
    c = argv.c,
    cpuPart = argv.cpu,
    ioPart = 100 - cpuPart;

measureRequests(n, c, function(ms, avg){
  var xTimes;
  if (totalTime instanceof Array) {
    xTimes = Math.round(avg / calculareParallelTime(totalTime));
  }
  else {
    xTimes = Math.round(avg / totalTime);
  }
  console.log(
    'IO/CPU = %d/%d, %sms/req | took %dms, avg %dms/req (x%d)',
    ioPart, cpuPart, totalTime, ms, avg, xTimes
  );
});

function requestSingle(ioTime, cpuTime, callback) {
  var reqStart = +Date.now();
  setTimeout(function(){ // I/O work
    var cpuStart = +Date.now();
    while (Date.now() - cpuStart < cpuTime); // CPU work
    callback(Date.now() - reqStart);
  }, ioTime);
}

function requestParallel(totalTime, callback) {
  var l = totalTime.length,
      reqs = totalTime,
      reqStart = +Date.now();
  for (var i = 0; i < l; i++) {
    var io = reqs[i] / 100 * ioPart,
        cpu = reqs[i] / 100 * cpuPart;
    requestSingle(io, cpu, function(ms){
      --l || callback(Date.now() - reqStart);
    });
  }
}

function request(callback) {
  if (totalTime instanceof Array) {
    requestParallel(totalTime, callback);
  }
  else {
    var ioTime = totalTime / 100 * ioPart,
        cpuTime = totalTime / 100 * cpuPart;
    requestSingle(ioTime, cpuTime, callback);
  }
}

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
}

function calculareParallelTime(times) {
  // sort parallels by time
  times.sort();
  // calculare cpu ranges according to single threaded cpu nature
  var cpuRanges = [], time = 0;
  for (var i in times) {
    var cpuTime = times[i] / 100 * cpuPart,
        cpuStart = times[i] / 100 * ioPart,
        cpuEnd = times[i];
    // search for cpu overlappings
    for (var k = 0; k < cpuRanges.length; k++) {
      if (Math.min(cpuRanges[k][1], cpuEnd) - Math.max(cpuRanges[k][0], cpuStart) > 0) {
        cpuStart = cpuRanges[k][1];
        cpuEnd = cpuStart + cpuTime;
      }
    }
    cpuRanges.push([cpuStart, cpuEnd]);
    time = cpuEnd;
  }
  return time;
}
