#!/bin/bash

docker compose run --rm  certbot certonly -m bah.amdouth96@gmail.com --agree-tos --webroot --webroot-path /var/www/certbot/ -d $1
