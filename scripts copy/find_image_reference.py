import zipfile
import xml.etree.ElementTree as ET
import os

def main():
    docs_dir = r"d:\ML\Lawbot\docs"
    r_path = os.path.join(docs_dir, "Constitution and Legal Assistance RAG Bot - FYP Report.docx")
    
    if os.path.exists(r_path):
        with zipfile.ZipFile(r_path) as z:
            doc_xml = z.read('word/document.xml')
            root = ET.fromstring(doc_xml)
            ns = {
                'w': 'http://schemas.openxmlformats.org/wordprocessingml/2006/main',
                'a': 'http://schemas.openxmlformats.org/drawingml/2006/main',
                'pic': 'http://schemas.openxmlformats.org/drawingml/2006/picture',
                'r': 'http://schemas.openxmlformats.org/officeDocument/2006/relationships'
            }
            
            # Let's check paragraph numbers and text for drawings
            for idx, p in enumerate(root.findall('.//w:p', ns)):
                drawings = p.findall('.//w:drawing', ns)
                if drawings:
                    text_parts = [t.text for t in p.findall('.//w:t', ns) if t.text]
                    text = "".join(text_parts).strip()
                    print(f"Paragraph {idx} has drawing(s). Text: '{text[:100]}'")
                    # Find relationship ID in drawing
                    for drawing in drawings:
                        blips = drawing.findall('.//a:blip', ns)
                        for blip in blips:
                            embed_id = blip.get('{http://schemas.openxmlformats.org/officeDocument/2006/relationships}embed')
                            print(f"  Drawing embed relationship ID: {embed_id}")
    else:
        print("File not found!")

if __name__ == "__main__":
    main()
