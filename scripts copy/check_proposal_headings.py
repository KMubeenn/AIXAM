import zipfile
import xml.etree.ElementTree as ET
import os

def get_headings(docx_path):
    headings = []
    try:
        with zipfile.ZipFile(docx_path) as z:
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
                is_heading = False
                if style and ('heading' in style.lower() or style.isdigit() or any(h in style for h in ['Heading', 'Title', 'Subtitle', '1', '2', '3', '4'])):
                    is_heading = True
                elif text.startswith(('Chapter ', '1.', '2.', '3.', '4.', '5.', '6.', '7.', '8.', '9.')) and len(text) < 150:
                    is_heading = True
                if is_heading:
                    headings.append(text)
    except Exception as e:
        print(f"Error: {e}")
    return headings

def main():
    docs_dir = r"d:\ML\Lawbot\docs"
    for f in ["complete_proposal.docx", "FYP_PROPOSAL.docx"]:
        path = os.path.join(docs_dir, f)
        if os.path.exists(path):
            headings = get_headings(path)
            print(f"\nHeadings in {f} ({len(headings)}):")
            for h in headings[:20]:
                print(f"  {h}")
            if len(headings) > 20:
                print(f"  ... and {len(headings) - 20} more ...")
        else:
            print(f"{f} not found!")

if __name__ == "__main__":
    main()
