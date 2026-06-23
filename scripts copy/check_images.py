import zipfile
import os

def main():
    docs_dir = r"d:\ML\Lawbot\docs"
    r_path = os.path.join(docs_dir, "Constitution and Legal Assistance RAG Bot - FYP Report.docx")
    
    if os.path.exists(r_path):
        with zipfile.ZipFile(r_path) as z:
            media_files = [f for f in z.namelist() if f.startswith('word/media/')]
            print(f"Media files found: {len(media_files)}")
            for f in media_files:
                print(f"  {f}")
    else:
        print("File not found!")

if __name__ == "__main__":
    main()
