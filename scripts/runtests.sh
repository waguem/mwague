#/usr/bin/env bash
echo "Running backend unitests"
#docker exec -it mkdi-backend pytest /backend
echo "Running functional tests"
#docker exec -it mkdi-backend pytest /mkdi-shared
docker exec -it mkdi-backend behave /functional-tests/features
