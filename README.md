# Deprecation Notice

This project has been archived and will no longer receive maintenance or updates. I want to express my gratitude to the entire community for your usage and contributions.

# Description

This script is made for measuring NodeJS EventLoop performance under concurrent load.

# Installation

You need NodeJS >= 0.8.15 installed.

	git clone https://github.com/ybogdanov/node-bench
	cd node-bench
	npm install

# Run

	node bench.js --cpu 10 -t 57 -n 100 -c 10
	
Example result:

	IO/CPU = 90/10, 57ms/req | took 1176ms, avg 115ms/req (x2)

# Options

###--cpu `int`
Percentage of CPU time within each request. Any value between `0` and `100`.

###-t `int`
Time of the request. 

###-n `int`
Number of requests to make.

###-c `int`
Concurrency level.
