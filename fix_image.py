import re

with open("src/components/BallVisual.tsx", "r") as f:
    text = f.read()

old_img = """        <img 
          src={base64CustomImage} 
          alt="Custom ball design" 
          className="absolute inset-0 w-full h-full object-cover"
          referrerPolicy="no-referrer" crossOrigin="anonymous"
        />"""

new_img = """        <img 
          src={base64CustomImage} 
          alt="Custom ball design" 
          className="absolute inset-0 w-full h-full object-cover scale-[1.25]"
          referrerPolicy="no-referrer" crossOrigin="anonymous"
        />"""

text = text.replace(old_img, new_img)

with open("src/components/BallVisual.tsx", "w") as f:
    f.write(text)

