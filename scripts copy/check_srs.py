import zipfile
import xml.etree.ElementTree as ET
import os

def main():
    docs_dir = r"d:\ML\Lawbot\docs"
    path = os.path.join(docs_dir, "Chapter_3_SRS.docx")
    if os.path.exists(path):
        word_count = 0
        headings = []
        with zipfile.ZipFile(path) as z:
            doc_xml = z.read('word/document.xml')
            root = ET.fromstring(doc_xml)
            ns = {'w': 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'}
            for p in root.findall('.//w:p', ns):
                style = ""
                pPr = p.find('w:pPr', ns)
                if pPr is not None:
                    pStyle = pPr.find('w:pStyle', ns)
                    if pStyle is not None:
                        style = pStyle.get('{http://schemas.openxmlformats.org/wordprocessingml/2006/main}val')
                
                text_parts = []
                for t in p.findall('.//w:t', ns):
                    if t.text:
                        text_parts.append(t.text)
                text = "".join(text_parts).strip()
                if not text:
                    continue
                
                word_count += len(text.split())
                is_heading = False
                if style and ('heading' in style.lower() or style.isdigit() or any(h in style for h in ['Heading', 'Title', 'Subtitle', '1', '2', '3', '4'])):
                    is_heading = True
                elif text.startswith(('Chapter ', '1.', '2.', '3.', '4.', '5.', '6.', '7.', '8.', '9.')) and len(text) < 150:
                    is_heading = True
                if is_heading:
                    headings.append(text)
                    
        print(f"Chapter_3_SRS.docx: {word_count} words")
        print("Headings:")
        for h in headings:
            print(f"  {h}")
    else:
        print("Chapter_3_SRS.docx not found!")

if __name__ == "__main__":
    main()
