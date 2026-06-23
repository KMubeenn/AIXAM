import zipfile
import xml.etree.ElementTree as ET
import os

def search_docx(docx_path, query):
    matches = []
    try:
        with zipfile.ZipFile(docx_path) as z:
            doc_xml = z.read('word/document.xml')
            root = ET.fromstring(doc_xml)
            ns = {'w': 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'}
            for idx, p in enumerate(root.findall('.//w:p', ns)):
                text_parts = []
                for t in p.findall('.//w:t', ns):
                    if t.text:
                        text_parts.append(t.text)
                text = "".join(text_parts).strip()
                if query.lower() in text.lower():
                    matches.append((idx, text))
    except Exception as e:
        print(f"Error: {e}")
    return matches

def main():
    docs_dir = r"d:\ML\Lawbot\docs"
    prop_path = os.path.join(docs_dir, "complete_proposal.docx")
    
    if os.path.exists(prop_path):
        print("Searching in complete_proposal.docx...")
        for word in ["supervisor", "advisor", "coordinator", "institute", "peshawar"]:
            matches = search_docx(prop_path, word)
            print(f"Keyword '{word}' found {len(matches)} times.")
            for idx, text in matches[:5]:
                print(f"  [{idx}] {text[:150]}")
    else:
        print("complete_proposal.docx not found!")

if __name__ == "__main__":
    main()
