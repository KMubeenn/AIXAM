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

    def _sanitize_for_pdf(self, text: str) -> str:
        """
        Replace unsupported Unicode characters with ASCII equivalents.
        FPDF2's built-in Helvetica font only supports Latin-1 (ISO 8859-1).
        Zero-width characters are valid latin-1 but have 0 glyph width, crashing FPDF.
        """
        replacements = {
            '\u2013': '-',    # en dash
            '\u2014': '--',   # em dash
            '\u2018': "'",    # left single quote
            '\u2019': "'",    # right single quote
            '\u201c': '"',    # left double quote
            '\u201d': '"',    # right double quote
            '\u2022': '*',    # bullet
            '\u2026': '...', # ellipsis
            '\u2192': '->',  # right arrow
            '\u2190': '<-',  # left arrow
            '\u2191': '^',   # up arrow
            '\u2193': 'v',   # down arrow
            '\u00b7': '*',   # middle dot
            '\u00a0': ' ',   # non-breaking space
            '\u2665': '<3',  # heart
            '\u2713': '[OK]',# checkmark
            '\u00d7': 'x',   # multiplication sign
            '\u00b0': 'deg', # degree sign
            '\u00b1': '+/-', # plus-minus
            # Zero-width characters — valid latin-1 but 0 glyph width → FPDF crash
            '\u200b': '',    # zero-width space
            '\u200c': '',    # zero-width non-joiner
            '\u200d': '',    # zero-width joiner
            '\u200e': '',    # left-to-right mark
            '\u200f': '',    # right-to-left mark
            '\ufeff': '',    # BOM / zero-width no-break space
            '\u00ad': '',    # soft hyphen
        }
        for char, replacement in replacements.items():
            text = text.replace(char, replacement)
        # Strip markdown bold/italic markers before rendering
        import re as _re
        text = _re.sub(r'\*{1,3}', '', text)   # remove *, **, ***
        text = _re.sub(r'_{1,2}', '', text)     # remove _, __
        text = _re.sub(r'`+', '', text)          # remove backticks
        # Final fallback: keep only printable latin-1 characters
        return ''.join(c if ord(c) < 256 and ord(c) >= 32 else '?' for c in text)

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
            line = self._sanitize_for_pdf(line.strip())
            if not line:
                pdf.ln(4)
                continue
            try:
                # Always reset cursor to left margin before any multi_cell
                pdf.set_x(pdf.l_margin)
                if line.startswith('### '):
                    pdf.set_font('Helvetica', 'B', 12)
                    pdf.multi_cell(0, 8, line[4:])
                    pdf.ln(1)
                elif line.startswith('## '):
                    pdf.set_font('Helvetica', 'B', 14)
                    pdf.multi_cell(0, 10, line[3:])
                    pdf.ln(2)
                elif line.startswith('# '):
                    pdf.set_font('Helvetica', 'B', 16)
                    pdf.multi_cell(0, 10, line[2:])
                    pdf.ln(3)
                elif line.startswith('- ') or line.startswith('* '):
                    pdf.set_font('Helvetica', '', 11)
                    pdf.multi_cell(0, 6, f"  * {line[2:]}")
                else:
                    pdf.set_font('Helvetica', '', 11)
                    pdf.multi_cell(0, 6, line)
            except Exception:
                # If a line still fails to render, skip it gracefully
                pdf.set_x(pdf.l_margin)
                pdf.set_font('Helvetica', '', 11)
                try:
                    # Last resort: render only pure ASCII
                    safe = ''.join(c if 32 <= ord(c) < 128 else '?' for c in line)
                    if safe.strip():
                        pdf.multi_cell(0, 6, safe)
                except Exception:
                    pdf.ln(6)  # skip and move to next line

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
