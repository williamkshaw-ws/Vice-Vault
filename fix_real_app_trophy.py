import sys

path = '/Users/williamkshaw/antigravity/Vice-Vault/src/App.tsx'
with open(path, 'r') as f:
    content = f.read()

# Add toggle to Sort dropdown row
sort_target = """                  <div className="flex items-center gap-2 shrink-0">
                    {balls.length > 0 && (
                      <div className="relative">"""

sort_replacement = """                  <div className="flex items-center gap-2 shrink-0">
                    <div className="flex items-center bg-neutral-900 rounded-lg p-0.5 border border-neutral-800 mr-2">
                      <button
                        onClick={() => setLockerViewMode('grid')}
                        className={`p-1.5 rounded-md transition-colors ${lockerViewMode === 'grid' ? 'bg-[#2563eb] text-white' : 'text-neutral-500 hover:text-neutral-300'}`}
                        title="Grid View"
                      >
                        <LayoutGrid className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setLockerViewMode('rack')}
                        className={`p-1.5 rounded-md transition-colors ${lockerViewMode === 'rack' ? 'bg-[#2563eb] text-white' : 'text-neutral-500 hover:text-neutral-300'}`}
                        title="Trophy Rack View"
                      >
                        <Library className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {balls.length > 0 && (
                      <div className="relative">"""

content = content.replace(sort_target, sort_replacement)

# Add rendering for TrophyCase
render_target = """                    ) : (
                      <div className="grid grid-cols-1 gap-4" id="owned-list-container">
                        {balls"""

render_replacement = """                    ) : lockerViewMode === 'rack' ? (
                      <TrophyCase 
                        uniqueBalls={Array.from(new Set(balls.map(b => b.catalogId)))
                          .map(id => catalog.find(c => c.id === id))
                          .filter((item): item is CatalogItem => item !== undefined)
                          .sort((a, b) => a.name.localeCompare(b.name))} 
                      />
                    ) : (
                      <div className="grid grid-cols-1 gap-4" id="owned-list-container">
                        {balls"""

content = content.replace(render_target, render_replacement)

with open(path, 'w') as f:
    f.write(content)
print("Fixed real App.tsx!")
