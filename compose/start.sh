#!/usr/bin/env bash

# Start the services
# this should run for two options : dev and ci
# dev should run the services with the compose.yml file
# ci should run the services with the compose.ci.yml file

# Check if the correct number of arguments is passed
if [ "$#" -ne 1 ]; then
    echo "Usage: $0 <dev|ci>"
    exit 1
fi

option=$1
compose_file="compose.yml"
if [ "$option" = "dev" ]; then
    compose_file="compose.yml"
elif [ "$option" = "ci" ]; then
    compose_file="compose.ci.yml"
else
    echo "Invalid option: $option"
    exit 1
fi

docker-compose -f "$compose_file" down
docker-compose -f "$compose_file" up -d --build
./export.sh keycloak import
