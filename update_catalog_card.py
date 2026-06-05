import sys

path = '/Users/williamkshaw/antigravity/Vice-Vault/src/components/CatalogItemCard.tsx'
with open(path, 'r') as f:
    content = f.read()

# Add createPortal to imports
import_target = """import { Check, Edit2, Archive, Globe, Lock, MoreHorizontal, ShoppingBag, Heart, CheckCircle2 } from "lucide-react";"""
import_replacement = """import { Check, Edit2, Archive, Globe, Lock, MoreHorizontal, ShoppingBag, Heart, CheckCircle2 } from "lucide-react";
import { createPortal } from "react-dom";"""
content = content.replace(import_target, import_replacement)

# Add state and ref
state_target = """  const [showWishlistPrompt, setShowWishlistPrompt] = useState(false);
  const [activeItem, setActiveItem] = useState(item);"""
state_replacement = """  const [showWishlistPrompt, setShowWishlistPrompt] = useState(false);
  const wishlistBtnRef = useRef<HTMLButtonElement>(null);
  const [wishlistCoords, setWishlistCoords] = useState({ top: 0, left: 0, width: 224, openUpwards: false });
  const [activeItem, setActiveItem] = useState(item);"""
content = content.replace(state_target, state_replacement)

# Add useEffect for coordinates
effect_target = """  useEffect(() => {
    setActiveItem(item);
  }, [item]);"""
effect_replacement = """  useEffect(() => {
    setActiveItem(item);
  }, [item]);

  useEffect(() => {
    if (showWishlistPrompt && wishlistBtnRef.current) {
      const rect = wishlistBtnRef.current.getBoundingClientRect();
      const popupHeight = 200; // max-h-48 + header is around 200px
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;
      
      const openUpwards = spaceBelow < popupHeight && spaceAbove > spaceBelow;
      
      setWishlistCoords({
        top: openUpwards ? rect.top + window.scrollY : rect.bottom + window.scrollY,
        left: rect.right + window.scrollX - 224, // 224px is w-56, align right edges
        width: 224,
        openUpwards
      });
    }
  }, [showWishlistPrompt]);"""
content = content.replace(effect_target, effect_replacement)

# Update button ref
btn_target = """                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (isWishlisted) {"""
btn_replacement = """                  <button
                    ref={wishlistBtnRef}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (isWishlisted) {"""
content = content.replace(btn_target, btn_replacement)

# Update portal rendering
render_target = """                  {showWishlistPrompt && (
                    <>
                      <div className="fixed inset-0 z-0" onClick={() => setShowWishlistPrompt(false)} />
                      <div className="absolute right-0 top-full mt-2 w-56 bg-neutral-900 border border-neutral-800 rounded-xl shadow-xl z-10 overflow-hidden animate-fade-in flex flex-col">
                        {subItems.length > 1 ? ("""
render_replacement = """                  {showWishlistPrompt && createPortal(
                    <div className="fixed inset-0 z-40" style={{ pointerEvents: 'auto' }} onClick={() => setShowWishlistPrompt(false)}>
                      <div 
                        className={`absolute w-56 bg-neutral-900 border border-neutral-800 rounded-xl shadow-xl z-50 overflow-hidden animate-in fade-in duration-150 flex flex-col ${wishlistCoords.openUpwards ? 'slide-in-from-bottom-2' : 'mt-2 slide-in-from-top-2'}`}
                        style={{
                          top: wishlistCoords.top,
                          left: wishlistCoords.left,
                          transform: wishlistCoords.openUpwards ? "translateY(calc(-100% - 8px))" : "none"
                        }}
                        onClick={e => e.stopPropagation()}
                      >
                        {subItems.length > 1 ? ("""
content = content.replace(render_target, render_replacement)

# Close the portal properly
close_target = """                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </>
                  )}"""
close_replacement = """                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>,
                    document.body
                  )}"""
content = content.replace(close_target, close_replacement)

with open(path, 'w') as f:
    f.write(content)

print("Finished catalog item card portal update!")
