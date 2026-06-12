import re

with open("src/App.tsx", "r") as f:
    text = f.read()

# Replace .map(item => { with .map((item, index) => {
text = text.replace(
    '.map(item => {',
    '.map((item, index) => {'
)

# Wait, there are multiple map calls.
# Let's replace specifically:
text = text.replace(
    '<CatalogItemCard\n                              key={item.id}\n                              item={item}',
    '<CatalogItemCard\n                              index={index}\n                              key={item.id}\n                              item={item}'
)

text = text.replace(
    '{groupedCatalog.map((group) => (\n                          <CatalogItemCard \n                            key={group.primary.id} \n                            item={group.primary}',
    '{groupedCatalog.map((group, index) => (\n                          <CatalogItemCard \n                            index={index}\n                            key={group.primary.id} \n                            item={group.primary}'
)

with open("src/App.tsx", "w") as f:
    f.write(text)

