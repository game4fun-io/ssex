import json
import os
import time
from pathlib import Path
from urllib.request import Request, urlopen

def download_skills():
    json_path = Path('scraping/data/EN/image_urls.json')
    with open(json_path, 'r') as f:
        urls = json.load(f)

    # Filter for SkillIcon
    skill_urls = [url for url in urls if 'SkillIcon' in url]
    
    print(f"Found {len(skill_urls)} skill icons to download.")

    base_dest = Path('packages/client/public/assets')
    
    for i, url in enumerate(skill_urls):
        # Extract path from URL
        # URL: https://seiya2.vercel.app/assets/resources/textures/hero/skillicon/texture/SkillIcon_10241.png
        # Path: resources/textures/hero/skillicon/texture/SkillIcon_10241.png
        
        if '/assets/' in url:
            rel_path = url.split('/assets/')[1]
        else:
            print(f"Skipping weird URL: {url}")
            continue
            
        dest = base_dest / rel_path
        
        if dest.exists():
            # print(f"Skipping existing: {dest}")
            continue
            
        print(f"Downloading {i+1}/{len(skill_urls)}: {rel_path}")
        
        dest.parent.mkdir(parents=True, exist_ok=True)
        
        try:
            req = Request(url)
            with urlopen(req, timeout=30) as resp:
                if resp.status == 200:
                    dest.write_bytes(resp.read())
                else:
                    print(f"Failed to download {url}: Status {resp.status}")
        except Exception as e:
            print(f"Error downloading {url}: {e}")
            
        time.sleep(0.1)

if __name__ == '__main__':
    download_skills()
