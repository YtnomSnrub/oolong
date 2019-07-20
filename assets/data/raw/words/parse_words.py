import os
import shutil

import math

import csv
from progress.bar import Bar

from collections import defaultdict


print("Cleaning output directory")
# Create output directory
OUTPUT_DIR = "../../presets/words/"
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


# Read words file and write into files by language
language_words = defaultdict(lambda: {})
for file in Bar("Reading data files").iter(os.listdir("./")):
    # Skip non data files
    if not file.startswith("words_"):
        continue

    # Find the language
    language = file.strip("words_.txt")
    # Open the file
    with open(file, newline="", encoding="utf-8") as words:
        # Iterate through words, adding to words dictionary
        for word_raw in words:
            # Strip and capitalise word
            word = ""
            word_stripped = word_raw.strip()
            if len(word_stripped) > 0:
                word += word_stripped[0].upper()
            if len(word_stripped) > 1:
                word += word_stripped[1:]

            # Add word to language
            language_words[language][word] = True


# Create files for names
WORDS_MIN = 1000
for language in Bar("Writing name files").iter(language_words):
    word_count = len(language_words[language])
    # Write the names as lines to a new file
    file_name = language + ";" + str(word_count) + ".txt"
    file_path = os.path.join(OUTPUT_DIR, file_name)
    with open(file_path, "w", encoding="utf-8") as words:
        words.write("\n".join(language_words[language]))


print("Done")
