import os
import shutil

import csv
import pycountry
from progress.bar import Bar

from collections import defaultdict


print("Cleaning output directory")
# Create output directory
OUTPUT_DIR = "../../presets/cities/"
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


# Read cities file and write into files by country
print("Reading csv files")
country_cities = defaultdict(lambda: [])
with open("worldcitiespop.csv", newline="", encoding="utf-8") as cities:
    # Open file with csv reader
    cities_reader = csv.reader(cities, delimiter=",")
    # Skip headers
    next(cities_reader, None)
    # Iterate through cities, adding to country dictionary
    for row in cities_reader:
        country = row[0].upper()
        city_name = row[2].strip()
        if not "(" in city_name and not ")" in city_name and \
                not "[" in city_name and not "]" in city_name:
            country_cities[country].append(city_name)


# Create files for cities
CITIES_MIN = 1000
for country_code in Bar("Writing city files").iter(country_cities):
    # Check that there are enough cities
    city_count = len(country_cities[country_code])
    if city_count < CITIES_MIN:
        continue

    # Get country from pycountry
    country = pycountry.countries.get(alpha_2=country_code)
    # Check historic countries if not found
    if country is None:
        country = pycountry.historic_countries.get(alpha_2=country_code)

    if country is not None:
        # Choose name for country
        country_name = country.name
        if hasattr(country, "common_name"):
            country_name = country.common_name

        file_name = country_name + ";" + str(city_count) + ".txt"
        # Write the cities as lines to a new file
        file_path = os.path.join(OUTPUT_DIR, file_name)
        with open(file_path, "w", encoding="utf-8") as cities:
            cities.write("\n".join(country_cities[country_code]))
    else:
        print("No country with code: " + country_code)


print("Done")
