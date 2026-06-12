import re

with open("src/App.tsx", "r") as f:
    text = f.read()

# 1. Remove the misplaced useEffect
misplaced_state = """const [showTrophyCase, setShowTrophyCase] = useState(false);

  useEffect(() => {
    if (bagTab === "wishlist") {
      setShowTrophyCase(false);
    }
  }, [bagTab]);"""
correct_state = 'const [showTrophyCase, setShowTrophyCase] = useState(false);'
text = text.replace(misplaced_state, correct_state)

# 2. Add it after bagTab
old_bag_tab = '  const [bagTab, setBagTab] = useState<"owned" | "wishlist">("owned");'
new_bag_tab = """  const [bagTab, setBagTab] = useState<"owned" | "wishlist">("owned");

  useEffect(() => {
    if (bagTab === "wishlist") {
      setShowTrophyCase(false);
    }
  }, [bagTab]);"""
text = text.replace(old_bag_tab, new_bag_tab)

with open("src/App.tsx", "w") as f:
    f.write(text)

