import re

with open("src/components/CatalogItemCard.tsx", "r") as f:
    text = f.read()

text = text.replace(
    'import { Plus, Check, ChevronDown, ChevronUp, Layers, HelpCircle, Package, MessageSquare, X, AlertTriangle, Heart } from "lucide-react";',
    'import { Plus, Check, ChevronDown, ChevronUp, Layers, HelpCircle, Package, MessageSquare, X, AlertTriangle, Heart } from "lucide-react";\nimport { motion, AnimatePresence } from "framer-motion";'
)

text = text.replace(
    'interface CatalogItemCardProps {\n  key?: string | number;\n  item: CatalogItem;',
    'interface CatalogItemCardProps {\n  key?: string | number;\n  index?: number;\n  item: CatalogItem;'
)

text = text.replace(
    'export default function CatalogItemCard({ item, subItems = [], onAddToLocker, isReadOnly = false, wishlistItems = [], onToggleWishlist, variant }: CatalogItemCardProps) {',
    'export default function CatalogItemCard({ item, subItems = [], onAddToLocker, isReadOnly = false, wishlistItems = [], onToggleWishlist, variant, index = 0 }: CatalogItemCardProps) {'
)

old_div = """  return (
    <div 
      className={`relative rounded-xl border p-4 transition-all duration-300 ${
        isOpen 
          ? "bg-neutral-900 border-[#2563eb]/50 shadow-md shadow-[#2563eb]/10" 
          : "bg-neutral-900/60 hover:bg-neutral-900 border-neutral-800 hover:border-neutral-700 hover:shadow-sm"
      } ${showWishlistPrompt ? "z-[60]" : ""}`}
      id={`catalog-item-card-${item.id}`}
    >"""

new_div = """  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.3, delay: index * 0.04, ease: [0.23, 1, 0.32, 1] }}
      className={`relative rounded-xl border p-4 transition-all duration-300 ${
        isOpen 
          ? "bg-neutral-900 border-[#2563eb]/50 shadow-md shadow-[#2563eb]/10" 
          : "bg-neutral-900/60 hover:bg-neutral-900 border-neutral-800 hover:border-neutral-700 hover:shadow-sm"
      } ${showWishlistPrompt ? "z-[60]" : ""}`}
      id={`catalog-item-card-${item.id}`}
    >"""
text = text.replace(old_div, new_div)

old_end = """        </form>
      )}
    </div>
  );
}"""
new_end = """        </form>
      )}
    </motion.div>
  );
}"""
text = text.replace(old_end, new_end)

with open("src/components/CatalogItemCard.tsx", "w") as f:
    f.write(text)

