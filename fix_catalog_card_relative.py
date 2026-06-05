import sys

path = '/Users/williamkshaw/antigravity/Vice-Vault/src/components/CatalogItemCard.tsx'
with open(path, 'r') as f:
    content = f.read()

target = """                !isOpen ? (
                  <div className="flex items-center gap-2 flex-shrink-0">"""

replacement = """                !isOpen ? (
                  <div className="relative flex items-center gap-2 flex-shrink-0">"""

if target in content:
    content = content.replace(target, replacement)
    with open(path, 'w') as f:
        f.write(content)
    print("Fixed!")
else:
    print("Target not found!")
