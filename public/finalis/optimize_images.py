import os
from PIL import Image

def optimize_images_to_webp(parent_dir="./", target_width=500, webp_quality=80, max_filesize_kb=100):
    """
    Converts JPG images to WebP format, resizes them, and optimizes file size.
    Deletes the original JPG file upon successful conversion.

    Args:
        parent_dir (str): The base directory containing the child folders (HD, JR, MD, MR).
                          Defaults to the current directory.
        target_width (int): The maximum width for the output WebP images. Aspect ratio is maintained.
        webp_quality (int): WebP compression quality (0-100). Lower values mean smaller files
                            but potentially more artifacts.
        max_filesize_kb (int): Target maximum file size in KB. The script will try to achieve this
                               by adjusting quality, but it's not a strict guarantee, especially
                               with fixed dimensions.
    """
    print("Starting image conversion and optimization process...")
    print(f"Current working directory: {os.getcwd()}")

    # Define the child directories to process
    # Add or remove directory names here as needed
    child_dirs = ["JD", "JR", "MD", "MR"]

    for dir_name in child_dirs:
        current_dir_path = os.path.join(parent_dir, dir_name)

        # Check if the directory exists
        if not os.path.isdir(current_dir_path):
            print(f"Directory not found: {current_dir_path}")
            continue

        print(f"Processing directory: {current_dir_path}")

        # Create an output directory for the optimized WebP images
        output_dir = os.path.join(current_dir_path, "optimized_webp")
        os.makedirs(output_dir, exist_ok=True) # exist_ok=True prevents error if dir already exists

        # Loop through all files in the current directory
        for filename in os.listdir(current_dir_path):
            # Process only JPG files (case-insensitive)
            if filename.lower().endswith(".jpg"):
                filepath = os.path.join(current_dir_path, filename)
                filename_no_ext = os.path.splitext(filename)[0] # Get filename without extension

                output_webp_filename = f"{filename_no_ext}.webp"
                output_webp_filepath = os.path.join(output_dir, output_webp_filename)

                print(f"  Converting '{filename}' to '{output_webp_filename}'...")

                try:
                    with Image.open(filepath) as img:
                        # Calculate new dimensions while maintaining aspect ratio
                        original_width, original_height = img.size
                        if original_width > target_width:
                            new_width = target_width
                            new_height = int((target_width / original_width) * original_height)
                            img = img.resize((new_width, new_height), Image.LANCZOS) # LANCZOS for high quality downscaling
                        # else: image is already smaller than target_width, no resize needed

                        # Save as WebP with quality and filesize optimization attempt
                        # Pillow's 'quality' parameter directly controls compression.
                        # For filesize target, we might need to iterate, but for simplicity
                        # we'll rely on quality and the 'optimize' flag.
                        img.save(output_webp_filepath, "webp", quality=webp_quality, optimize=True)

                        # Check the actual file size after conversion
                        filesize_bytes = os.path.getsize(output_webp_filepath)
                        filesize_kb = filesize_bytes / 1024

                        print(f"    Converted size: {filesize_kb:.2f} KB")
                        if filesize_kb > max_filesize_kb:
                            print(f"    WARNING: {output_webp_filename} exceeded {max_filesize_kb}KB ({filesize_kb:.2f} KB). Consider lowering 'webp_quality' in the script.")
                        
                        # --- NEW: Delete original file if conversion was successful ---
                        os.remove(filepath)
                        print(f"    Original file '{filename}' deleted successfully.")
                        # --- END NEW ---

                except Exception as e:
                    print(f"    ERROR: Failed to process '{filename}'. Reason: {e}")

    print("Image conversion and optimization process completed.")
    print(f"Optimized WebP images are saved in 'optimized_webp' subdirectories within {parent_dir}.")

# --- How to run the script ---
if __name__ == "__main__":
    # Call the function with your desired parameters
    # Make sure you run this script from the 'finalis' directory
    optimize_images_to_webp(
        parent_dir="./",
        target_width=500,
        webp_quality=80, # Adjust this value (e.g., 70-90) for quality/size balance
        max_filesize_kb=100
    )
