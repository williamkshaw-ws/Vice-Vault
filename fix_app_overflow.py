import sys

path = '/Users/williamkshaw/antigravity/Vice-Vault/src/App.tsx'
with open(path, 'r') as f:
    content = f.read()

target = """            {/* Database Panel Box */}
            <div className="bg-neutral-950/40 border border-neutral-850 rounded-2xl overflow-hidden shadow-md">
              
              {/* Registry Database Header Banner (Static, removing redundant Admin Tab) */}
              <div className="flex items-center gap-2.5 px-4 py-3.5 border-b border-neutral-850 bg-neutral-950">"""

replacement = """            {/* Database Panel Box */}
            <div className="bg-neutral-950/40 border border-neutral-850 rounded-2xl shadow-md">
              
              {/* Registry Database Header Banner (Static, removing redundant Admin Tab) */}
              <div className="flex items-center gap-2.5 px-4 py-3.5 border-b border-neutral-850 bg-neutral-950 rounded-t-2xl">"""

if target in content:
    content = content.replace(target, replacement)
    with open(path, 'w') as f:
        f.write(content)
    print("Fixed!")
else:
    print("Target not found!")
