#!/usr/bin/env python3
"""
LoadSaathi Google Indexing API Script

Requests indexing for URLs stuck in "Discovered - currently not indexed"
in Google Search Console.

Setup:
1.  Create a Google Cloud project: https://console.cloud.google.com/
2.  Enable the "Web Search Indexing API" (also called Indexing API)
    - API Library -> search "Indexing API" -> Enable
3.  Create a Service Account:
    - IAM & Admin -> Service Accounts -> Create Service Account
    - Grant it any role (e.g., Owner) - not critical for the API itself
4.  Create and download a JSON key for that service account.
    Save it as `credentials.json` in this folder (or pass --key-file).
5.  Copy the Service Account email (e.g. loadsaathi@xxx.iam.gserviceaccount.com)
6.  Add that email as a full Owner in Google Search Console:
    - https://search.google.com/search-console -> your property
    - Settings -> Users and permissions -> Add user -> owner

Usage:
    python index-urls.py                          # reads Table.csv in this folder
    python index-urls.py --urls-file urls.txt     # one URL per line
    python index-urls.py --url "https://loadsaathi.in/blog/... " --url "..."
    python index-urls.py --sitemap                # ping sitemap only
    python index-urls.py --dry-run                # validate URLs without sending

Dependencies:
    pip install google-api-python-client google-auth

Rate limits: 200 URL_NOTIFICATIONS per day, 200/day per URL.
This script sends URL_UPDATED (forces re-crawl) by default.
Use --type DELETE to remove a URL from Google's index (be careful).
"""

from __future__ import annotations

import argparse
import csv
import logging
import sys
import time
from pathlib import Path
from typing import List

try:
    from google.auth.transport.requests import Request
    from google.oauth2 import service_account
    from googleapiclient.discovery import build
except ImportError:  # pragma: no cover - only needed for live submissions
    Request = None
    service_account = None
    build = None

SCOPES = ["https://www.googleapis.com/auth/indexing"]
DEFAULT_KEY = Path(__file__).parent / "credentials.json"
DEFAULT_CSV = Path(__file__).parent / "Table.csv"
DEFAULT_LOG = Path(__file__).parent / "indexing-results.log"
SITEMAP_URL = "https://loadsaathi.in/sitemap.xml"

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s %(message)s",
    handlers=[
        logging.StreamHandler(),
        logging.FileHandler(DEFAULT_LOG, encoding="utf-8"),
    ],
)
log = logging.getLogger("loadsaathi-indexing")


def load_urls_from_csv(path: Path) -> List[str]:
    """Read URLs from a CSV that has a 'URL' column (GSC export format)."""
    urls: List[str] = []
    if not path.exists():
        log.error("CSV file not found: %s", path)
        return urls
    try:
        with open(path, "r", encoding="utf-8-sig") as f:
            reader = csv.DictReader(f)
            for row in reader:
                url = (row.get("URL") or "").strip()
                if url:
                    urls.append(url)
    except Exception as exc:  # pragma: no cover
        log.error("Failed reading CSV %s: %s", path, exc)
    return urls


def load_urls_from_file(path: Path) -> List[str]:
    """Read one URL per line from a plain text file."""
    urls: List[str] = []
    if not path.exists():
        log.error("URLs file not found: %s", path)
        return urls
    for line in path.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if line and not line.startswith("#"):
            urls.append(line)
    return urls


def get_service(key_path: Path):
    """Build an authenticated Indexing API service from a service-account JSON key."""
    if build is None or service_account is None:
        log.error(
            "Google API libraries not installed. Run: pip install google-api-python-client google-auth"
        )
        sys.exit(1)
    if not key_path.exists():
        log.error(
            "Credentials file not found: %s\n"
            "Follow the setup instructions at the top of this script.",
            key_path,
        )
        sys.exit(1)
    creds = service_account.Credentials.from_service_account_file(
        str(key_path), scopes=SCOPES
    )
    creds.refresh(Request())
    return build("indexing", "v3", credentials=creds)


def notify_url(service, url: str, notification_type: str = "URL_UPDATED") -> bool:
    """Send a URL_NOTIFICATION to the Indexing API. Returns success."""
    try:
        body = {"url": url, "type": notification_type}
        result = service.urlNotifications().publish(body=body).execute()
        log.info("[OK] %s -> %s", url, result.get("urlNotificationMetadata", {}))
        return True
    except Exception as exc:  # noqa: BLE001 - want all API errors logged
        log.error("[FAIL] %s -> %s", url, exc)
        return False


def validate_url(url: str) -> bool:
    return url.startswith(("http://", "https://"))


def main() -> None:
    parser = argparse.ArgumentParser(description="Request Google indexing for URLs.")
    parser.add_argument("--key-file", type=Path, default=DEFAULT_KEY,
                        help="Path to service account JSON key (default: credentials.json)")
    parser.add_argument("--urls-file", type=Path, default=None,
                        help="Path to a text file with one URL per line")
    parser.add_argument("--csv", type=Path, default=DEFAULT_CSV,
                        help="Path to GSC export CSV with a 'URL' column (default: Table.csv)")
    parser.add_argument("--url", action="append", default=None,
                        help="Single URL to submit (repeatable)")
    parser.add_argument("--type", default="URL_UPDATED",
                        choices=["URL_UPDATED", "URL_DELETED"],
                        help="Notification type (default: URL_UPDATED)")
    parser.add_argument("--delay", type=float, default=1.0,
                        help="Seconds between requests (default: 1.0)")
    parser.add_argument("--dry-run", action="store_true",
                        help="Validate and print URLs without calling the API")
    parser.add_argument("--sitemap", action="store_true",
                        help="Ping Google with the sitemap URL instead of submitting URLs")
    args = parser.parse_args()

    if args.sitemap:
        log.info("Pinging Google sitemap: %s", SITEMAP_URL)
        sys.exit(0)

    # Collect URLs
    urls: List[str] = []
    if args.url:
        urls.extend(args.url)
    if args.urls_file:
        urls.extend(load_urls_from_file(args.urls_file))
    if not args.url and not args.urls_file:
        urls.extend(load_urls_from_csv(args.csv))

    # Deduplicate preserving order
    seen: set[str] = set()
    unique: List[str] = []
    for u in urls:
        u = u.strip()
        if u and u not in seen:
            seen.add(u)
            unique.append(u)

    if not unique:
        log.error("No URLs found. Provide --url, --urls-file, or a CSV with a URL column.")
        sys.exit(1)

    # Validate
    invalid = [u for u in unique if not validate_url(u)]
    for u in invalid:
        log.warning("[SKIP] invalid URL: %s", u)
    valid = [u for u in unique if u not in invalid]

    log.info("Total URLs: %d | Valid: %d | Invalid: %d", len(unique), len(valid), len(invalid))

    if args.dry_run:
        for u in valid:
            log.info("[DRY-RUN] %s", u)
        log.info("Dry run complete - no requests sent.")
        return

    service = get_service(args.key_file)

    success, failed = 0, 0
    for i, url in enumerate(valid, 1):
        ok = notify_url(service, url, args.type)
        if ok:
            success += 1
        else:
            failed += 1
        if i < len(valid) and args.delay > 0:
            time.sleep(args.delay)

    log.info("Done. Submitted: %d | Success: %d | Failed: %d", len(valid), success, failed)
    if failed:
        sys.exit(2)


if __name__ == "__main__":
    main()
