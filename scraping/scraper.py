import argparse
import json
import sys
from pathlib import Path
from typing import Dict, Iterable, List, Optional, Set
from urllib.parse import urlencode, urlparse
from urllib.request import Request, urlopen

# Supabase settings pulled from the site's public bundle
SUPABASE_URL = "https://pjpllpocwyuuvgacbbot.supabase.co"
SUPABASE_KEY = (
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9."
    "eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBqcGxscG9jd3l1dXZnYWNiYm90Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE3NTM5MDIs"
    "ImV4cCI6MjA3NzMyOTkwMn0.Hhf3Gt3ZdpNF002eU9ic-S81fM14D99N2aqPWLWRFAM"
)
ASSET_BASE = "https://seiya2.vercel.app"

TABLES: Dict[str, List[str]] = {
    "heroes": [
        "RoleConfig",
        "RoleResourcesConfig",
        "HeroTypeDescConfig",
        "HeroConfig",
        "HeroQualitySkillConfig",
        "HeroAwakenConfig",
        "HeroAwakenInfoConfig",
        "HeroRelationConfig",
        "HeroFettersConfig",
        "HeroRelationSkillConfig",
    ],
    "skills": ["SkillConfig", "SkillLabelConfig", "SkillValueConfig"],
    "artifacts": ["ArtifactConfig", "ArtifactResourcesConfig"],
    "force_cards": [
        "ForceCardItemConfig",
        "ForceCardLevelConfig",
        "ForceCardStarConfig",
        "ForceCardSuitConfig",
        "ForceCardSkillConfig"
    ],
}


def http_get(
    url: str,
    *,
    params: Optional[Dict[str, str]] = None,
    headers: Optional[Dict[str, str]] = None,
    timeout: int = 30,
) -> tuple[int, bytes]:
    full_url = url
    if params:
        query = urlencode(params)
        delimiter = "&" if "?" in url else "?"
        full_url = f"{url}{delimiter}{query}"

    req = Request(full_url, headers=headers or {})
    with urlopen(req, timeout=timeout) as resp:
        status = resp.status
        body = resp.read()
    return status, body


def supabase_get(
    path: str,
    *,
    params: Optional[Dict[str, str]] = None,
    extra_headers: Optional[Dict[str, str]] = None,
    timeout: int = 30,
) -> tuple[int, bytes]:
    headers = {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
    }
    if extra_headers:
        headers.update(extra_headers)
    return http_get(f"{SUPABASE_URL}{path}", params=params, headers=headers, timeout=timeout)


def fetch_table(table: str, select: str = "*", chunk_size: int = 1000) -> List[dict]:
    """Pulls a full table via the Supabase REST API, paging with Range headers."""
    rows: List[dict] = []
    offset = 0

    while True:
        status, body = supabase_get(
            f"/rest/v1/{table}",
            params={"select": select},
            extra_headers={"Range": f"{offset}-{offset + chunk_size - 1}"},
        )
        if status not in (200, 206):
            raise RuntimeError(f"Failed to fetch {table}: status {status}, body={body[:200]!r}")

        batch = json.loads(body.decode("utf-8"))
        rows.extend(batch)
        if len(batch) < chunk_size:
            break
        offset += chunk_size

    return rows


def save_json(path: Path, data: object) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)


