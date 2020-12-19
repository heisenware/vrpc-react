#!/bin/bash

# Make sure the script runs in the directory in which it is placed
DIR=$(dirname `[[ $0 = /* ]] && echo "$0" || echo "$PWD/${0#./}"`); cd $DIR

# Create project name using random name
PROJECT=ci${RANDOM}

# Test container name
export CONTAINER=${PROJECT}_cypress

# define some colors to use for output
RED='\033[0;31m'
GREEN='\033[0;32m'
NC='\033[0m'

# kill and remove any running containers
cleanup () {
  if [[ "$1" == "prod" ]]; then
    docker-compose -p ${PROJECT} -f docker-compose.yml -f docker-compose.prod.yml down
  else
    docker-compose -p ${PROJECT} down
  fi
}

# catch unexpected failures, do cleanup and output an error message
trap 'cleanup ; printf "${RED}Tests Failed For Unexpected Reasons${NC}\n"'\
  HUP INT QUIT PIPE TERM

# run the composed services
if [[ "$1" == "prod" ]]; then
  docker-compose -p ${PROJECT} -f docker-compose.yml -f docker-compose.prod.yml up -d --build
else
  docker-compose -p ${PROJECT} up -d
fi

if [ $? -ne 0 ] ; then
  printf "${RED}Docker Compose Failed (${CONTAINER})${NC}\n"
  exit -1
fi

docker logs -f ${CONTAINER}

TEST_EXIT_CODE=`docker inspect ${CONTAINER} --format='{{.State.ExitCode}}'`

# inspect the output of the test and display respective message
if [ -z ${TEST_EXIT_CODE+x} ] || [ "$TEST_EXIT_CODE" != "0" ] ; then
  printf "${RED}Tests Failed (${CONTAINER})${NC} - Exit Code: $TEST_EXIT_CODE\n"
else
  printf "${GREEN}Tests Passed (${CONTAINER})${NC}\n"
fi
# call the cleanup fuction
cleanup
# exit the script with the same code as the test service code
exit $TEST_EXIT_CODE
