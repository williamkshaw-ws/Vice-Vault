import sys

path = '/Users/williamkshaw/antigravity/Vice-Vault/src/App.tsx'
with open(path, 'r') as f:
    content = f.read()

target1 = """                  shareBag: profileData.shareBag,
                  shareToken: profileData.shareToken, pendingFriendRequestsCount: profileData.pendingFriendRequestsCount || 0
                };"""
replacement1 = """                  shareBag: profileData.shareBag,
                  shareToken: profileData.shareToken, pendingFriendRequestsCount: profileData.pendingFriendRequestsCount || 0,
                  wishlist: profileData.wishlist || []
                };"""

content = content.replace(target1, replacement1)

target2 = """                email: userDocData.email || user.email || "",
                shareBag: !!userDocData.shareBag,
                shareToken: userDocData.shareToken
              } as any);"""
replacement2 = """                email: userDocData.email || user.email || "",
                shareBag: !!userDocData.shareBag,
                shareToken: userDocData.shareToken,
                wishlist: userDocData.wishlist || []
              } as any);"""

content = content.replace(target2, replacement2)

target3 = """                email: user.email || "",
                shareBag: false
              } as any);"""
replacement3 = """                email: user.email || "",
                shareBag: false,
                wishlist: []
              } as any);"""

content = content.replace(target3, replacement3)

target4 = """        const parsed = JSON.parse(savedMockUser);
        setCurrentUser(parsed);
        setUserProfile({
          uid: parsed.uid || parsed.id || "",
          displayName: parsed.displayName || "User",
          username: parsed.username || "",
          avatarUrl: parsed.avatarUrl || "preset-1",
          preferredColor: parsed.preferredColor || "#2563eb",
          role: parsed.role || "User",
          shareBag: !!parsed.shareBag,
          shareToken: parsed.shareToken, pendingFriendRequestsCount: parsed.pendingFriendRequestsCount || 0
        });"""
replacement4 = """        const parsed = JSON.parse(savedMockUser);
        setCurrentUser(parsed);
        setUserProfile({
          uid: parsed.uid || parsed.id || "",
          displayName: parsed.displayName || "User",
          username: parsed.username || "",
          avatarUrl: parsed.avatarUrl || "preset-1",
          preferredColor: parsed.preferredColor || "#2563eb",
          role: parsed.role || "User",
          shareBag: !!parsed.shareBag,
          shareToken: parsed.shareToken, pendingFriendRequestsCount: parsed.pendingFriendRequestsCount || 0,
          wishlist: parsed.wishlist || []
        });"""

content = content.replace(target4, replacement4)


with open(path, 'w') as f:
    f.write(content)
print("Auth load sync fixed!")
