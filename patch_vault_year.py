import re

with open("src/components/AddMissingBallForm.tsx", "r") as f:
    text = f.read()

# Add year state
old_state = '  const [variation, setVariation] = useState("");'
new_state = """  const [variation, setVariation] = useState("");
  const [year, setYear] = useState("");

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - 2012 + 1 }, (_, i) => String(2012 + i));"""

text = text.replace(old_state, new_state)

# Add to useEffect (true branch)
old_eff_true = '      setVariation(editItem.variation || editItem.notes || "");'
new_eff_true = """      setVariation(editItem.variation || editItem.notes || "");
      setYear(editItem.year || "");"""
text = text.replace(old_eff_true, new_eff_true)

# Add to useEffect (false branch)
old_eff_false = '      setVariation("");'
new_eff_false = """      setVariation("");
      setYear("");"""
text = text.replace(old_eff_false, new_eff_false)

# Add to payload
old_payload = """      variation: variation.trim() ? variation.trim() : null,"""
new_payload = """      variation: variation.trim() ? variation.trim() : null,
      year: year.trim() ? year.trim() : undefined,"""
text = text.replace(old_payload, new_payload)

# Add to reset after success
old_reset = """        setVariation("");"""
new_reset = """        setVariation("");
        setYear("");"""
text = text.replace(old_reset, new_reset)

# Update grid layout
old_grid = '          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">'
new_grid = '          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">'
text = text.replace(old_grid, new_grid)

# Add Year select element after Variation input
old_variation_input = """               />
             </div>"""
new_variation_input = """               />
             </div>

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

text = text.replace(old_variation_input, new_variation_input, 1) # Only replace the first occurrence (which is the variation input, not the name input)

with open("src/components/AddMissingBallForm.tsx", "w") as f:
    f.write(text)

