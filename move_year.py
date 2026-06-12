import re

with open("src/components/AddMissingBallForm.tsx", "r") as f:
    text = f.read()

year_block = """
             {/* Year */}
             <div>
               <label className="block text-[10px] uppercase font-mono tracking-wider text-neutral-400 mb-1.5 font-bold whitespace-nowrap">
                 Year
               </label>
               <select
                 value={year}
                 onChange={(e) => setYear(e.target.value)}
                 className="w-full bg-neutral-950 hover:bg-neutral-900 border border-neutral-800 focus:border-[#2563eb]/50 rounded-lg py-2 px-3 text-xs text-white placeholder-neutral-600 outline-none transition-all cursor-pointer"
               >
                 <option value="">Unknown</option>
                 {years.map(y => (
                   <option key={y} value={y}>{y}</option>
                 ))}
               </select>
             </div>"""

# Remove year_block from text
text = text.replace(year_block, "")

# Insert year_block after Group By Var block
group_by_var_block = """             {/* Group By Variation Checkbox */}
             <div className="flex items-center gap-2 select-none cursor-pointer pb-2.5 px-1" onClick={() => {
               setGroupVariation(!groupVariation);
               setGroupColor(false);
             }}>
               <input
                 type="checkbox"
                 checked={groupVariation}
                 onChange={() => {}} // handled by parent div onClick
                 className="w-3.5 h-3.5 rounded text-[#2563eb] bg-neutral-900 border-neutral-850 focus:ring-0 focus:ring-offset-0 cursor-pointer"
               />
               <span className="text-[9px] uppercase font-mono tracking-wider text-neutral-300 font-bold whitespace-nowrap">
                 Group By Var.
               </span>
             </div>"""

text = text.replace(group_by_var_block, group_by_var_block + year_block)

with open("src/components/AddMissingBallForm.tsx", "w") as f:
    f.write(text)

