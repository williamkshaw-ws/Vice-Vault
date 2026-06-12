import re

with open("src/App.tsx", "r") as f:
    text = f.read()

# Fix logo
old_logo = """<img src="/vault-logo.png" alt="Logo" className="w-9 h-9 sm:w-11 sm:h-11 object-contain drop-shadow-md" />"""
new_logo = """<img src="/vault-logo.png" alt="Logo" className="h-9 sm:h-11 w-auto object-contain drop-shadow-md" />"""
text = text.replace(old_logo, new_logo)

# Fix text images
old_text = """              <img src="/vault-name-desktop.png" alt="Golfball Vault" className="hidden sm:block h-10 object-contain scale-[2.5] origin-left translate-x-2" />
              <img src="/vault-name-mobile.png" alt="Golfball Vault" className="block sm:hidden h-8 object-contain scale-[2.2] origin-left translate-x-1" />"""
new_text = """              <img src="/vault-name-desktop.png" alt="Golfball Vault" className="hidden sm:block h-9 sm:h-11 w-auto object-contain" />
              <img src="/vault-name-mobile.png" alt="Golfball Vault" className="block sm:hidden h-9 sm:h-11 w-auto object-contain" />"""
text = text.replace(old_text, new_text)

with open("src/App.tsx", "w") as f:
    f.write(text)

