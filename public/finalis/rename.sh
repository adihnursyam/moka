# This script renames JPG files in subdirectories.
# It expects the files to be in the format "XX YY - Name.jpg"
# and renames them to "XXYY.jpg".
#
# Usage:
# 1. Save this script as, for example, 'rename_photos.sh'.
# 2. Make it executable: chmod +x rename_photos.sh
# 3. Run it from the 'finalis' directory: ./rename_photos.sh

echo "Starting file renaming process..."

# Define the parent directory (where your 'children' folders are)
# Assuming you run this script from the 'finalis' directory
PARENT_DIR="./"

# Loop through each child directory (HD, JR, MD, MR)
# You can add or remove directory names here as needed
for dir in "JD" "JR" "MD" "MR"; do
    # Check if the directory exists
    if [ -d "${PARENT_DIR}${dir}" ]; then
        echo "Processing directory: ${PARENT_DIR}${dir}"

        # Loop through all .jpg files in the current directory
        # -iname makes the search case-insensitive for .jpg
        find "${PARENT_DIR}${dir}" -maxdepth 1 -type f -iname "*.jpg" | while read -r filepath; do
            # Get the base filename (e.g., "JD 02 - Exsel.jpg")
            filename=$(basename -- "$filepath")
            # Get the directory path (e.g., "finalis/HD")
            dirpath=$(dirname -- "$filepath")

            # Extract the desired part of the name using sed
            # This regex captures "XX YY" and removes spaces
            # For "JD 02 - Exsel.jpg", it will capture "JD 02", then remove the space to get "JD02"
            new_name=$(echo "$filename" | sed -E 's/^([A-Z]{2})[[:space:]]+([0-9]{2}).*\.jpg$/\1\2.jpg/i')

            # Check if a new name was successfully generated and if it's different from the original
            if [[ -n "$new_name" && "$new_name" != "$filename" ]]; then
                old_filepath="${dirpath}/${filename}"
                new_filepath="${dirpath}/${new_name}"

                # Perform the rename
                mv -v "$old_filepath" "$new_filepath"
            else
                echo "Skipping: '$filename' - No valid new name generated or name is already correct."
            fi
        done
    else
        echo "Directory not found: ${PARENT_DIR}${dir}"
    fi
done

echo "File renaming process completed."