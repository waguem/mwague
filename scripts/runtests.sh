#/usr/bin/env bash
echo "Running backend unitests"
docker exec -it mkdi-backend-dev pytest /backend
echo "Running functional tests"
docker exec -it mkdi-backend-dev pytest /mkdi-shared
docker exec -it mkdi-backend-dev behave /functional-tests/features
