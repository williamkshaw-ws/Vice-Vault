import sys

path = '/Users/williamkshaw/antigravity/Vice-Vault/src/App.tsx'
with open(path, 'r') as f:
    content = f.read()

target1 = """  const bagFilters = useMemo(() => ({
    model: { value: bFilterModel, onChange: setBFilterModel },
    color: { value: bFilterColor, onChange: setBFilterColor },
    variation: { value: bFilterVariation, onChange: setBFilterVariation },
    year: { value: bFilterYear, onChange: setBFilterYear },
    name: { value: bFilterName, onChange: setBFilterName },
    condition: { value: bFilterCondition, onChange: setBFilterCondition },
  }), [bFilterModel, bFilterColor, bFilterVariation, bFilterYear, bFilterName, bFilterCondition]);"""

replacement1 = """  const bagFilters = useMemo(() => ({
    model: { value: bFilterModel, onChange: setBFilterModel },
    color: { value: bFilterColor, onChange: setBFilterColor },
    variation: { value: bFilterVariation, onChange: setBFilterVariation },
    year: { value: bFilterYear, onChange: setBFilterYear },
    name: { value: bFilterName, onChange: setBFilterName },
    condition: { value: bFilterCondition, onChange: setBFilterCondition },
  }), [bFilterModel, bFilterColor, bFilterVariation, bFilterYear, bFilterName, bFilterCondition]);

  const [sFilterModel, setSFilterModel] = useState<string>("");
  const [sFilterColor, setSFilterColor] = useState<string>("");
  const [sFilterVariation, setSFilterVariation] = useState<string>("");
  const [sFilterYear, setSFilterYear] = useState<string>("");
  const [sFilterName, setSFilterName] = useState<string>("");
  const [sFilterCondition, setSFilterCondition] = useState<string>("");

  const sharedFilters = useMemo(() => ({
    model: { value: sFilterModel, onChange: setSFilterModel },
    color: { value: sFilterColor, onChange: setSFilterColor },
    variation: { value: sFilterVariation, onChange: setSFilterVariation },
    year: { value: sFilterYear, onChange: setSFilterYear },
    name: { value: sFilterName, onChange: setSFilterName },
    condition: { value: sFilterCondition, onChange: setSFilterCondition },
  }), [sFilterModel, sFilterColor, sFilterVariation, sFilterYear, sFilterName, sFilterCondition]);"""

content = content.replace(target1, replacement1)


target2 = """            {/* Bag Inventory */}
            <div className="space-y-4">
              <h3 className="font-sans font-black text-white text-sm uppercase tracking-wider flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-neutral-400" />
                Bag Inventory ({sharedLockerBalls.length} Items)
              </h3>

              {sharedLockerBalls.length === 0 ? (
                <div className="py-20 text-center rounded-3xl border border-neutral-850 bg-neutral-950/20 text-neutral-500 font-mono text-xs">
                  This user's bag is empty.
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {sharedLockerBalls.map((ball) => {"""

replacement2 = """            {/* Bag Inventory */}
            <div className="space-y-4">
              <h3 className="font-sans font-black text-white text-sm uppercase tracking-wider flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-neutral-400" />
                Bag Inventory ({sharedLockerBalls.length} Items)
              </h3>

              {sharedLockerBalls.length > 0 && (
                <VaultFilterBar items={sharedLockerBalls} filters={sharedFilters} showCondition={true} />
              )}

              {sharedLockerBalls.length === 0 ? (
                <div className="py-20 text-center rounded-3xl border border-neutral-850 bg-neutral-950/20 text-neutral-500 font-mono text-xs">
                  This user's bag is empty.
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {sharedLockerBalls
                    .filter((ball) => {
                      const matchesAdvancedModel = !sFilterModel || ball.model === sFilterModel;
                      const matchesAdvancedColor = !sFilterColor || ball.color === sFilterColor;
                      const matchesAdvancedVariation = !sFilterVariation || ball.variation === sFilterVariation;
                      const matchesAdvancedYear = !sFilterYear || ball.year === sFilterYear;
                      const matchesAdvancedName = !sFilterName || ball.name === sFilterName;
                      const matchesAdvancedCondition = !sFilterCondition || ball.condition === sFilterCondition;
                      return matchesAdvancedModel && matchesAdvancedColor && matchesAdvancedVariation && matchesAdvancedYear && matchesAdvancedName && matchesAdvancedCondition;
                    })
                    .map((ball) => {"""

content = content.replace(target2, replacement2)

with open(path, 'w') as f:
    f.write(content)

print("Finished shared filter port!")
