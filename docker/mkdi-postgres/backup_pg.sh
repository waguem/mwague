#!/bin/bash

set -e
set -x
# filename with timestamp
filename="postgres-mkdi-$(date +%Y-%m-%d_%H-%M-%S).sql.gz"
pg_dump -U $POSTGRES_USER $POSTGRES_PASSWORD | gzip -c > $BACKUP_DIR/$filename
