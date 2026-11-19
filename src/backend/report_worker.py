"""Run alongside the API: python report_worker.py."""
import time
import logging
from app.db.session import SessionLocal
from app.services.report_service import process_next


def main():
    while True:
        try:
            with SessionLocal() as db:
                worked = process_next(db)
            if not worked:
                time.sleep(2)
        except Exception:
            logging.exception('Export worker could not access its queue')
            time.sleep(5)


if __name__ == '__main__':
    main()
