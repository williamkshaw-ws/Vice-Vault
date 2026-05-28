import os
import re
import requests
from bs4 import BeautifulSoup

# The URL to pull from
url = "https://www.vicegolf.com/collections/golf-balls"

# Modern sites require a "User-Agent" header so they recognize the script as a browser request
headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
}

def download_vice_catalog():
    print("Connecting to Vice Golf catalog...")
    response = requests.get(url, headers=headers)
    
    if response.status_code != 200:
        print(f"Failed to access the site. Status code: {response.status_code}")
        return

    soup = BeautifulSoup(response.text, 'html.parser')
    
    # Create a local folder on your computer to store the images
    folder_name = "Vice_Golf_Ball_Catalog"
    os.makedirs(folder_name, exist_ok=True)
    
    # Find all image tags on the page
    images = soup.find_all('img')
    print(f"Found {len(images)} potential images. Starting download...")

    downloaded_count = 0
    for index, img in enumerate(images):
        # Check standard src attributes and lazy-loaded attributes common on e-commerce sites
        img_url = img.get('src') or img.get('data-src') or img.get('srcset')
        
        if not img_url:
            continue
            
        # Clean up image URLs if they are bundled in a srcset string
        if ',' in img_url:
            img_url = img_url.split(',')[0].split(' ')[0]

        # Ensure the URL has the correct web protocol prefix
        if img_url.startswith('//'):
            img_url = 'https:' + img_url
        elif not img_url.startswith('http'):
            continue  # Skip internal tracking pixels or icons

        # Try to find descriptive text to name the file safely (e.g., from the 'alt' text)
        alt_text = img.get('alt', '').strip()
        if alt_text:
            # Clean up the name so it doesn't contain illegal filename characters
            clean_name = re.sub(r'[\\/*?:"<>|]', "", alt_text).replace(" ", "_")
            filename = f"{clean_name}.jpg"
        else:
            filename = f"vice_ball_{index + 1}.jpg"

        filepath = os.path.join(folder_name, filename)

        # Skip if we already downloaded an image with this exact name
        if os.path.exists(filepath):
            continue

        try:
            # Download and save the image locally
            img_data = requests.get(img_url, headers=headers).content
            with open(filepath, 'wb') as handler:
                handler.write(img_data)
            print(f"Saved: {filename}")
            downloaded_count += 1
        except Exception as e:
            # If a single image fails, skip it and keep going
            continue

    print(f"\nFinished! Downloaded {downloaded_count} images into the '{folder_name}' folder.")

if __name__ == "__main__":
    download_vice_catalog()
