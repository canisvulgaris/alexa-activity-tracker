#!/bin/bash

#testing GetLastActivityIntent
lambda-local -l src/index.js -h handler -e eventSamples/GetLastActivityIntent.json

#testing GetNextActivityIntent
#lambda-local -l src/index.js -h handler -e eventSamples/GetNextActivityIntent.json