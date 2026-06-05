import sys

path = '/Users/williamkshaw/antigravity/Vice-Vault/src/components/OwnedBallCard.tsx'
with open(path, 'r') as f:
    content = f.read()

target = """            <select
              value={editYear}
              onChange={(e) => setEditYear(e.target.value)}
              className="w-full bg-neutral-950 text-xs py-1.5 px-2 rounded text-neutral-300 font-bold border border-neutral-850 focus:border-neutral-750 outline-none cursor-pointer"
            >
              {Array.from({ length: new Date().getFullYear() - 2012 + 1 }, (_, i) => String(2012 + i)).map((y) => ("""

replacement = """            <select
              value={editYear}
              onChange={(e) => setEditYear(e.target.value)}
              className="w-full bg-neutral-950 text-xs py-1.5 px-2 rounded text-neutral-300 font-bold border border-neutral-850 focus:border-neutral-750 outline-none cursor-pointer"
            >
              <option value="">Unknown</option>
              {Array.from({ length: new Date().getFullYear() - 2012 + 1 }, (_, i) => String(2012 + i)).map((y) => ("""

if target in content:
    content = content.replace(target, replacement)
    with open(path, 'w') as f:
        f.write(content)
    print("Fixed!")
else:
    print("Target not found!")
