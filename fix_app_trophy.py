import sys

path = '/Users/williamkshaw/antigravity/Vice-Vault/src/App.tsx'
with open(path, 'r') as f:
    content = f.read()

# Add import
import_target = """import OwnedBallCard from "./components/OwnedBallCard";"""
import_replacement = """import OwnedBallCard from "./components/OwnedBallCard";
import TrophyCase from "./components/TrophyCase";"""

content = content.replace(import_target, import_replacement)

# Add icons
icon_target = """import { Search, Heart, Share2, ArrowRight, X, Settings, SlidersHorizontal, User, LogOut, Loader2, Database, Upload, BarChart, ArrowUpRight, Copy, Link, LogIn } from "lucide-react";"""
icon_replacement = """import { Search, Heart, Share2, ArrowRight, X, Settings, SlidersHorizontal, User, LogOut, Loader2, Database, Upload, BarChart, ArrowUpRight, Copy, Link, LogIn, LayoutGrid, Library } from "lucide-react";"""

if icon_target in content:
    content = content.replace(icon_target, icon_replacement)
else:
    # Try another generic icon replacement
    content = content.replace("import { Trash2,", "import { LayoutGrid, Library, Trash2,")

# Add state
state_target = """  const [selectedLockerTab, setSelectedLockerTab] = useState<"database" | "admin">("database");"""
state_replacement = """  const [selectedLockerTab, setSelectedLockerTab] = useState<"database" | "admin">("database");
  const [lockerViewMode, setLockerViewMode] = useState<'grid' | 'rack'>('grid');"""

content = content.replace(state_target, state_replacement)

# Add unique balls calculation and view mode toggle in locker tab
locker_header_target = """                      {/* Owned Items Display */}
                      <div className="flex items-center justify-between border-b border-neutral-850 pb-2">
                        <span className="text-[10px] font-mono text-neutral-500 uppercase">
                          {userProfile?.bag?.length || 0} Owned
                        </span>
                      </div>"""
                      
locker_header_replacement = """                      {/* Owned Items Display */}
                      <div className="flex items-center justify-between border-b border-neutral-850 pb-2">
                        <span className="text-[10px] font-mono text-neutral-500 uppercase">
                          {userProfile?.bag?.length || 0} Owned
                        </span>
                        
                        <div className="flex items-center bg-neutral-900 rounded-lg p-0.5 border border-neutral-800">
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
                      </div>"""

content = content.replace(locker_header_target, locker_header_replacement)

# Render Trophy case
render_target = """                      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                        {userProfile?.bag?.map((bagItem, idx) => {
                          const catalogItem = catalog.find(c => c.id === bagItem.catalogId);
                          if (!catalogItem) return null;
                          return (
                            <OwnedBallCard 
                              key={`${bagItem.catalogId}-${idx}`}
                              item={catalogItem} 
                              bagItem={bagItem}
                              onUpdate={(updates) => handleUpdateBagItem(idx, updates)}
                              onRemove={() => handleRemoveFromBag(idx)}
                              onDuplicate={() => handleDuplicateBagItem(idx)}
                            />
                          );
                        })}
                      </div>"""
                      
render_replacement = """                      {lockerViewMode === 'rack' ? (
                        <TrophyCase 
                          uniqueBalls={Array.from(new Set(userProfile?.bag?.map(b => b.catalogId) || []))
                            .map(id => catalog.find(c => c.id === id))
                            .filter((item): item is CatalogItem => item !== undefined)
                            .sort((a, b) => a.name.localeCompare(b.name))} 
                        />
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                          {userProfile?.bag?.map((bagItem, idx) => {
                            const catalogItem = catalog.find(c => c.id === bagItem.catalogId);
                            if (!catalogItem) return null;
                            return (
                              <OwnedBallCard 
                                key={`${bagItem.catalogId}-${idx}`}
                                item={catalogItem} 
                                bagItem={bagItem}
                                onUpdate={(updates) => handleUpdateBagItem(idx, updates)}
                                onRemove={() => handleRemoveFromBag(idx)}
                                onDuplicate={() => handleDuplicateBagItem(idx)}
                              />
                            );
                          })}
                        </div>
                      )}"""

content = content.replace(render_target, render_replacement)

with open(path, 'w') as f:
    f.write(content)
print("Fixed App.tsx!")
