import docx
import os

def main():
    docs_dir = r"d:\ML\Lawbot\docs"
    r_path = os.path.join(docs_dir, "Constitution and Legal Assistance RAG Bot - FYP Report.docx")
    
    if os.path.exists(r_path):
        doc = docx.Document(r_path)
        print("Formatting check on first 10 paragraphs:")
        for idx in range(10):
            p = doc.paragraphs[idx]
            print(f"Paragraph [{idx}] style: '{p.style.name}'")
            print(f"  Alignment: {p.alignment}")
            print(f"  Runs count: {len(p.runs)}")
            for run in p.runs[:3]:
                print(f"    Run text: '{run.text[:30]}' | Font: '{run.font.name}' | Size: '{run.font.size}' | Bold: {run.bold}")
    else:
        print("File not found!")

if __name__ == "__main__":
    main()
