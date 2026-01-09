
from PIL import Image
import sys
import os

def remove_bg(input_path, output_path, bg_color):
    try:
        img = Image.open(input_path).convert("RGBA")
        datas = img.getdata()
        
        newData = []
        # Tweak these thresholds if needed
        threshold = 200 if bg_color == 'white' else 30 
        
        for item in datas:
            # item is (R, G, B, A)
            if bg_color == 'white':
                # If pixel is close to white
                if item[0] > threshold and item[1] > threshold and item[2] > threshold:
                    newData.append((255, 255, 255, 0)) # Make it transparent
                else:
                    newData.append(item)
            else: # bg_color == 'black'
                # If pixel is close to black
                if item[0] < threshold and item[1] < threshold and item[2] < threshold:
                    newData.append((0, 0, 0, 0)) # Make it transparent
                else:
                    newData.append(item)
        
        img.putdata(newData)
        # Trim borders (getbbox)
        bbox = img.getbbox()
        if bbox:
            img = img.crop(bbox)
            
        img.save(output_path, "PNG")
        print(f"Successfully processed {input_path} to {output_path}")
        
    except Exception as e:
        print(f"Error processing {input_path}: {e}")

# Process Light Logo (Black on White) -> Remove White
remove_bg(
    r"C:/Users/User/.gemini/antigravity/brain/6dda0c01-3315-4391-ae10-c900eaf24050/logo_black_on_white_1767946868653.png", 
    "c:/bized/public/brand-logo.png", 
    "white"
)

# Process Dark Logo (White on Black) -> Remove Black
remove_bg(
    r"C:/Users/User/.gemini/antigravity/brain/6dda0c01-3315-4391-ae10-c900eaf24050/logo_white_on_black_1767946892329.png", 
    "c:/bized/public/brand-logo-white.png", 
    "black"
)
