import sys

path = '/Users/williamkshaw/antigravity/Vice-Vault/src/App.tsx'
with open(path, 'r') as f:
    content = f.read()

target = """              setUserProfile({
                uid: data.uid || data.id,
                displayName: data.displayName || "User",
                username: data.username || "",
                avatarUrl: data.photoURL || "initials",
                preferredColor: data.preferredColor || "#2563eb",
                role: (data.role && data.role.toLowerCase() === "admin") ? "Admin" : "User",
                shareBag: !!data.shareBag,
                shareToken: data.shareToken, pendingFriendRequestsCount: data.pendingFriendRequestsCount || 0
              });"""

replacement = """              setUserProfile({
                uid: data.uid || data.id,
                displayName: data.displayName || "User",
                username: data.username || "",
                avatarUrl: data.photoURL || "initials",
                preferredColor: data.preferredColor || "#2563eb",
                role: (data.role && data.role.toLowerCase() === "admin") ? "Admin" : "User",
                shareBag: !!data.shareBag,
                shareToken: data.shareToken, 
                pendingFriendRequestsCount: data.pendingFriendRequestsCount || 0,
                wishlist: data.wishlist || []
              });"""

if target in content:
    with open(path, 'w') as f:
        f.write(content.replace(target, replacement))
    print("Fixed user profile load!")
else:
    print("Could not find user profile load target.")
