import zipfile
import xml.etree.ElementTree as ET
import os

def get_word_count(docx_path):
    word_count = 0
    try:
        with zipfile.ZipFile(docx_path) as z:
            doc_xml = z.read('word/document.xml')
            root = ET.fromstring(doc_xml)
            ns = {'w': 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'}
            for p in root.findall('.//w:p', ns):
                text_parts = []
                for t in p.findall('.//w:t', ns):
                    if t.text:
                        text_parts.append(t.text)
                text = "".join(text_parts).strip()
                if text:
                    word_count += len(text.split())
    except Exception as e:
        print(f"Error: {e}")
    return word_count

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
            print(f"{f}: {get_word_count(path)} words")

if __name__ == "__main__":
    main()
