"""
Bug Reaper revenue cron — runs the autonomous pipeline on a schedule.

Usage:
  python cron.py               # run once then exit (for cron / Cloud Run Jobs)
  python cron.py --loop 3600   # run every 3600 seconds (1 hour)
  python cron.py --batch 20    # process up to 20 leads per run

Environment:
  PIPELINE_BATCH_SIZE   (default 50) — leads per run
  PIPELINE_LOOP_SECS    (default 0)  — seconds between runs; 0 = run once
"""

from __future__ import annotations

import argparse
import logging
import os
import time

logging.basicConfig(
    level=os.getenv("LOG_LEVEL", "INFO"),
    format="%(asctime)s [%(levelname)s] %(name)s — %(message)s",
)
logger = logging.getLogger("bugreaper.cron")


def run_once(batch_size: int) -> None:
    from engine.pipeline import run_batch

    logger.info("Starting pipeline batch (limit=%d)", batch_size)
    results = run_batch(limit=batch_size)

    sent = sum(1 for r in results if r.get("email_sent"))
    skipped = sum(1 for r in results if r.get("skipped"))
    errors = sum(1 for r in results if r.get("error"))

    logger.info(
        "Batch complete — %d processed | %d emails sent | %d skipped | %d errors",
        len(results),
        sent,
        skipped,
        errors,
    )
    for r in results:
        if r.get("error"):
            logger.error("Lead %s error: %s", r.get("lead_id"), r["error"])
        elif r.get("skipped"):
            logger.debug("Lead %s skipped: %s", r.get("lead_id"), r["skipped"])
        elif r.get("success"):
            logger.info(
                "Lead %s → %s | score %.0f | %d findings | email=%s",
                r["lead_id"],
                r["domain"],
                r["score_pct"],
                r["findings"],
                "sent" if r["email_sent"] else "queued",
            )


def main() -> None:
    parser = argparse.ArgumentParser(description="Bug Reaper revenue pipeline runner")
    parser.add_argument("--batch", type=int, default=int(os.getenv("PIPELINE_BATCH_SIZE", "50")))
    parser.add_argument("--loop", type=int, default=int(os.getenv("PIPELINE_LOOP_SECS", "0")),
                        help="Loop interval in seconds (0 = run once)")
    args = parser.parse_args()

    if args.loop > 0:
        logger.info("Running in loop mode every %ds", args.loop)
        while True:
            try:
                run_once(args.batch)
            except KeyboardInterrupt:
                logger.info("Stopped by user")
                break
            except Exception:
                logger.exception("Unhandled error in pipeline run — will retry")
            time.sleep(args.loop)
    else:
        run_once(args.batch)


if __name__ == "__main__":
    main()
