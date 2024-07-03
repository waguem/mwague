#/usr/bin/env bash
echo "Running backend unitests"
echo "Running functional tests"
docker exec -i bdd /run.sh http://backend-ci:80/api/v1/ping

success=$?
# show result
echo "[TESTS RESULT]: $success";
exit $success
