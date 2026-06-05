import sys

path = '/Users/williamkshaw/antigravity/Vice-Vault/src/components/CatalogItemCard.tsx'
with open(path, 'r') as f:
    content = f.read()

target = """  const isBundle = item.bundleItems && item.bundleItems.length > 0;
  const bundleTotal = isBundle ? item.bundleItems!.reduce((acc, b) => acc + b.qty, 0) : 12;
  const [quantity, setQuantity] = useState(isBundle ? bundleTotal : 12); // Defaults to a standard Box or Bundle Total
  const [pkgType, setPkgType] = useState<'sleeve' | 'box' | 'ea'>('box');"""

replacement = """  const isBundle = item.bundleItems && item.bundleItems.length > 0;
  
  // If the item is wishlisted specifically as an individual item (no -pkg-box suffix), default to 'ea'
  const isWishlistedAsBox = wishlistItems.some(w => w === `${item.id}-pkg-box`);
  const isWishlistedAsEa = wishlistItems.some(w => w === item.id || w === `${item.id}-pkg-ea`);
  const initialPkgType = (!isBundle && isWishlistedAsEa && !isWishlistedAsBox) ? 'ea' : 'box';
  
  const bundleTotal = isBundle ? item.bundleItems!.reduce((acc, b) => acc + b.qty, 0) : 12;
  const [quantity, setQuantity] = useState(initialPkgType === 'ea' ? 1 : (isBundle ? bundleTotal : 12));
  const [pkgType, setPkgType] = useState<'sleeve' | 'box' | 'ea'>(initialPkgType);"""

if target in content:
    content = content.replace(target, replacement)
    with open(path, 'w') as f:
        f.write(content)
    print("Fixed!")
else:
    print("Target not found!")
