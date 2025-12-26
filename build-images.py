
import os
import struct
from html.parser import HTMLParser
from PIL import Image
from bs4 import BeautifulSoup
import cssutils
from cssutils import parseStyle
import logging
import xml.etree.ElementTree as ET
directory = os.fsencode(os.getcwd())

exclusions = [
    "codemirror"
]

cssutils.log.setLevel(logging.CRITICAL)


for subdir, dirs, files in os.walk(directory):
    for file in files:
        filename = os.fsdecode(file)
        if (filename.endswith('.html')):
            absolute_path = os.path.join(subdir, file)
            relative_path = os.path.relpath(absolute_path,directory)

            file_content = ""
            with open(absolute_path, "r", encoding="utf-8") as infile:
                file_content = infile.read()


            parsed_html = BeautifulSoup(file_content, features="html.parser")
            for img_tag in parsed_html.find_all("img"):
                url = img_tag.get("src")
                if url is None:
                    continue
                
                routed_url = os.path.join(os.fsdecode(subdir), url)

                has_exclusion = False
                for exclusion in exclusions:
                    if exclusion in str(routed_url):
                        has_exclusion = True
                        break
                        
                if (has_exclusion):
                    continue

                def set_aspect(width, height):
                    style = img_tag.get("style")
                    style = parseStyle(style)
                    style["aspect-ratio"] = f"{width}/{height}"

                    img_tag['style'] = style.cssText

                if url.endswith(".svg"):
                    tree = ET.parse(routed_url).getroot()
                    if "viewBox" in tree.attrib: 
                        viewbox = tree.attrib["viewBox"].split(' ')
                        set_aspect(viewbox[2],viewbox[3])
                    pass
                else:
                    try:
                        with Image.open(routed_url) as img:
                            width, height = img.size
                            set_aspect(width, height)      

                    except Exception as e:
                        print(f"{absolute_path} Failed to decode {url}: {e}")

            # serialize modified HTML
            file_content = str(parsed_html)
            
            with open(absolute_path, "w") as outfile:
                outfile.write(file_content)
