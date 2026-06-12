import sys

path = '/Users/williamkshaw/antigravity/Vice-Vault/src/components/TrophyCase.tsx'
with open(path, 'r') as f:
    content = f.read()

# Remove the logo insertion logic
logo_target = """  const gridItems = useMemo(() => {
    const items: (CatalogItem | { isLogo: true })[] = [...uniqueBalls];
    
    // Determine a good spot for the logo (roughly middle, but ensuring it starts on a new row or looks balanced is hard with auto-fill)
    // We'll just place it exactly in the middle of the array.
    const middleIndex = Math.floor(items.length / 2);
    
    // Insert the logo object
    items.splice(middleIndex, 0, { isLogo: true });
    
    return items;
  }, [uniqueBalls]);"""

logo_replacement = """  const gridItems = uniqueBalls;"""

content = content.replace(logo_target, logo_replacement)

# Remove the logo rendering
render_logo_target = """          if ('isLogo' in item) {
            return (
              <div key="center-logo" className="col-span-4 sm:col-span-6 md:col-span-8 lg:col-span-10 flex items-center justify-center py-8">
                <div className="relative bg-white/90 backdrop-blur-sm px-8 py-4 rounded-3xl border border-white/20 shadow-2xl rotate-[-2deg] hover:rotate-0 transition-transform duration-500">
                  <h2 className="text-4xl sm:text-5xl md:text-6xl font-black text-[#1a5d3a] tracking-tighter" style={{ fontFamily: 'Impact, sans-serif' }}>
                    vice
                  </h2>
                  <span className="absolute bottom-2 right-6 text-[#1a5d3a] text-[10px] font-bold tracking-widest uppercase">GOLF</span>
                </div>
              </div>
            );
          }"""

content = content.replace(render_logo_target, "")

with open(path, 'w') as f:
    f.write(content)
print("Fixed TrophyCase.tsx")
