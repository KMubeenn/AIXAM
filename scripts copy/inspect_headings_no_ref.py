import zipfile
import xml.etree.ElementTree as ET
import os

def main():
    docs_dir = r"d:\ML\Lawbot\docs"
    r_path = os.path.join(docs_dir, "Constitution and Legal Assistance RAG Bot - FYP Report.docx")
    out_path = os.path.join(docs_dir, "constitution_headings.txt")
    
    with open(out_path, "w", encoding="utf-8") as f:
        try:
            with zipfile.ZipFile(r_path) as z:
                doc_xml = z.read('word/document.xml')
                root = ET.fromstring(doc_xml)
                ns = {'w': 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'}
                
                heading_count = 0
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
                        # Skip bibliography entries
                        if text.startswith('[') and ('et al.' in text or 'Journal' in text or 'Conference' in text or 'pp.' in text or 'vol.' in text or 'Available:' in text):
                            continue
                        f.write(f"[{style}] {text}\n")
                        heading_count += 1
                f.write(f"\nTotal non-reference headings: {heading_count}\n")
        except Exception as e:
            f.write(f"Error: {e}\n")
            
    print(f"Written headings to {out_path}")

if __name__ == "__main__":
    main()