def collect_image_urls(all_tables: Dict[str, List[dict]]) -> Set[str]:
    urls: Set[str] = set()

    # Hero portraits and banners
    role_rows = all_tables.get("RoleConfig", [])
    role_ids = {row.get("id") for row in role_rows if row.get("id") is not None}
    for rid in role_ids:
        urls.add(f"{ASSET_BASE}/assets/resources/textures/hero/squareherohead/SquareHeroHead_{rid}0.png")
        urls.add(f"{ASSET_BASE}/assets/resources/textures/hero/circleherohead/CircleHeroHead_{rid}0.png")
        urls.add(f"{ASSET_BASE}/assets/resources/textures/hero/skillicon/skillbanner/SuperSkill_{rid}0.png")

    # Skill icons
    skill_rows = all_tables.get("SkillConfig", [])
    for row in skill_rows:
        skill_id = row.get("skillid")
        if skill_id is None:
            continue
        urls.add(f"{ASSET_BASE}/assets/resources/textures/hero/skillicon/texture/SkillIcon_{skill_id}.png")

    # Artifacts
    for row in all_tables.get("ArtifactResourcesConfig", []):
        preview = row.get("preview_icon")
        if not preview:
            continue
        path = preview.replace("Textures/", "").lower()
        urls.add(f"{ASSET_BASE}/assets/resources/textures/{path}.png")

    # Force cards
    for row in all_tables.get("ForceCardItemConfig", []):
        cid = row.get("id")
        if cid is None:
            continue
        urls.add(f"{ASSET_BASE}/assets/resources/textures/dynamis/card/Card_small_{cid}.png")
        urls.add(f"{ASSET_BASE}/assets/resources/textures/dynamis/card/Card_{cid}.png")
    urls.add(f"{ASSET_BASE}/assets/resources/textures/dynamis/card/ItemIcon_10000.png")

    return urls


def download_images(urls: Iterable[str], out_dir: Path) -> List[str]:
    downloaded: List[str] = []
    for url in urls:
        path = urlparse(url).path.lstrip("/")
        dest = out_dir / path
        if dest.exists():
            continue
        dest.parent.mkdir(parents=True, exist_ok=True)
        try:
            status, body = http_get(url, timeout=45)
        except Exception as exc:  # pragma: no cover - network issues
            print(f"!! Failed to fetch {url}: {exc}", file=sys.stderr)
            continue

        if status == 200:
            dest.write_bytes(body)
            downloaded.append(str(dest))
        else:
            print(f"!! Failed to fetch {url}: status {status}", file=sys.stderr)
    return downloaded


def scrape(lang: str, download_assets: bool, out_dir: Path, assets_dir: Path) -> None:
    tables: Dict[str, List[dict]] = {}

    # Core tables
    for group in TABLES.values():
        for table in group:
            if table in tables:
                continue
            print(f"Fetching table {table}...")
            try:
                tables[table] = fetch_table(table)
            except Exception as e:
                print(f"Warning: Failed to fetch table {table}: {e}", file=sys.stderr)

    # Language table for translating LC_* keys
    lang_table = f"LanguagePackage_{lang.upper()}"
    try:
        print(f"Fetching translations table {lang_table}...")
        tables[lang_table] = fetch_table(lang_table)
    except Exception as exc:  # pragma: no cover - best-effort fetch
        print(f"Could not fetch {lang_table}: {exc}", file=sys.stderr)

    # Write individual table files
    for name, rows in tables.items():
        save_json(out_dir / "tables" / f"{name}.json", rows)

    # Build image manifest
    image_urls = sorted(collect_image_urls(tables))
    save_json(out_dir / "image_urls.json", image_urls)

    if download_assets:
        print(f"Downloading {len(image_urls)} images...")
        downloaded = download_images(image_urls, assets_dir)
        save_json(out_dir / "downloaded_images.json", downloaded)
        print(f"Saved {len(downloaded)} images into {assets_dir}")

    # Save a quick manifest for visibility
    summary = {
        "tables": {k: len(v) for k, v in tables.items()},
        "image_url_count": len(image_urls),
        "assets_downloaded": download_assets,
    }
    save_json(out_dir / "summary.json", summary)
    print("Done.")


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Scrape seiya2.vercel.app data and assets via its public Supabase."
    )
    parser.add_argument("--lang", default="EN", help="Language package to fetch (e.g. EN, PT, CN).")
    parser.add_argument(
        "--download-images",
        action="store_true",
        help="Download all referenced images instead of only writing a URL manifest.",
    )
    parser.add_argument(
        "--out-dir",
        default="output",
        type=Path,
        help="Directory to write JSON data.",
    )
    parser.add_argument(
        "--assets-dir",
        default="assets",
        type=Path,
        help="Directory to save downloaded images when --download-images is set.",
    )
    args = parser.parse_args()

    scrape(args.lang, args.download_images, args.out_dir, args.assets_dir)


if __name__ == "__main__":
    main()
