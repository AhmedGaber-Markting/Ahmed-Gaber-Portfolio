"""Refresh the local/offline content bundles after editing content.json."""
import copy
import json
from pathlib import Path

root=Path(__file__).resolve().parent.parent
data=json.loads((root/'content.json').read_text(encoding='utf-8'))
document_content={document['id']: copy.deepcopy(document.pop('blocks', [])) for document in data['documents']}

def javascript_assignment(variable, value):
    payload=json.dumps(value,ensure_ascii=False,separators=(',',':')).replace(chr(0x2028),'\\u2028').replace(chr(0x2029),'\\u2029')
    return '/* Generated from content.json. */\nwindow.'+variable+' = '+payload+';\n'

(root/'content-data.js').write_text(javascript_assignment('AHMED_PORTFOLIO_DATA',data),encoding='utf-8')
(root/'document-content.js').write_text(javascript_assignment('AHMED_PORTFOLIO_DOCUMENT_CONTENT',document_content),encoding='utf-8')
print('content-data.js and document-content.js are up to date.')
