import sys

path = '/Users/williamkshaw/antigravity/Vice-Vault/src/App.tsx'
with open(path, 'r') as f:
    content = f.read()

target = """  const handleToggleWishlist = async (catalogId: string) => {
    if (!currentUser || !userProfile) return;
    
    // Optimistic update
    const prevWishlist = userProfile.wishlist || [];
    const isWishlisted = prevWishlist.includes(catalogId);
    const newWishlist = isWishlisted 
      ? prevWishlist.filter(id => id !== catalogId)
      : [...prevWishlist, catalogId];
      
    setUserProfile({ ...userProfile, wishlist: newWishlist });
    
    try {
      const res = await fetch(`/api/users/${currentUser.uid}/wishlist`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": currentUser.uid
        },
        body: JSON.stringify({ catalogId })
      });
      if (!res.ok) throw new Error("Failed to update wishlist");
    } catch (e) {
      console.error(e);
      // Revert optimistic update
      setUserProfile({ ...userProfile, wishlist: prevWishlist });
    }
  };"""

replacement = """  const handleToggleWishlist = async (catalogId: string) => {
    if (!currentUser || !userProfile) return;
    
    // Optimistic update
    const prevWishlist = userProfile.wishlist || [];
    const isWishlisted = prevWishlist.includes(catalogId);
    const newWishlist = isWishlisted 
      ? prevWishlist.filter(id => id !== catalogId)
      : [...prevWishlist, catalogId];
      
    setUserProfile({ ...userProfile, wishlist: newWishlist });
    
    try {
      const res = await fetch(`/api/users/${currentUser.uid}/wishlist`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": currentUser.uid
        },
        body: JSON.stringify({ catalogId })
      });
      if (!res.ok) throw new Error("Failed to update wishlist");
    } catch (e) {
      console.error(e);
      // Revert optimistic update
      setUserProfile({ ...userProfile, wishlist: prevWishlist });
    }
  };

  const handleClearWishlist = async () => {
    if (!currentUser || !userProfile) return;
    
    const prevWishlist = userProfile.wishlist || [];
    setUserProfile({ ...userProfile, wishlist: [] });
    
    try {
      const res = await fetch(`/api/users/${currentUser.uid}/wishlist/clear`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": currentUser.uid
        }
      });
      if (!res.ok) throw new Error("Failed to clear wishlist");
    } catch (e) {
      console.error(e);
      setUserProfile({ ...userProfile, wishlist: prevWishlist });
    }
  };"""

if target in content:
    content = content.replace(target, replacement)
    with open(path, 'w') as f:
        f.write(content)
    print("Fixed!")
else:
    print("Target not found!")
