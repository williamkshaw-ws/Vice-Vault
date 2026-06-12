import re

with open("src/App.tsx", "r") as f:
    text = f.read()

text = text.replace(
    '.map(item => {\n                          if (!item) return null;\n                          return (\n                          <CatalogItemCard\n                            key={item.id}\n                            item={item}',
    '.map((item, index) => {\n                          if (!item) return null;\n                          return (\n                          <CatalogItemCard\n                            index={index}\n                            key={item.id}\n                            item={item}'
)

text = text.replace(
    '.map((ball) => {\n                    const currentPkg = ball.packageType || "ea";',
    '.map((ball, index) => {\n                    const currentPkg = ball.packageType || "ea";'
)

text = text.replace(
    '<OwnedBallCard \n                        key={ball.id} \n                        ball={ball} \n                        catalog={catalog} \n                        readOnly={true} \n                      />',
    '<OwnedBallCard \n                        index={index}\n                        key={ball.id} \n                        ball={ball} \n                        catalog={catalog} \n                        readOnly={true} \n                      />'
)

with open("src/App.tsx", "w") as f:
    f.write(text)

