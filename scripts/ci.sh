#!/bin/sh

chmod +x ./dx-bamboo-scripts/_yarn.sh
. ./dx-bamboo-scripts/_yarn.sh

#y_run_test
y_run_build
cd dist
y_run_publish
