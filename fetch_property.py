import json
import sys
from urllib.request import Request, urlopen
from urllib.parse import urlencode

SUPABASE_URL = "https://pjpllpocwyuuvgacbbot.supabase.co"
SUPABASE_KEY = (
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9."
    "eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBqcGxscG9jd3l1dXZnYWNiYm90Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE3NTM5MDIs"
    "ImV4cCI6MjA3NzMyOTkwMn0.Hhf3Gt3ZdpNF002eU9ic-S81fM14D99N2aqPWLWRFAM"
)

def supabase_get(path, params=None):
    headers = {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
    }
    url = f"{SUPABASE_URL}{path}"
    if params:
        url += "?" + urlencode(params)
    
    req = Request(url, headers=headers)
    try:
        with urlopen(req) as resp:
            return resp.status, resp.read()
    except Exception as e:
        return 500, str(e).encode()

def fetch_table(table):
    print(f"Trying to fetch {table}...")
    status, body = supabase_get(f"/rest/v1/{table}", params={"select": "*", "limit": "10"})
    if status == 200:
        print(f"Success! Found {table}.")
        data = json.loads(body)
        print(json.dumps(data, indent=2))
        return True
    else:
        print(f"Failed to fetch {table}: {status}")
        return False

tables_to_try = ["PropertyConfig", "AttributeConfig", "StatusConfig", "HeroPropertyConfig", "RolePropertyConfig"]

for table in tables_to_try:
    if fetch_table(table):
        break
