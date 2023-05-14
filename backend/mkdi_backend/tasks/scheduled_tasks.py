from loguru import logger
from mkdi_backend.tasks.worker import app


@app.task(name="first_task")
def first_taks():
    logger.info("first task")


@app.task(name="second_task")
def second_task():
    logger.info("second task")
