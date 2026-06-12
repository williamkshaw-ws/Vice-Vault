import sys

# --- Fix App.tsx Username ---
app_path = '/Users/williamkshaw/antigravity/Vice-Vault/src/App.tsx'
with open(app_path, 'r') as f:
    app_content = f.read()

app_content = app_content.replace(
    'username={friendBagUsername || shareUsername || userProfile?.name || "Guest"}',
    'username={friendBagUsername || shareUsername || userProfile?.displayName || currentUser?.displayName || "Guest"}'
)

with open(app_path, 'w') as f:
    f.write(app_content)


# --- Fix TrophyCase.tsx Poster Design ---
trophy_path = '/Users/williamkshaw/antigravity/Vice-Vault/src/components/TrophyCase.tsx'
with open(trophy_path, 'r') as f:
    trophy_content = f.read()

# Update padding
trophy_content = trophy_content.replace("padding: '80px'", "padding: '50px 40px'")

# Update title to one line
old_title = """          <h1 className="text-6xl text-white tracking-tighter mb-20 relative z-10 text-center uppercase" style={{ fontFamily: 'Impact, sans-serif' }}>
            <span className="text-[#2563eb] block text-4xl mb-2">{username}'s</span>
            Collection
          </h1>"""
new_title = """          <h1 className="text-6xl text-white tracking-tighter mb-16 relative z-10 text-center uppercase flex items-center justify-center gap-3 w-full" style={{ fontFamily: 'Impact, sans-serif', textShadow: '0 4px 10px rgba(0,0,0,0.5)' }}>
            <span className="text-[#2563eb] text-7xl">{username}'S</span>
            <span className="text-7xl">BALL COLLECTION</span>
          </h1>"""
trophy_content = trophy_content.replace(old_title, new_title)

# Update width slightly so 10 balls fit comfortably with less edge padding
trophy_content = trophy_content.replace("width: '1400px'", "width: '1350px'")

with open(trophy_path, 'w') as f:
    f.write(trophy_content)


# --- Fix BallVisual.tsx Base64 Images ---
ball_path = '/Users/williamkshaw/antigravity/Vice-Vault/src/components/BallVisual.tsx'
with open(ball_path, 'r') as f:
    ball_content = f.read()

hook_code = """import { Check, X } from "lucide-react";
import { useState, useEffect } from "react";

// Hook to convert external Firebase Storage URLs to base64 Data URLs so html-to-image never hits Safari CORS Security errors
function useBase64Image(url?: string) {
  const [base64, setBase64] = useState<string | undefined>(url?.startsWith('data:') ? url : undefined);
  
  useEffect(() => {
    if (!url || url.startsWith('data:')) {
      setBase64(url);
      return;
    }
    
    let isMounted = true;
    fetch(url)
      .then(res => res.blob())
      .then(blob => {
        const reader = new FileReader();
        reader.onloadend = () => {
          if (isMounted) setBase64(reader.result as string);
        };
        reader.readAsDataURL(blob);
      })
      .catch(err => {
        console.error("Failed to load base64 for image", url, err);
        if (isMounted) setBase64(url); // Fallback to raw url
      });
      
    return () => { isMounted = false; };
  }, [url]);

  return base64;
}
"""

ball_content = ball_content.replace('import { Check, X } from "lucide-react";', hook_code)

# Replace usage inside BallVisual
ball_content = ball_content.replace("export default function BallVisual({", """export default function BallVisual({""")

# Add hooks inside the component
search_string = """  const sizeClasses = {"""
replace_string = """  const base64CustomImage = useBase64Image(customImage);
  const base64CustomImageBox = useBase64Image(customImageBox);
  const base64CustomImageSleeve = useBase64Image(customImageSleeve);

  const sizeClasses = {"""
ball_content = ball_content.replace(search_string, replace_string)

# Replace img src targets
ball_content = ball_content.replace("src={customImage}", "src={base64CustomImage}")
ball_content = ball_content.replace("src={customImageBox}", "src={base64CustomImageBox}")
ball_content = ball_content.replace("src={customImageSleeve}", "src={base64CustomImageSleeve}")

with open(ball_path, 'w') as f:
    f.write(ball_content)

print("Fixed App, TrophyCase, and BallVisual")
