import json

path = '/Users/williamkshaw/.gemini/antigravity/brain/bb971b41-6ae7-462e-8b02-c314a7f604ec/.system_generated/logs/transcript.jsonl'

last_content = None

with open(path, 'r') as f:
    for line in f:
        try:
            data = json.loads(line)
            if data.get('source') == 'MODEL' and data.get('type') == 'PLANNER_RESPONSE':
                tool_calls = data.get('tool_calls', [])
                for tc in tool_calls:
                    if tc['name'] == 'replace_file_content' and 'App.tsx' in tc['args'].get('TargetFile', ''):
                        pass # replace_file_content doesn't have the full file
        except Exception as e:
            pass
