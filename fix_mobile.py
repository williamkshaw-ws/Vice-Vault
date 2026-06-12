import re

with open("src/App.tsx", "r") as f:
    text = f.read()

# 1. Header layout
old_header = """<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4.5 flex flex-col md:flex-row items-center justify-between gap-4">"""
new_header = """<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4.5 flex flex-row items-center justify-between gap-2 sm:gap-4">"""
text = text.replace(old_header, new_header)

old_logo_container = """<div className="flex items-center gap-3.5 text-center sm:text-left">"""
new_logo_container = """<div className="flex items-center gap-2 sm:gap-3.5 text-left">"""
text = text.replace(old_logo_container, new_logo_container)

old_logo_img = """<img src="/vault-logo.png" alt="Logo" className="w-11 h-11 object-contain drop-shadow-md scale-[2] translate-y-[4px]" />"""
new_logo_img = """<img src="/vault-logo.png" alt="Logo" className="w-9 h-9 sm:w-11 sm:h-11 object-contain drop-shadow-md scale-[2] translate-y-[2px] sm:translate-y-[4px]" />"""
text = text.replace(old_logo_img, new_logo_img)

old_h1_container = """<div className="flex items-center gap-2.5 justify-center sm:justify-start">
                <h1 className="text-xl font-sans font-black tracking-tight text-white m-0 transition-all">"""
new_h1_container = """<div className="flex items-center gap-1.5 sm:gap-2.5 justify-start">
                <h1 className="text-sm sm:text-xl font-sans font-black tracking-tight text-white m-0 transition-all">"""
text = text.replace(old_h1_container, new_h1_container)

old_pro = """<span className="px-2 py-0.5 rounded font-mono font-black text-[9px] uppercase tracking-wider transition-all duration-300 bg-[#2563eb] text-black font-black">
                  Pro-Edition
                </span>"""
new_pro = """<span className="px-1.5 sm:px-2 py-0.5 rounded font-mono font-black text-[8px] sm:text-[9px] uppercase tracking-wider transition-all duration-300 bg-[#2563eb] text-black font-black">
                  Pro
                </span>"""
text = text.replace(old_pro, new_pro)

old_desc = """<p className="text-[11px] text-neutral-400 tracking-tight mt-0.5 max-w-sm">
                Search, catalog, and oversee your custom golf ball collections with visual precision.
              </p>"""
new_desc = """<p className="text-[11px] text-neutral-400 tracking-tight mt-0.5 max-w-sm hidden sm:block">
                Search, catalog, and oversee your custom golf ball collections with visual precision.
              </p>"""
text = text.replace(old_desc, new_desc)

old_dropdown = """<div className="flex items-center gap-3 flex-wrap justify-center">"""
new_dropdown = """<div className="flex items-center gap-3 justify-end shrink-0">"""
text = text.replace(old_dropdown, new_dropdown)

old_name = """<span>{userProfile?.displayName || currentUser.displayName || "User"}</span>"""
new_name = """<span className="hidden sm:inline">{userProfile?.displayName || currentUser.displayName || "User"}</span>"""
text = text.replace(old_name, new_name)

old_admin = """<span className="px-1 py-0.2 rounded border border-[#2563eb]/30 text-[8px] uppercase tracking-wider font-extrabold text-[#2563eb] bg-[#2563eb]/10 leading-none">
                      Admin
                    </span>"""
new_admin = """<span className="hidden sm:inline-block px-1 py-0.2 rounded border border-[#2563eb]/30 text-[8px] uppercase tracking-wider font-extrabold text-[#2563eb] bg-[#2563eb]/10 leading-none">
                      Admin
                    </span>"""
text = text.replace(old_admin, new_admin)

# 2. My Bag / Wishlist nowrap
old_bag_h2 = """<h2 className="font-sans font-black text-base uppercase tracking-wider">
                        My Bag
                      </h2>"""
new_bag_h2 = """<h2 className="font-sans font-black text-sm sm:text-base uppercase tracking-wider whitespace-nowrap">
                        My Bag
                      </h2>"""
text = text.replace(old_bag_h2, new_bag_h2)

old_wish_h2 = """<h2 className="font-sans font-black text-base uppercase tracking-wider flex items-center gap-2">
                          <Heart className={`w-5 h-5 ${bagTab === "wishlist" ? "text-rose-500 fill-rose-500" : ""}`} /> Wishlist
                        </h2>"""
new_wish_h2 = """<h2 className="font-sans font-black text-sm sm:text-base uppercase tracking-wider flex items-center gap-2 whitespace-nowrap">
                          <Heart className={`w-4 h-4 sm:w-5 sm:h-5 ${bagTab === "wishlist" ? "text-rose-500 fill-rose-500" : ""}`} /> Wishlist
                        </h2>"""
text = text.replace(old_wish_h2, new_wish_h2)

with open("src/App.tsx", "w") as f:
    f.write(text)

