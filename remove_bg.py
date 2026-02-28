
import sys
from PIL import Image

def remove_background(image_path, output_path, bg_color_hint="white"):
    try:
        img = Image.open(image_path).convert("RGBA")
        datas = img.getdata()
        newData = []

        # Determine target background color to remove
        if bg_color_hint == "black":
            target_bg = (0, 0, 0)
        else:
            target_bg = (255, 255, 255) # default white

        threshold = 50 # Increase tolerance for compression artifacts

        for item in datas:
            # item is (R, G, B, A)
            # Calculate distance from target background color
            diff = sum([abs(item[i] - target_bg[i]) for i in range(3)])
            
            # If pixel is close to background color, make it transparent
            if diff < threshold:
                newData.append((255, 255, 255, 0))
            else:
                newData.append(item)

        img.putdata(newData)
        img.save(output_path, "PNG")
        print(f"Successfully processed {image_path} to {output_path}")
    except Exception as e:
        print(f"Error processing {image_path}: {e}")

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python3 remove_bg.py <input> <output> [bg_color_hint]")
    else:
        hint = sys.argv[3] if len(sys.argv) > 3 else "white"
        remove_background(sys.argv[1], sys.argv[2], hint)
