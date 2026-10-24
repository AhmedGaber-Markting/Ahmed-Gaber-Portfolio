"""Refresh the local/offline content fallback after editing content.json."""
import json
from pathlib import Path
root=Path(__file__).resolve().parent.parent
data=json.loads((root/'content.json').read_text(encoding='utf-8'))
script='/* Generated from content.json. */\nwindow.AHMED_PORTFOLIO_DATA = '+json.dumps(data,ensure_ascii=False,separators=(',',':')).replace(chr(0x2028),'\\u2028').replace(chr(0x2029),'\\u2029')+';\n'
(root/'content-data.js').write_text(script,encoding='utf-8')
print('content-data.js is up to date.')
