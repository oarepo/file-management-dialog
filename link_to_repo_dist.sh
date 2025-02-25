#!/bin/bash

# Usage: ./link_to_repo.sh <your_root_repository_directory>
# Afterwards, run `npm run build` to see the changes in the repository 

# Check if the absolute path to the repository root directory provided

repository_root_path=$1

if [ -z "$repository_root_path" ]; then
    echo "Please provide the path to the repository root directory. Example: ./link_to_repo.sh /home/<user>/repozitare/nr-docs"
    exit 1
fi

repository_file_manager_dist_path="$repository_root_path/.venv/var/instance/assets/node_modules/@oarepo/file-manager/dist"
expected_files=("file-manager.es.js" "file-manager.umd.js")

# Check if the repository dist directory exists and remove it if it does
# For safety reasons, check if the path contains the correct file names

if [ -d "$repository_file_manager_dist_path" ]; then
    for file in "${expected_files[@]}"; do
        if ! [ -f "$repository_file_manager_dist_path/$file" ]; then
            echo "The repository dist directory does not contain the expected files. Please check the path."
            exit 1
        fi
    done

    rm -rf "$repository_file_manager_dist_path"
fi

# Create a symbolic link to the repository dist directory

ln -s "$(pwd)/dist" "$repository_file_manager_dist_path"
