#/usr/bin/env bash
echo "Running backend unitests"
echo "Running functional tests"
docker exec -i bdd /run.sh http://backend:80/api/v1/ping

# show result
echo "[TESTS RESULT]: $?";
