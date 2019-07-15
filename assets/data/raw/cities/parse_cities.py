import csv
import pycountry
from collections import defaultdict

# Read cities file and write into files by country
print("Reading csv file")
country_cities = defaultdict(lambda: [])
with open("worldcitiespop.csv", newline="", encoding="utf-8") as cities:
    # Open file with csv reader
    cities_reader = csv.reader(cities, delimiter=",")
    # Skip headers
    next(cities_reader, None)
    # Iterate through cities, adding to country dictionary
    for row in cities_reader:
        country = row[0].upper()
        city_name = row[2]
        country_cities[country].append(city_name)

print("Writing city files")
# Create files for cities
FOLDER_OUTPUT = "../../presets/cities/"
for country_code in country_cities:
    # Get country from pycountry
    country = pycountry.countries.get(alpha_2=country_code)
    # Check historic countries if not found
    if country is None:
        country = pycountry.historic_countries.get(alpha_2=country_code)

    if country is not None:
        # Write the cities as lines to a new file
        file_name = FOLDER_OUTPUT + "Cities - " + country.name + ".txt"
        with open(file_name, "w", encoding="utf-8") as cities:
            cities.write("\n".join(country_cities[country_code]))
    else:
        print("No country with code: " + country_code)

print("Done")
