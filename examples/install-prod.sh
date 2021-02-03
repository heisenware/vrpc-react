#!/usr/bin/env bash

set -euo pipefail
IFS=$'\n\t'

cd $(dirname `[[ $0 = /* ]] && echo "$0" || echo "$PWD/${0#./}"`)

DIR=$PWD

cd ../examples/vrpc-react-todos-1/frontend

npm install --only=prod
npm run build

cd $DIR

cd ../examples/vrpc-react-todos-2/frontend

npm install --only=prod
npm run build

cd $DIR
