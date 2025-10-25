# template replacement

import os

directory = os.fsencode(os.getcwd())

common_header = """
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta charset="UTF-8">
<link rel="stylesheet" type="text/css" href="{stylesheetroot}bootstrap-custom.css">
<link rel="stylesheet" type="text/css" href="{stylesheetroot}stylesheet.css">
"""

for subdir, dirs, files in os.walk(directory):
    for file in files:
        filename = os.fsdecode(file)
        if (filename.endswith('.html')):
            absolute_path = os.path.join(subdir, file)
            relative_path = os.path.relpath(absolute_path,directory)

            depth = f"{relative_path}".count('/')

            file_content = ""
            with open(absolute_path, "r", encoding="utf-8") as infile:
                file_content = infile.read()

            local_header = common_header.replace("{stylesheetroot}","../" * depth)

            # perform text replacements
            file_content = file_content.replace("{HEADER_CONTENT}", local_header)

            with open(absolute_path, "w") as outfile:
                outfile.write(file_content)
