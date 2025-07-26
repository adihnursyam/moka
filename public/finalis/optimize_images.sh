#!/bin/bash

# This script converts JPG images to WebP format, resizes them to a maximum width of 500px,
# and attempts to optimize their file size to be under 100KB.
#
# Prerequisites:
# - ImageMagick must be installed (e.g., `brew install imagemagick` on macOS,
#   `sudo apt install imagemagick` on Ubuntu/Debian).
# - On Windows, ensure you selected "Install legacy utilities (e.g. convert.exe)" during installation.
#   If you still encounter "Invalid Parameter" errors, use 'magick convert' as shown below.
#
# Usage:
# 1. Save this script as, for example, 'optimize_images.sh'.
# 2. Make it executable: chmod +x optimize_images.sh
# 3. Run it from your 'finalis' directory: ./optimize_images.sh
#
# Output:
# - Converted .webp files will be saved in a new 'optimized_webp' subdirectory
#   within each original child directory (e.g., finalis/HD/optimized_webp/).
# - Original .jpg files remain untouched.

echo "Starting image conversion and optimization process..."

# Define the parent directory (where your 'children' folders are)
# Assuming you run this script from the 'finalis' directory
PARENT_DIR="./"

# Define the target width for the images
TARGET_WIDTH="500"

# Define the WebP quality setting (0-100). Adjust this value (e.g., 70-90)
# to fine-tune the balance between file size and visual quality.
# Lower value = smaller file size, potentially more artifacts.
# Higher value = larger file size, better quality.
WEBP_QUALITY="80"

# --- IMPORTANT FOR WINDOWS USERS ---
# Set MAGICK_HOME to your ImageMagick installation directory.
# This helps ImageMagick find its configuration files (like delegates.xml).
# REPLACE THE PATH BELOW WITH YOUR ACTUAL IMAGEMAGICK INSTALLATION PATH.
# Example: C:/Program Files/ImageMagick-7.1.2-0-Q16-HDRI
export MAGICK_HOME="C:\Users\adiha\AppData\Local\Microsoft\WindowsApps" # <--- UPDATE THIS PATH
# -----------------------------------

# Loop through each child directory (HD, JR, MD, MR)
# Add or remove directory names here as needed
for dir in "HD" "JR" "MD" "MR"; do
    CURRENT_DIR="${PARENT_DIR}${dir}"

    # Check if the directory exists
    if [ -d "${CURRENT_DIR}" ]; then
        echo "Processing directory: ${CURRENT_DIR}"

        # Create an output directory for the optimized WebP images
        OUTPUT_DIR="${CURRENT_DIR}/optimized_webp"
        mkdir -p "${OUTPUT_DIR}"

        # Loop through all .jpg files in the current directory
        # -iname makes the search case-insensitive for .jpg
        find "${CURRENT_DIR}" -maxdepth 1 -type f -iname "*.jpg" | while read -r filepath; do
            # Get the base filename (e.g., "JD02.jpg")
            filename=$(basename -- "$filepath")
            # Get the filename without extension (e.g., "JD02")
            filename_no_ext="${filename%.*}"

            # Define the output WebP filename
            output_webp_filename="${filename_no_ext}.webp"
            output_webp_filepath="${OUTPUT_DIR}/${output_webp_filename}"

            echo "  Converting '${filename}' to '${output_webp_filename}'..."

            # Use ImageMagick's convert command.
            # On Windows, explicitly using 'magick convert' helps avoid conflicts
            # with the built-in Windows 'convert.exe' utility.
            magick convert "$filepath" \
                    -resize "${TARGET_WIDTH}x" \
                    -define webp:image-hint=photo \
                    -quality "${WEBP_QUALITY}" \
                    -define webp:target-size=100kb \
                    "$output_webp_filepath"

            # Optional: Check the actual file size after conversion
            if [ -f "$output_webp_filepath" ]; then
                filesize_kb=$(du -k "$output_webp_filepath" | cut -f1)
                echo "    Converted size: ${filesize_kb} KB"
                if (( filesize_kb > 100 )); then
                    echo "    WARNING: ${output_webp_filename} exceeded 100KB (${filesize_kb} KB). Consider lowering WEBP_QUALITY."
                fi
            else
                echo "    ERROR: Failed to create ${output_webp_filename}"
            fi

        done
    else
        echo "Directory not found: ${CURRENT_DIR}"
    fi
done

echo "Image conversion and optimization process completed."
echo "Optimized WebP images are saved in 'optimized_webp' subdirectories."
