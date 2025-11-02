# template replacement

import os
from html.parser import HTMLParser

# used for og:image embeds which require absolute URLs
site_root = "https://www.ravbug.com"

class HeaderHTMLParser(HTMLParser):
    _isInTitle = False
    title = ""
    desc = ""
    icon = ""

    def handle_starttag(self, tag, attrs):
        if tag == "title":
            self._isInTitle = True 
        if tag == "link":
            attr_dict = dict(attrs)
            if "id" in attr_dict and attr_dict["id"] == "favicon":
                self.icon = attr_dict["href"]
        if tag == "meta":
            # look for the description sub-tag
            attr_dict = dict(attrs)
            if "name" in attr_dict and attr_dict["name"] == "description":
                self.desc = attr_dict["content"]

    def handle_endtag(self, tag):
        if tag == "title" and self._isInTitle:
            self._isInTitle = False

    def handle_data(self, data):
        if self._isInTitle:
            self.title = data

directory = os.fsencode(os.getcwd())

common_header = """
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta charset="UTF-8">
<link rel="stylesheet" type="text/css" href="{stylesheetroot}bootstrap-custom.css">
<link rel="stylesheet" type="text/css" href="{stylesheetroot}stylesheet.css">
"""

common_jumbotron = """
<div class="jumbotron header">
    <div style="display:grid;grid-template-columns:100px 1fr;grid-template-rows:1fr;gap:10px;padding-bottom:10px">
        <img src={favicon_url} style="width:100%;height:100%;max-width:100px;max-height:100px">
        <div>
            <span style="color:white">{page_title}</span>
            <p style="color:white">{page_desc}</p> 
        </div>
    </div>
     <a class="headerlink btn btn-primary" href="/">Home</a>

    <a class="headerlink btn btn-primary header-nonessential" href="/#games">Games</a>

    <a class="headerlink btn btn-primary header-nonessential" href="/#software">Software</a>

    <a class="headerlink btn btn-primary header-nonessential" href="/#in_your_browser">In Your Browser</a>

    <a class="headerlink btn btn-primary header-nonessential" href="/#animation">Animation</a>

    <a class="headerlink btn btn-primary header-nonessential" href="/tutorials">Tutorials</a>

    <a class="headerlink btn btn-primary header-nonessential" href="/#miscellaneous">Miscellaneous</a>
</div>
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
            file_content = file_content.replace("{SITE_ROOT}", site_root)

            if "{JUMBOTRON}" in file_content:
                parser = HeaderHTMLParser()
                parser.feed(file_content)

                local_jumbotron = common_jumbotron.replace("{page_title}", parser.title)
                local_jumbotron = local_jumbotron.replace("{page_desc}", parser.desc)
                local_jumbotron = local_jumbotron.replace("{favicon_url}", parser.icon)

                file_content = file_content.replace("{JUMBOTRON}", local_jumbotron)

            with open(absolute_path, "w") as outfile:
                outfile.write(file_content)
