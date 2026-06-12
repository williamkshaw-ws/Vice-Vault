import sys

trophy_path = '/Users/williamkshaw/antigravity/Vice-Vault/src/components/TrophyCase.tsx'
with open(trophy_path, 'r') as f:
    trophy_content = f.read()

# 1. Fix Visible UI Case
old_ui_case = """      {/* Rack Container (Visible UI) */}
      <div 
        ref={rackRef}
        className="w-full relative mx-auto p-4 sm:p-6 bg-[#1a1412] rounded-lg shadow-2xl" 
        style={{
          borderTop: '12px solid #5d4037',
          borderLeft: '12px solid #5d4037',
          borderRight: '12px solid #3e2723',
          borderBottom: '12px solid #3e2723',
          boxShadow: 'inset 0 0 60px rgba(0,0,0,0.9), 0 20px 25px -5px rgba(0, 0, 0, 0.4), 0 10px 10px -5px rgba(0, 0, 0, 0.2)'
        }}
      >
        <div id="noise-overlay" className="absolute inset-0 opacity-10 mix-blend-overlay pointer-events-none rounded-sm overflow-hidden" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`
        }}></div>

        <div className="relative z-10 grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-x-4 gap-y-10 p-4 justify-items-center">"""

new_ui_case = """      {/* Rack Container (Visible UI) */}
      <div 
        ref={rackRef}
        className="w-full relative mx-auto rounded-lg shadow-2xl overflow-hidden" 
        style={{
          backgroundImage: "url('/wood-bg.png')",
          backgroundSize: '400px',
          padding: '16px',
        }}
      >
        {/* Recessed Inner Board */}
        <div className="w-full h-full relative rounded shadow-inner" style={{
          backgroundImage: "url('/wood-bg.png')",
          backgroundSize: '400px',
          boxShadow: 'inset 0 0 80px rgba(0,0,0,0.95), inset 0 20px 25px -5px rgba(0, 0, 0, 0.8)'
        }}>
          {/* Multiply darkness to make the backboard deeper than the frame */}
          <div className="absolute inset-0 bg-black/60 mix-blend-multiply pointer-events-none rounded"></div>
          
          <div className="relative z-10 grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-x-4 gap-y-10 p-6 justify-items-center">"""
trophy_content = trophy_content.replace(old_ui_case, new_ui_case)


# 2. Fix Poster Export Case
old_poster_case = """      {/* HIDDEN OFF-SCREEN POSTER RENDER TARGET */}
      <div className="overflow-hidden h-0 w-0 absolute top-0 left-0 pointer-events-none opacity-0">
        <div 
          ref={posterRef} 
          className="bg-[#1a1412] relative flex flex-col items-center" 
          style={{ 
            width: '1350px', 
            padding: '50px 40px', 
            borderTop: '24px solid #5d4037',
            borderLeft: '24px solid #5d4037',
            borderRight: '24px solid #3e2723',
            borderBottom: '24px solid #3e2723',
          }}
        >
          <div className="absolute inset-0 opacity-10 mix-blend-overlay" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`
          }}></div>
          
          {/* Title */}"""

new_poster_case = """      {/* HIDDEN OFF-SCREEN POSTER RENDER TARGET */}
      <div className="overflow-hidden h-0 w-0 absolute top-0 left-0 pointer-events-none opacity-0">
        <div 
          ref={posterRef} 
          className="relative flex flex-col items-center" 
          style={{ 
            width: '1350px', 
            padding: '32px', 
            backgroundImage: "url('/wood-bg.png')",
            backgroundSize: '400px'
          }}
        >
          {/* Inner Recessed Board */}
          <div className="w-full h-full relative flex flex-col items-center shadow-inner" style={{
            padding: '50px 20px',
            backgroundImage: "url('/wood-bg.png')",
            backgroundSize: '400px',
            boxShadow: 'inset 0 0 120px rgba(0,0,0,0.95), inset 0 30px 40px -10px rgba(0, 0, 0, 0.8)'
          }}>
            <div className="absolute inset-0 bg-black/60 mix-blend-multiply pointer-events-none"></div>

          {/* Title */}"""

trophy_content = trophy_content.replace(old_poster_case, new_poster_case)

with open(trophy_path, 'w') as f:
    f.write(trophy_content)

print("Applied wood background to UI and Poster!")
