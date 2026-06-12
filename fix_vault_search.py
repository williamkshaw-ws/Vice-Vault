import re

with open("src/App.tsx", "r") as f:
    text = f.read()

old_use_memo = """  const filteredCatalog = useMemo(() => {
    return catalog.filter((item) => {"""

new_use_memo = """  const searchedCatalog = useMemo(() => {
    if (!searchQuery) return catalog;
    const query = searchQuery.toLowerCase();
    return catalog.filter(item => 
      item.model.toLowerCase().includes(query) ||
      (item.name && item.name.toLowerCase().includes(query)) ||
      item.color.toLowerCase().includes(query) ||
      (item.variation && item.variation.toLowerCase().includes(query)) ||
      (item.notes && item.notes.toLowerCase().includes(query)) ||
      (item.year && item.year.toLowerCase().includes(query))
    );
  }, [catalog, searchQuery]);

  const filteredCatalog = useMemo(() => {
    return searchedCatalog.filter((item) => {"""

text = text.replace(old_use_memo, new_use_memo)

# remove search filtering from filteredCatalog
old_search_filter = """      const query = searchQuery.toLowerCase();
      const matchesSearch = 
        item.model.toLowerCase().includes(query) ||
        (item.name && item.name.toLowerCase().includes(query)) ||
        item.color.toLowerCase().includes(query) ||
        (item.variation && item.variation.toLowerCase().includes(query)) ||
        (item.notes && item.notes.toLowerCase().includes(query)) ||
        (item.year && item.year.toLowerCase().includes(query));

      const matchesBrand = selectedBrandFilter === "ALL" || item.model === selectedBrandFilter;"""

new_search_filter = """      const matchesBrand = selectedBrandFilter === "ALL" || item.model === selectedBrandFilter;"""

text = text.replace(old_search_filter, new_search_filter)

old_wishlist_only_if = """      // If showWishlistOnly is active, be agnostic to the filters and show full wishlist options
      if (showWishlistOnly) {
          return matchesSearch && matchesWishlist;
      }

      return matchesSearch && matchesBrand && matchesWishlist && matchesAdvancedModel && matchesAdvancedColor && matchesAdvancedVariation && matchesAdvancedYear && matchesAdvancedName;"""

new_wishlist_only_if = """      // If showWishlistOnly is active, be agnostic to the filters and show full wishlist options
      if (showWishlistOnly) {
          return matchesWishlist;
      }

      return matchesBrand && matchesWishlist && matchesAdvancedModel && matchesAdvancedColor && matchesAdvancedVariation && matchesAdvancedYear && matchesAdvancedName;"""

text = text.replace(old_wishlist_only_if, new_wishlist_only_if)


# add search input UI and change VaultFilterBar items to searchedCatalog
old_ui = """                    {/* Database Search Filter control */}
                    <div className="space-y-3">
                      
                      <div className="flex items-center gap-2 flex-wrap">
                        <VaultFilterBar items={catalog} filters={catalogFilters} showCondition={false} />
                      </div>

                    </div>"""

new_ui = """                    {/* Database Search Filter control */}
                    <div className="space-y-3">
                      <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                          <Search className="h-4 w-4 text-neutral-500 group-focus-within:text-[#2563eb] transition-colors" />
                        </div>
                        <input
                          type="text"
                          placeholder="Search entire vault (e.g., Red, Pro, 2021...)"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="w-full bg-neutral-900 border border-neutral-800 rounded-xl pl-10 pr-10 py-3.5 text-sm text-white placeholder-neutral-500 focus:outline-none focus:ring-1 focus:ring-[#2563eb] focus:border-[#2563eb] transition-all shadow-sm"
                        />
                        {searchQuery && (
                          <button 
                            onClick={() => setSearchQuery("")}
                            className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-neutral-500 hover:text-white transition-colors"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                          </button>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2 flex-wrap">
                        <VaultFilterBar items={searchedCatalog} filters={catalogFilters} showCondition={false} />
                      </div>

                    </div>"""

text = text.replace(old_ui, new_ui)

with open("src/App.tsx", "w") as f:
    f.write(text)

