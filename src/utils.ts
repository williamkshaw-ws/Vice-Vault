export function sanitizeId(model: string, color: string, name?: string, variation?: string, year?: string): string {
  const clean = (s: string) => s.trim().toUpperCase().replace(/[^A-Z0-9]+/g, "_").replace(/^_+|_+$/g, "");
  const modelPart = clean(model);
  const colorPart = clean(color);
  const namePart = name ? clean(name) : "";
  const varPart = variation ? clean(variation) : "";
  const yearPart = year ? clean(year) : "";
  
  let base = modelPart;
  if (namePart) base += `-${namePart}`;
  base += `-${colorPart}`;
  if (varPart) base += `-${varPart}`;
  if (yearPart) base += `-${yearPart}`;
  return base;
}

export function isStrongPassword(password: string): boolean {
  if (password.length < 8) return false;
  if (!/[A-Z]/.test(password)) return false;
  if (!/[a-z]/.test(password)) return false;
  if (!/[0-9]/.test(password)) return false;
  if (!/[^A-Za-z0-9]/.test(password)) return false;
  return true;
}

export const ACCENT_COLORS = [
  { name: "Royal Blue", value: "#2563eb" },
  { name: "Neon Red", value: "#ff3366" },
  { name: "Gold", value: "#d4af37" },
  { name: "Cyan Blue", value: "#00e5ff" },
  { name: "Royal Purple", value: "#9d4edf" },
  { name: "Masters Green", value: "#17b056" },
  { name: "Volt Orange", value: "#ff6b00" },
  { name: "Hot Pink", value: "#ff33cc" },
  { name: "Electric Teal", value: "#00f5d4" }
];
