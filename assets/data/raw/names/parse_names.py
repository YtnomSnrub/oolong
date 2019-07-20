import os
import shutil

import math

import csv
from progress.bar import Bar

from collections import defaultdict


print("Cleaning output directory")
# Create output directory
OUTPUT_DIR = "../../presets/names/"
if not os.path.isdir(OUTPUT_DIR):
    os.makedirs(OUTPUT_DIR)
# Clean output directory
for file in os.listdir(OUTPUT_DIR):
    file_path = os.path.join(OUTPUT_DIR, file)
    try:
        if os.path.isfile(file_path):
            os.unlink(file_path)
        elif os.path.isdir(file_path):
            shutil.rmtree(file_path)
    except Exception as e:
        print(e)


# Read names file and write into files by year, gender
YEAR_GROUP_SIZE = 10
YEAR_MIN = 1880
YEAR_MAX = 2018
year_names = defaultdict(lambda: {})
for file in Bar("Reading data files").iter(os.listdir("./")):
    # Skip non data files
    if not file.startswith("yob"):
        continue

    # Find the year and year group
    year = int(file.strip("yob.txt"))
    if year < YEAR_MIN or year > YEAR_MAX:
        continue

    year_start = max(math.floor(year / YEAR_GROUP_SIZE)
                     * YEAR_GROUP_SIZE, YEAR_MIN)
    year_end = min(math.ceil((year + 1) / YEAR_GROUP_SIZE)
                   * YEAR_GROUP_SIZE - 1, YEAR_MAX)
    year_group = str(year_start) + " - " + str(year_end)
    # Open the file
    with open(file, newline="", encoding="utf-8") as names:
        # Open file with csv reader
        names_reader = csv.reader(names, delimiter=",")
        # Skip headers
        next(names_reader, None)
        # Iterate through names, adding to names dictionary
        for row in names_reader:
            name = row[0].strip()
            name_gender = row[1]
            # Find name group
            if name_gender == "M":
                name_group = year_group + " (Male)"
                name_group_all = "All (Male)"
            elif name_gender == "F":
                name_group = year_group + " (Female)"
                name_group_all = "All (Female)"
            else:
                name_group = year_group + " (Other)"
                name_group_all = "All (Other)"

            if name not in year_names[name_group]:
                year_names[name_group][name] = True
            if name not in year_names[name_group_all]:
                year_names[name_group_all][name] = True


# Create files for names
NAMES_MIN = 1000
for name_group in Bar("Writing name files").iter(year_names):
    name_count = len(year_names[name_group])
    # Write the names as lines to a new file
    file_name = name_group + ";" + str(name_count) + ".txt"
    file_path = os.path.join(OUTPUT_DIR, file_name)
    with open(file_path, "w", encoding="utf-8") as names:
        names.write("\n".join(year_names[name_group]))


print("Done")
