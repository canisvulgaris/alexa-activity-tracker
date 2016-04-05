#!/bin/bash

DATE=$(date +%Y%m%d%H%M%S)

cd src/
zip -D pkg-${DATE}.zip *.js
cd ../
mv src/pkg-${DATE}.zip archives/