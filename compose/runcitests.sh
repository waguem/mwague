#/usr/bin/env bash
echo "Running backend unitests"
#docker exec -it mkdi-backend pytest /backend
echo "Running functional tests"
#docker exec -it mkdi-backend pytest /mkdi-shared
docker exec -i bdd /run.sh http://backend:8080/api/v1/ping

# show result
echo "[TESTS RESULT]: $?";
