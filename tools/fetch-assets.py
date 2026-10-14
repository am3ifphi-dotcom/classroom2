"""Re-fetch exact external source blobs using the already-authenticated gh CLI.

Usage: python tools/fetch-assets.py
No secrets are read, printed, embedded or stored by this script.
Normal npm builds use the committed derivatives and do not require this step.
"""
import base64
from concurrent.futures import ThreadPoolExecutor
import hashlib
import json
from pathlib import Path
import subprocess

ROOT = Path(__file__).resolve().parents[1]
manifest = json.loads((ROOT / 'public/asset-sources.json').read_text())

def fetch(entry):
    target = (ROOT / entry['downloadTo']).resolve()
    if not target.is_relative_to(ROOT):
        raise ValueError('Destination must remain inside the project')
    data = json.loads(subprocess.check_output([
        'gh', 'api', f"repos/{entry['repository']}/git/blobs/{entry['blob']}"
    ]))
    content = base64.b64decode(data['content'])
    # Git's blob SHA also authenticates the expected source version.
    actual = hashlib.sha1(b'blob ' + str(len(content)).encode() + b'\0' + content).hexdigest()
    if actual != entry['blob']:
        raise ValueError('Unexpected blob hash: ' + entry['source'])
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_bytes(content)
    print(entry['downloadTo'])

if __name__ == '__main__':
    with ThreadPoolExecutor(max_workers=4) as pool:
        list(pool.map(fetch, manifest['sources']))
    print('External sources fetched. Review public/CREDITS.md before redistribution.')
