import sys

path = '/Users/williamkshaw/antigravity/Vice-Vault/src/App.tsx'
with open(path, 'r') as f:
    content = f.read()

target = """                          <button
                            onClick={() => setShowClearWishlistPrompt(true)}"""

replacement = """                          <button
                            onClick={() => {
                              if (window.confirm("Are you sure you want to clear your wishlist?")) {
                                handleClearWishlist();
                              }
                            }}"""

if target in content:
    content = content.replace(target, replacement)
    with open(path, 'w') as f:
        f.write(content)
    print("Fixed!")
else:
    print("Target not found!")
