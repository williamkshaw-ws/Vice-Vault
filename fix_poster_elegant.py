import sys

trophy_path = '/Users/williamkshaw/antigravity/Vice-Vault/src/components/TrophyCase.tsx'
with open(trophy_path, 'r') as f:
    trophy_content = f.read()

# 1. Update Title Design
old_title = """          <h1 className="text-6xl text-white tracking-tighter mb-16 relative z-10 text-center uppercase flex items-center justify-center gap-3 w-full" style={{ fontFamily: 'Impact, sans-serif', textShadow: '0 4px 10px rgba(0,0,0,0.5)' }}>
            <span className="text-[#2563eb] text-7xl">{username}'S</span>
            <span className="text-7xl">BALL COLLECTION</span>
          </h1>"""
new_title = """          <div className="mb-20 mt-4 relative z-10 text-center w-full">
            <h1 className="text-5xl uppercase tracking-[0.2em] font-serif text-[#e6d5b8]" style={{ textShadow: '0 4px 12px rgba(0,0,0,0.6)' }}>
              {username}'S BALL COLLECTION
            </h1>
            <div className="w-32 h-[1px] bg-[#e6d5b8]/40 mx-auto mt-6"></div>
          </div>"""
trophy_content = trophy_content.replace(old_title, new_title)

# 2. Fix Black Text on Names (html-to-image Safari bug requires direct inline hex color)
old_name_text = """                <div className="text-white text-center mt-2">
                  <span className="block text-[14px] font-black uppercase tracking-widest">{item.name || item.model}</span>
                  <span className="block text-amber-500/80 text-[11px] font-bold uppercase tracking-widest mt-1">{item.color}</span>
                </div>"""
new_name_text = """                <div className="text-center mt-3">
                  <span className="block text-[13px] font-bold uppercase tracking-[0.1em]" style={{ color: '#e5e5e5' }}>{item.name || item.model}</span>
                  <span className="block text-[10px] font-bold uppercase tracking-widest mt-1.5" style={{ color: '#b48a47' }}>{item.color}</span>
                </div>"""
trophy_content = trophy_content.replace(old_name_text, new_name_text)

with open(trophy_path, 'w') as f:
    f.write(trophy_content)

print("Fixed Poster Typography and Colors!")
