# Description

This script is made for measuring NodeJS EventLoop performance under concurrent load.

# Installation

You need NodeJS >= 0.8.15 installed.

	git clone _this_repo_
	cd node-bench
	npm install

# Run

	node bench.js --cpu 10 -t 57 -n 100 -c 10

# Options

###--cpu
Percentage of CPU time within each request. Any value between `0` and `100`.

###-t
Time of the request. And numeric value is valid.

###-n
Number of requests to make.

###-c
Concurrency level.
