import zipfile
import xml.etree.ElementTree as ET
import os

def extract_text_from_docx_xml(docx_path):
    print(f"Extracting XML from {docx_path}...")
    try:
        with zipfile.ZipFile(docx_path) as z:
            # List contents
            names = z.namelist()
            print(f"Archive contains {len(names)} files. Main document in archive: {'word/document.xml' in names}")
            
            # Read document.xml
            doc_xml = z.read('word/document.xml')
            root = ET.fromstring(doc_xml)
            
            # Namespaces
            ns = {
                'w': 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'
            }
            
            elements = []
            word_count = 0
            
            # Find all paragraphs
            for p in root.findall('.//w:p', ns):
                # Check style if any
                style = ""
                pPr = p.find('w:pPr', ns)
                if pPr is not None:
                    pStyle = pPr.find('w:pStyle', ns)
                    if pStyle is not None:
                        style = pStyle.get('{http://schemas.openxmlformats.org/wordprocessingml/2006/main}val')
                
                # Extract text
                text_parts = []
                for t in p.findall('.//w:t', ns):
                    if t.text:
                        text_parts.append(t.text)
                
                text = "".join(text_parts).strip()
                if not text:
                    continue
                    
                word_count += len(text.split())
                if style:
                    elements.append(f"[{style}] {text}")
                else:
                    elements.append(f"[Text] {text}")
            
            return elements, word_count
    except Exception as e:
        import traceback
        traceback.print_exc()
        return [f"Error reading file: {str(e)}"], 0

def main():
    docs_dir = r"d:\ML\Lawbot\docs"
    irshad_path = os.path.join(docs_dir, "Irshad_FYP_Mid.docx")
    aixam_path = os.path.join(docs_dir, "FYP Report-AIXAM.docx")
    
    out_file = r"d:\ML\Lawbot\docs\docx_analysis.txt"
    
    with open(out_file, "w", encoding="utf-8") as f:
        f.write("=== MANUAL XML PARSING OF DOCX ===\n\n")
        
        # Parse Irshad
        content_irshad, words_irshad = extract_text_from_docx_xml(irshad_path)
        f.write(f"File: Irshad_FYP_Mid.docx\n")
        f.write(f"Word Count: {words_irshad}\n")
        f.write("Structure:\n")
        for item in content_irshad[:150]:
            f.write(item + "\n")
        if len(content_irshad) > 150:
            f.write(f"... and {len(content_irshad) - 150} more items ...\n")
            
        f.write("\n" + "="*50 + "\n\n")
        
        # Parse AIXAM
        content_aixam, words_aixam = extract_text_from_docx_xml(aixam_path)
        f.write(f"File: FYP Report-AIXAM.docx\n")
        f.write(f"Word Count: {words_aixam}\n")
        f.write("Structure:\n")
        for item in content_aixam[:300]:
            f.write(item + "\n")
        if len(content_aixam) > 300:
            f.write(f"... and {len(content_aixam) - 300} more items ...\n")
            
    print(f"Analysis written to {out_file}")

if __name__ == "__main__":
    main()
