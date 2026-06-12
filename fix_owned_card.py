import re

with open("src/components/OwnedBallCard.tsx", "r") as f:
    text = f.read()

text = text.replace(
    'import { Trash2, Plus, Minus, Tag, Check } from "lucide-react";',
    'import { Trash2, Plus, Minus, Tag, Check } from "lucide-react";\nimport { motion, AnimatePresence } from "framer-motion";'
)

text = text.replace(
    'interface OwnedBallCardProps {\n  key?: string | number;\n  ball: OwnedBall;',
    'interface OwnedBallCardProps {\n  key?: string | number;\n  index?: number;\n  ball: OwnedBall;'
)

text = text.replace(
    'export default function OwnedBallCard({ ball, catalog, onUpdateBall, onDelete }: OwnedBallCardProps) {',
    'export default function OwnedBallCard({ ball, catalog, onUpdateBall, onDelete, index = 0 }: OwnedBallCardProps) {'
)

old_div = """  return (
    <div className={`relative bg-neutral-900 border ${
      ball.packageType === 'box' ? 'border-[#2563eb]/30 shadow-sm shadow-[#2563eb]/5' : 
      ball.packageType === 'sleeve' ? 'border-pink-500/30 shadow-sm shadow-pink-500/5' : 
      'border-neutral-800'
    } rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row gap-4 sm:gap-6 transition-colors hover:border-neutral-700`}>"""

new_div = """  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.3, delay: index * 0.04, ease: [0.23, 1, 0.32, 1] }}
      className={`relative bg-neutral-900 border ${
      ball.packageType === 'box' ? 'border-[#2563eb]/30 shadow-sm shadow-[#2563eb]/5' : 
      ball.packageType === 'sleeve' ? 'border-pink-500/30 shadow-sm shadow-pink-500/5' : 
      'border-neutral-800'
    } rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row gap-4 sm:gap-6 transition-colors hover:border-neutral-700`}>"""
text = text.replace(old_div, new_div)

old_end = """        </div>
      </div>
    </div>
  );
}"""
new_end = """        </div>
      </div>
    </motion.div>
  );
}"""
text = text.replace(old_end, new_end)

with open("src/components/OwnedBallCard.tsx", "w") as f:
    f.write(text)

