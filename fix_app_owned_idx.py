import re

with open("src/App.tsx", "r") as f:
    text = f.read()

text = text.replace(
    '.map(({ ball }) => (\n                      <OwnedBallCard',
    '.map(({ ball }, index) => (\n                      <OwnedBallCard\n                        index={index}'
)

with open("src/App.tsx", "w") as f:
    f.write(text)

