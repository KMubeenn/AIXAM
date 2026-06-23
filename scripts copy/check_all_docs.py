import zipfile
import xml.etree.ElementTree as ET
import os

def get_doc_info(docx_path):
    headings = []
    word_count = 0
    text_blocks = []
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
                
                words = text.split()
                word_count += len(words)
                text_blocks.append(text)
                
                # Check if heading
                is_heading = False
                if style and ('heading' in style.lower() or style.isdigit() or any(h in style for h in ['Heading', 'Title', 'Subtitle', '1', '2', '3', '4'])):
                    is_heading = True
                elif text.startswith(('Chapter ', '1.', '2.', '3.', '4.', '5.', '6.', '7.', '8.', '9.')) and len(text) < 150:
                    is_heading = True
                    
                if is_heading:
                    headings.append((style or "None", text))
    except Exception as e:
        print(f"Error reading {docx_path}: {e}")
    return len(headings), word_count, headings

def main():
    docs_dir = r"d:\ML\Lawbot\docs"
    files = [
        "Irshad_FYP_Mid.docx",
        "Constitution and Legal Assistance RAG Bot - FYP Report.docx",
        "FYP Report-AIXAM.docx"
    ]
    
    for f in files:
        path = os.path.join(docs_dir, f)
        if os.path.exists(path):
            n_headings, w_count, headings = get_doc_info(path)
            print(f"\n======================================")
            print(f"FILE: {f}")
            print(f"Word Count: {w_count}")
            print(f"Headings Count: {n_headings}")
            print("Headings:")
            for s, h in headings[:30]:
                print(f"  [{s}] {h}")
            if len(headings) > 30:
                print(f"  ... and {len(headings) - 30} more ...")
            print("Last 5 Headings:")
            for s, h in headings[-5:]:
                print(f"  [{s}] {h}")

if __name__ == "__main__":
    main()
