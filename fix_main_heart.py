import sys

path = '/Users/williamkshaw/antigravity/Vice-Vault/src/components/CatalogItemCard.tsx'
with open(path, 'r') as f:
    content = f.read()

target1 = """                    className={`flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-lg transition-colors cursor-pointer ${
                      wishlistItems.some(w => w === item.id || w.startsWith(`${item.id}-pkg-`))
                        ? 'bg-rose-500/20 text-rose-500 hover:bg-rose-500/30' 
                        : 'bg-neutral-800 text-neutral-400 hover:bg-neutral-700 hover:text-white'
                    }"""

replacement1 = """                    className={`flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-lg transition-colors cursor-pointer ${
                      wishlistItems.some(w => w === item.id || w.startsWith(`${item.id}-pkg-`) || (subItems && subItems.some(sub => w === sub.id)))
                        ? 'bg-rose-500/20 text-rose-500 hover:bg-rose-500/30' 
                        : 'bg-neutral-800 text-neutral-400 hover:bg-neutral-700 hover:text-white'
                    }"""

content = content.replace(target1, replacement1)

target2 = """                    <Heart className={`w-4 h-4 ${wishlistItems.some(w => w === item.id || w.startsWith(`${item.id}-pkg-`)) ? 'fill-current' : ''}`} />"""
replacement2 = """                    <Heart className={`w-4 h-4 ${wishlistItems.some(w => w === item.id || w.startsWith(`${item.id}-pkg-`) || (subItems && subItems.some(sub => w === sub.id))) ? 'fill-current' : ''}`} />"""

content = content.replace(target2, replacement2)

with open(path, 'w') as f:
    f.write(content)
print("Fixed!")
