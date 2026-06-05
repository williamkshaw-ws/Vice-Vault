import sys

path = '/Users/williamkshaw/antigravity/Vice-Vault/src/components/VaultFilterBar.tsx'
with open(path, 'r') as f:
    content = f.read()

target = """        {children && (
          <div className="shrink-0 pl-2 pr-2 flex items-center">
            {children}
          </div>
        )}"""

replacement = """        {children && (
          <div className="shrink-0 pl-2 pr-2 flex items-center ml-auto">
            {children}
          </div>
        )}"""

if target in content:
    content = content.replace(target, replacement)
    with open(path, 'w') as f:
        f.write(content)
    print("Fixed!")
else:
    print("Target not found!")
