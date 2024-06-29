
echo "Running inside /app/prestart.sh, you could add migrations to this file, e.g.:"

echo "
#! /usr/bin/env bash

# Let the DB start
sleep 10;
# Run migrations
alembic upgrade head
"
# echo "updating pip"
# pip install --upgrade pip
# echo "installing requirements"
pip install --no-cache-dir -r /backend/requirements.txt
pip install debugpy
pip install -e /mkdi-shared[dev]
pip install -e /functional-tests[dev]
echo "running migrations"
cd /backend
echo "waiting 3 seconds for db to start"
sleep 3;
alembic upgrade head
echo "migrations complete"
