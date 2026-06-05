import json

path = '/Users/williamkshaw/.gemini/antigravity/brain/11d824bc-ffa7-4c59-b698-bd81c2a14698/.system_generated/logs/transcript.jsonl'
with open(path, 'r') as f:
    for line in f:
        try:
            data = json.loads(line)
            if data.get('source') == 'SYSTEM' and data.get('type') == 'TOOL_RESPONSE':
                content = data.get('content', '')
                if 'File Path: `file:///Users/williamkshaw/antigravity/Vice-Vault/src/App.tsx`' in content:
                    print(f"Found view_file of App.tsx in step {data.get('step_index')}")
                    with open('App_initial.txt', 'w') as out:
                        out.write(content)
                    break
        except Exception as e:
            pass
