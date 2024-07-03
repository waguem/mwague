
echo "Running inside /app/prestart.sh, you could add migrations to this file, e.g.:"

echo "
#! /usr/bin/env bash

# Let the DB start
sleep 10;
# Run migrations
alembic upgrade head
"
pip install --no-cache-dir -r /backend/requirements.txt
pip install debugpy
pip install -e /mkdi-shared[dev]
echo "running migrations"
# if the /client directory exists, install the client
cd /backend
echo "waiting 10 seconds for db to start"
sleep 5;
# alembic upgrade head
echo "migrations complete"
