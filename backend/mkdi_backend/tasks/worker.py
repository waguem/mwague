import os

from celery import Celery
from loguru import logger

"""
To run the worker run `celery run -A mkdi_backend.taks.worker worker -l INFO`
in the parent directory of this file, add -B to embed the beat scheduler inside
the worker.
"""
app = Celery(
    "mkdi_worker",
    broker=os.environ.get("CELERY_BROKER_URL", "redis://localhost:6379/0"),
    backend=os.environ.get("CELERY_RESULT_BACKEND", "redis://localhost:6379/0"),
    include=["mkdi_backend.tasks.scheduled_tasks"],
)

logger.info(f"celery.conf.broker_url {app.conf.broker_url}, app.conf.result_backend{app.conf.result_backend}")

# see https://docs.celeryq.dev/en/stable/userguide/periodic-tasks.html
app.conf.beat_schedule = {
    "first-task": {
        "task": "first_task",
        "schedule": 10.0,  # seconds
    },
}
app.conf.timezone = "UTC"
