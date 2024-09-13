from datetime import datetime, timedelta


def get_month_range(start: str | None, end: str | None):
    today = datetime.now()
    date_format = "%Y-%m-%dT%H:%M:%S.%fZ"
    if not start:
        # get the first day of the month
        start_date = today.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    else:
        start_date = datetime.strptime(start, date_format)

    if not end:
        end_date = today.replace(day=28) + timedelta(days=4)
    else:
        end_date = datetime.strptime(end, date_format)

    return start_date, end_date
