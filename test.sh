#!/bin/bash

#testing GetLastActivityIntent
lambda-local -l src/index.js -h handler -e eventSamples/GetLastActivityIntent.json