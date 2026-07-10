import io
import re
import base64
try:
    import markdown
    MARKDOWN_AVAILABLE=True
except ImportError:
    MARKDOWN_AVAILABLE=False
from datetime import datetime

try:
    from docx import Document as DocxDocument
    from docx.shared import Pt
    DOCX_AVAILABLE=True
except ImportError:
    DOCX_AVAILABLE=False

try:
    from pptx import Presentation
    PPTX_AVAILABLE=True
except ImportError:
    PPTX_AVAILABLE=False

try:
    from fpdf import FPDF, HTMLMixin
    class HTMLFPDF(FPDF, HTMLMixin):
        pass
    PDF_AVAILABLE=True
except ImportError:
    # Fallback for older fpdf2 or different install
    try:
        from fpdf import FPDF
        PDF_AVAILABLE=True
    except ImportError:
        PDF_AVAILABLE=False


class DocumentWriter():

    def _generate_filename(self, title: str, ext: str) -> str:
        safe_title = re.sub(r'[^\w\s-]', '', title).strip().replace(' ', '_')[:50]
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        return f"{safe_title}_{timestamp}.{ext}"

    def write(self, title: str, content: str, format: str) -> dict:
        """Generate a document and return it as a base64-encoded dict."""
        if format == 'pdf':
            return self._write_pdf(title, content)
        elif format == 'docx':
            return self._write_docx(title, content)
        elif format == 'pptx':
            return self._write_pptx(title, content)
        else:
            raise ValueError(f"Unsupported format: {format}")

    def _write_pdf(self, title: str, content: str) -> dict:
        if not PDF_AVAILABLE:
            raise ImportError("fpdf2 is required for PDF generation.")

        # Use HTMLMixin if available for better formatting
        if 'HTMLMixin' in globals() or 'HTMLMixin' in locals() or hasattr(FPDF, 'write_html'):
            pdf = HTMLFPDF() if 'HTMLFPDF' in globals() else FPDF()
        else:
            pdf = FPDF()

        pdf.set_auto_page_break(auto=True, margin=15)
        pdf.add_page()
        
        # Title
        pdf.set_text_color(26, 55, 108)  # Primary Navy Blue (#1A376C)
        pdf.set_font('Helvetica', 'B', 20)
        pdf.cell(0, 15, title, ln=True, align='C')
        pdf.ln(10)
        pdf.set_text_color(28, 28, 30)  # Reset to Dark Charcoal (#1C1C1E)

        # Convert Markdown to HTML for fpdf2's write_html
        if MARKDOWN_AVAILABLE:
            html_content = markdown.markdown(content)
        else:
            html_content = content.replace('\n', '<br>')

        # Override default fpdf2 heading colors (which default to red) using font color tag overrides
        html_content = html_content.replace('<h1>', '<h1><font color="#1A376C">')
        html_content = html_content.replace('</h1>', '</font></h1>')
        html_content = html_content.replace('<h2>', '<h2><font color="#2E86C1">')
        html_content = html_content.replace('</h2>', '</font></h2>')
        html_content = html_content.replace('<h3>', '<h3><font color="#2E86C1">')
        html_content = html_content.replace('</h3>', '</font></h3>')
        
        # Basic CSS-like styling for write_html
        full_html = f"""
        <div style="font-family: Helvetica; font-size: 11pt; color: #1C1C1E; line-height: 1.5;">
            {html_content}
        </div>
        """
        
        try:
            pdf.write_html(full_html)
        except Exception as e:
            # Fallback to plain text if HTML rendering fails
            pdf.set_font('Helvetica', '', 11)
            for line in content.split('\n'):
                pdf.multi_cell(0, 6, line)

        buffer = io.BytesIO()
        pdf.output(buffer)
        file_bytes = buffer.getvalue()
        buffer.close()

        return {
            'filename': self._generate_filename(title, 'pdf'),
            'file_base64': base64.b64encode(file_bytes).decode('utf-8'),
            'mime_type': 'application/pdf'
        }

    def _write_docx(self, title: str, content: str) -> dict:
        if not DOCX_AVAILABLE:
            raise ImportError("python-docx is required for DOCX generation.")

        doc = DocxDocument()
        doc.add_heading(title, level=0)

        for line in content.split('\n'):
            line = line.strip()
            if not line:
                continue
            
            if line.startswith('### '):
                doc.add_heading(line[4:], level=3)
            elif line.startswith('## '):
                doc.add_heading(line[3:], level=2)
            elif line.startswith('# '):
                doc.add_heading(line[2:], level=1)
            elif line.startswith('- ') or line.startswith('* '):
                p = doc.add_paragraph(style='List Bullet')
                self._add_formatted_text(p, line[2:])
            else:
                p = doc.add_paragraph()
                self._add_formatted_text(p, line)

        buffer = io.BytesIO()
        doc.save(buffer)
        file_bytes = buffer.getvalue()
        buffer.close()

        return {
            'filename': self._generate_filename(title, 'docx'),
            'file_base64': base64.b64encode(file_bytes).decode('utf-8'),
            'mime_type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        }

    def _add_formatted_text(self, paragraph, text):
        """Helper to parse basic markdown (**bold**, *italic*) and add to a docx paragraph."""
        # Split by bold and italic markers
        parts = re.split(r'(\*\*.*?\*\*|\*.*?\*)', text)
        for part in parts:
            if part.startswith('**') and part.endswith('**'):
                paragraph.add_run(part[2:-2]).bold = True
            elif part.startswith('*') and part.endswith('*'):
                paragraph.add_run(part[1:-1]).italic = True
            else:
                paragraph.add_run(part)

    def _add_pptx_formatted_runs(self, paragraph, text: str, font_size, color):
        """Parse **bold** markdown and add correctly formatted runs to a pptx paragraph."""
        from pptx.util import Pt
        parts = re.split(r'(\*\*.*?\*\*)', text)
        for part in parts:
            if not part:
                continue
            run = paragraph.add_run()
            if part.startswith('**') and part.endswith('**'):
                run.text = part[2:-2]
                run.font.bold = True
            else:
                run.text = part
                run.font.bold = False
            run.font.size = font_size
            run.font.color.rgb = color

    def _write_pptx(self, title: str, content: str) -> dict:
        if not PPTX_AVAILABLE:
            raise ImportError("python-pptx is required for PPTX generation.")

        from pptx.util import Inches, Pt
        from pptx.dml.color import RGBColor

        # ── Color Palette ──────────────────────────────────────────────────────
        COLOR_PRIMARY = RGBColor(0x1A, 0x37, 0x6C)  # Deep navy blue
        COLOR_ACCENT  = RGBColor(0x2E, 0x86, 0xC1)  # Bright blue
        COLOR_WHITE   = RGBColor(0xFF, 0xFF, 0xFF)
        COLOR_DARK    = RGBColor(0x1C, 0x1C, 0x1E)
        COLOR_MUTED   = RGBColor(0xAA, 0xAA, 0xAA)

        prs = Presentation()
        slide_w = prs.slide_width
        slide_h = prs.slide_height

        # ── Title Slide ────────────────────────────────────────────────────────
        blank_layout = prs.slide_layouts[6]  # fully blank layout for manual control
        slide = prs.slides.add_slide(blank_layout)

        # Full dark background
        bg = slide.shapes.add_shape(1, 0, 0, slide_w, slide_h)
        bg.fill.solid()
        bg.fill.fore_color.rgb = COLOR_PRIMARY
        bg.line.color.rgb = COLOR_PRIMARY

        # Bottom accent strip
        accent_h = int(slide_h * 0.14)
        accent = slide.shapes.add_shape(1, 0, slide_h - accent_h, slide_w, accent_h)
        accent.fill.solid()
        accent.fill.fore_color.rgb = COLOR_ACCENT
        accent.line.color.rgb = COLOR_ACCENT

        # Title text box centered
        tx = slide.shapes.add_textbox(Inches(0.8), Inches(1.4), slide_w - Inches(1.6), Inches(3.0))
        tf = tx.text_frame
        tf.word_wrap = True
        p = tf.paragraphs[0]
        run = p.add_run()
        run.text = title
        run.font.bold = True
        run.font.size = Pt(40)
        run.font.color.rgb = COLOR_WHITE

        # ── Content Slides ─────────────────────────────────────────────────────
        sections = content.split('\n# ')

        # Fallback: plain text with no markdown headers → split by double newlines
        if len(sections) == 1:
            sections = [s.strip() for s in content.split('\n\n') if s.strip()]

        for idx, section in enumerate(sections):
            if not section.strip():
                continue

            # Strip leading # if first section happened to start with it
            if idx == 0 and section.startswith('# '):
                section = section[2:]

            lines = section.strip().split('\n')
            slide_title = lines[0].strip().lstrip('#- ').strip()
            body_lines  = [l for l in lines[1:] if l.strip()]

            # Skip creating a slide if there is no body content/bullets under the title
            if not body_lines:
                continue

            slide = prs.slides.add_slide(blank_layout)

            # White background
            bg = slide.shapes.add_shape(1, 0, 0, slide_w, slide_h)
            bg.fill.solid()
            bg.fill.fore_color.rgb = COLOR_WHITE
            bg.line.color.rgb = COLOR_WHITE

            # Top header accent bar
            bar_h = int(slide_h * 0.155)
            bar = slide.shapes.add_shape(1, 0, 0, slide_w, bar_h)
            bar.fill.solid()
            bar.fill.fore_color.rgb = COLOR_PRIMARY
            bar.line.color.rgb = COLOR_PRIMARY

            # Slide number (bottom right)
            num_box = slide.shapes.add_textbox(
                slide_w - Inches(1.3), slide_h - Inches(0.45), Inches(1.0), Inches(0.3)
            )
            num_p = num_box.text_frame.paragraphs[0]
            num_run = num_p.add_run()
            num_run.text = str(idx + 1)
            num_run.font.size = Pt(10)
            num_run.font.color.rgb = COLOR_MUTED

            # Slide title inside header bar
            title_box = slide.shapes.add_textbox(
                Inches(0.4), Inches(0.1), slide_w - Inches(0.8), int(bar_h * 0.85)
            )
            title_tf = title_box.text_frame
            title_p  = title_tf.paragraphs[0]
            title_run = title_p.add_run()
            title_run.text = slide_title
            title_run.font.bold  = True
            title_run.font.size  = Pt(28)
            title_run.font.color.rgb = COLOR_WHITE

            # Body text box below header
            body_top = bar_h + int(Inches(0.2))
            body_box = slide.shapes.add_textbox(
                Inches(0.5), body_top, slide_w - Inches(1.0), slide_h - body_top - Inches(0.5)
            )
            body_tf = body_box.text_frame
            body_tf.word_wrap = True

            first_line = True
            for line in body_lines:
                raw = line.strip()
                if not raw:
                    continue

                is_bullet = raw.startswith(('-', '*', '•'))
                clean = raw.lstrip('-*• ').strip()
                if not clean:
                    continue

                if first_line:
                    p = body_tf.paragraphs[0]
                    first_line = False
                else:
                    p = body_tf.add_paragraph()

                p.space_after = Pt(10)

                if is_bullet:
                    # Colored bullet marker + formatted text
                    bullet_run = p.add_run()
                    bullet_run.text = "• "
                    bullet_run.font.bold  = True
                    bullet_run.font.size  = Pt(18)
                    bullet_run.font.color.rgb = COLOR_ACCENT
                    self._add_pptx_formatted_runs(p, clean, Pt(18), COLOR_DARK)
                else:
                    self._add_pptx_formatted_runs(p, clean, Pt(18), COLOR_DARK)

        buffer = io.BytesIO()
        prs.save(buffer)
        file_bytes = buffer.getvalue()
        buffer.close()

        return {
            'filename': self._generate_filename(title, 'pptx'),
            'file_base64': base64.b64encode(file_bytes).decode('utf-8'),
            'mime_type': 'application/vnd.openxmlformats-officedocument.presentationml.presentation'
        }

