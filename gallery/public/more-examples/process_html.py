from bs4 import BeautifulSoup
import re
from pathlib import Path

html_files = sorted(Path(".").glob("*.html"))

for file in html_files:
    if "-processed" in file.name:
        continue

    with open(file) as f:
        html = BeautifulSoup(f)


    # remove header in html

    for header in html.find_all('header'):
        header.decompose()

    for footer in html.find_all('footer'):
        footer.decompose()

    for element in html.find_all(string=lambda text: text and "Desktop view" in text):
        element.parent.decompose()

    for element in html.find_all(string=lambda text: text and "Design specification" in text):
        element.parent.decompose()

    for h6 in html.find_all('h6', string=lambda text: text and "View" in text):
        h6.decompose()

    for h5 in html.find_all('h5', string=lambda text: text and "Cicero" in text):
        h5.parent.decompose()

    for h6 in html.find_all('h6', string=lambda text: text and "Specification" in text):
        h6.parent.parent.decompose()

    for div in html.find_all('div', class_="card"):
        div.decompose()

    for h6 in html.find_all('h6', string=lambda text: text and "Rule" in text):
        h6.parent.parent.decompose()

    rows = list(html.find_all('div', class_="row"))
    if len(rows) > 1:
        for i in range(len(rows)):
            if i == 1: 
                continue
            rows[i].decompose()

    for div in html.find_all('div'):
        if not div.get_text(strip=True) and not div.find_all():
            div.decompose()

    # Compact and save HTML
    with open(file.with_stem(file.stem + "-processed"), 'w') as f:
        f.write(re.sub(r'>\s+<', '><', str(html).strip()))