import re

with open("src/App.tsx", "r") as f:
    text = f.read()

old_title_block = """              <div className="flex items-center gap-1.5 sm:gap-2.5 justify-start">
                <h1 className="text-sm sm:text-xl font-sans font-black tracking-tight text-white m-0 transition-all">
                  GOLF BALL VAULT
                </h1>
                <span className="px-1.5 sm:px-2 py-0.5 rounded font-mono font-black text-[8px] sm:text-[9px] uppercase tracking-wider transition-all duration-300 bg-[#2563eb] text-black font-black">
                  Pro
                </span>
              </div>"""

new_title_block = """              <div className="flex flex-col justify-center items-start mt-0.5">
                <h1 className="text-sm sm:text-xl font-sans font-black tracking-tight text-white m-0 leading-none">
                  GOLFBALL
                </h1>
                <span className="text-[12px] sm:text-[17.5px] font-sans font-black tracking-[0.37em] sm:tracking-[0.38em] text-white m-0 leading-none mt-[2px] sm:mt-[3px]">
                  VAULT
                </span>
              </div>"""

text = text.replace(old_title_block, new_title_block)

with open("src/App.tsx", "w") as f:
    f.write(text)

