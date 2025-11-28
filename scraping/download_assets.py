import argparse
import json
import sys
import time
from pathlib import Path
from urllib.parse import urlparse
from urllib.request import Request, urlopen


def load_urls(lang: str, data_dir: Path) -> list[str]:
    path = data_dir / lang / "image_urls.json"
    if not path.exists():
        raise FileNotFoundError(f"Missing image_urls.json for {lang} at {path}")
    with path.open("r", encoding="utf-8") as f:
        return json.load(f)


def download(
    url: str,
    dest: Path,
    timeout: int,
    retries: int,
    backoff: float,
    force: bool,
) -> tuple[bool, str]:
    dest.parent.mkdir(parents=True, exist_ok=True)
    if dest.exists() and not force:
        return True, "exists"

    attempt = 0
    while attempt <= retries:
        if attempt:
            time.sleep(backoff * attempt)
        attempt += 1
        req = Request(url)
        try:
            with urlopen(req, timeout=timeout) as resp:
                if resp.status != 200:
                    msg = f"status {resp.status}"
                else:
                    dest.write_bytes(resp.read())
                    return True, "ok"
        except Exception as exc:  # pragma: no cover - network path
            msg = str(exc)
        # retry unless we've exhausted attempts
        if attempt > retries:
            return False, msg
    return False, "unknown"


def download_lang(
    lang: str,
    data_dir: Path,
    assets_dir: Path,
    timeout: int,
    delay: float,
    retries: int,
    backoff: float,
    force: bool,
    failure_log: Path | None,
) -> dict:
    urls = load_urls(lang, data_dir)
    successes = 0
    skips = 0
    failures = []

    for idx, url in enumerate(urls, 1):
        path = urlparse(url).path.lstrip("/")
        dest = assets_dir / lang / path
        ok, msg = download(url, dest, timeout, retries, backoff, force)
        if msg == "exists":
            skips += 1
        elif ok:
            successes += 1
        else:
            failures.append((url, msg))
        if delay:
            time.sleep(delay)
        if idx % 500 == 0:
            print(f"[{lang}] {idx}/{len(urls)} processed...")

    summary = {
        "lang": lang,
        "total": len(urls),
        "downloaded": successes,
        "skipped": skips,
        "failed": len(failures),
        "failures": failures,
    }

    if failure_log:
        failure_log.parent.mkdir(parents=True, exist_ok=True)
        with failure_log.open("w", encoding="utf-8") as f:
            json.dump(failures, f, ensure_ascii=False, indent=2)

    return summary


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Download all images listed in data/<LANG>/image_urls.json into assets/<LANG>/."
    )
    parser.add_argument(
        "--langs",
        nargs="+",
        default=["EN"],
        help="Languages to download (default: EN). Example: EN PT ES FR ID TH CN",
    )
    parser.add_argument(
        "--data-dir",
        type=Path,
        default=Path("data"),
        help="Base directory containing <LANG>/image_urls.json files.",
    )
    parser.add_argument(
        "--assets-dir",
        type=Path,
        default=Path("assets"),
        help="Base directory to store downloaded assets.",
    )
    parser.add_argument(
        "--timeout",
        type=int,
        default=30,
        help="HTTP timeout per request in seconds (default: 30).",
    )
    parser.add_argument(
        "--delay",
        type=float,
        default=0.0,
        help="Optional delay in seconds between requests.",
    )
    parser.add_argument(
        "--retries",
        type=int,
        default=3,
        help="Retries per URL on failure (default: 3).",
    )
    parser.add_argument(
        "--backoff",
        type=float,
        default=1.5,
        help="Backoff multiplier (seconds) between retries (default: 1.5).",
    )
    parser.add_argument(
        "--force",
        action="store_true",
        help="Re-download and overwrite existing files.",
    )
    parser.add_argument(
        "--failure-log",
        type=Path,
        default=None,
        help="Optional path to write JSON list of failed downloads per run.",
    )
    args = parser.parse_args()

    summaries = []
    for lang in args.langs:
        print(f"==> Downloading assets for {lang} ...")
        log_path = None
        if args.failure_log:
            # If user specified a single log path, make it language-specific.
            log_path = args.failure_log
            if log_path.is_dir() or log_path.suffix == "":
                log_path = log_path / f"{lang}_failures.json"
        summaries.append(
            download_lang(
                lang,
                args.data_dir,
                args.assets_dir,
                args.timeout,
                args.delay,
                args.retries,
                args.backoff,
                args.force,
                log_path,
            )
        )

    print("\nSummary:")
    for s in summaries:
        print(
            f"{s['lang']}: total={s['total']} downloaded={s['downloaded']} "
            f"skipped={s['skipped']} failed={s['failed']}"
        )
        if s["failed"]:
            for url, err in s["failures"][:10]:
                print(f"  - {url} -> {err}")
            if s["failed"] > 10:
                print(f"  ... {s['failed'] - 10} more failures")


if __name__ == "__main__":
    main()
