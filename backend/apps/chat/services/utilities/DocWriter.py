import io
import re
import base64
from datetime import datetime

try:
    from docx import Document as DocxDocument
    from docx.shared import Pt,Inches
    DOCX_AVAILABLE=True
except ImportError:
    DOCX_AVAILABLE=False

try:
    from pptx import Presentation
    from pptx.util import Inches as PptxInches,Pt as PptxPt
    PPTX_AVAILABLE=True
except ImportError:
    PPTX_AVAILABLE=False

try:
    from fpdf import FPDF
    PDF_AVAILABLE=True
except ImportError:
    PDF_AVAILABLE=False


class DocumentWriter():

    def _generate_filename(self,title:str,ext:str)->str:
        safe_title=re.sub(r'[^\w\s-]','',title).strip().replace(' ','_')[:50]
        timestamp=datetime.now().strftime('%Y%m%d_%H%M%S')
        return f"{safe_title}_{timestamp}.{ext}"

    def write(self,title:str,content:str,format:str)->dict:
        """Generate a document and return it as a base64-encoded dict.

        Returns:
            dict with keys: filename, file_base64, mime_type
        """
        if format=='pdf':
            return self._write_pdf(title,content)
        elif format=='docx':
            return self._write_docx(title,content)
        elif format=='pptx':
            return self._write_pptx(title,content)
        else:
            raise ValueError(f"Unsupported format: {format}")

    def _write_pdf(self,title:str,content:str)->dict:
        if not PDF_AVAILABLE:
            raise ImportError("fpdf2 is required for PDF generation. Install with: pip install fpdf2")

        pdf=FPDF()
        pdf.set_auto_page_break(auto=True,margin=15)
        pdf.add_page()

        pdf.set_font('Helvetica','B',18)
        pdf.cell(0,12,title,new_x="LMARGIN",new_y="NEXT",align='C')
        pdf.ln(8)

        for line in content.split('\n'):
            line=line.strip()
            if not line:
                pdf.ln(4)
            elif line.startswith('## '):
                pdf.set_font('Helvetica','B',14)
                pdf.cell(0,10,line[3:],new_x="LMARGIN",new_y="NEXT")
                pdf.ln(2)
            elif line.startswith('# '):
                pdf.set_font('Helvetica','B',16)
                pdf.cell(0,10,line[2:],new_x="LMARGIN",new_y="NEXT")
                pdf.ln(3)
            elif line.startswith('- ') or line.startswith('* '):
                pdf.set_font('Helvetica','',11)
                pdf.cell(10)
                pdf.multi_cell(0,6,f"\u2022 {line[2:]}")
            else:
                pdf.set_font('Helvetica','',11)
                pdf.multi_cell(0,6,line)

        buffer=io.BytesIO()
        pdf.output(buffer)
        file_bytes=buffer.getvalue()
        buffer.close()

        return {
            'filename':self._generate_filename(title,'pdf'),
            'file_base64':base64.b64encode(file_bytes).decode('utf-8'),
            'mime_type':'application/pdf'
        }

    def _write_docx(self,title:str,content:str)->dict:
        if not DOCX_AVAILABLE:
            raise ImportError("python-docx is required for DOCX generation.")

        doc=DocxDocument()
        doc.add_heading(title,level=0)

        for line in content.split('\n'):
            line=line.strip()
            if not line:
                continue
            elif line.startswith('## '):
                doc.add_heading(line[3:],level=2)
            elif line.startswith('# '):
                doc.add_heading(line[2:],level=1)
            elif line.startswith('- ') or line.startswith('* '):
                doc.add_paragraph(line[2:],style='List Bullet')
            else:
                doc.add_paragraph(line)

        buffer=io.BytesIO()
        doc.save(buffer)
        file_bytes=buffer.getvalue()
        buffer.close()

        return {
            'filename':self._generate_filename(title,'docx'),
            'file_base64':base64.b64encode(file_bytes).decode('utf-8'),
            'mime_type':'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        }

    def _write_pptx(self,title:str,content:str)->dict:
        if not PPTX_AVAILABLE:
            raise ImportError("python-pptx is required for PPTX generation. Install with: pip install python-pptx")

        prs=Presentation()

        title_slide_layout=prs.slide_layouts[0]
        slide=prs.slides.add_slide(title_slide_layout)
        slide.shapes.title.text=title

        slides_content=content.split('\n# ')
        if slides_content[0].startswith('# '):
            slides_content[0]=slides_content[0][2:]

        for section in slides_content:
            if not section.strip():
                continue
            lines=section.strip().split('\n')
            slide_title=lines[0].strip().lstrip('# ')
            bullet_points=[l.strip().lstrip('-*').strip() for l in lines[1:] if l.strip()]

            bullet_layout=prs.slide_layouts[1]
            slide=prs.slides.add_slide(bullet_layout)
            slide.shapes.title.text=slide_title

            if bullet_points:
                body=slide.placeholders[1]
                tf=body.text_frame
                tf.text=bullet_points[0]
                for bp in bullet_points[1:]:
                    p=tf.add_paragraph()
                    p.text=bp

        buffer=io.BytesIO()
        prs.save(buffer)
        file_bytes=buffer.getvalue()
        buffer.close()

        return {
            'filename':self._generate_filename(title,'pptx'),
            'file_base64':base64.b64encode(file_bytes).decode('utf-8'),
            'mime_type':'application/vnd.openxmlformats-officedocument.presentationml.presentation'
        }
