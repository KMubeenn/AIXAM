"""
ReportGenerator.py — Generates a PDF class performance report from batch grading data.
Returns the report as a base64-encoded string (no disk writes).
"""
import io
import base64
from datetime import datetime
from fpdf import FPDF

class PDFReport(FPDF):
    def header(self):
        self.set_font('Helvetica', 'B', 18)
        self.set_text_color(0, 0, 0) # Black
        self.cell(0, 10, 'Class Performance Report', 0, 1, 'L')
        self.ln(5)

    def chapter_title(self, title):
        self.set_font('Helvetica', 'B', 14)
        self.set_text_color(0, 0, 0) # Black
        self.cell(0, 10, title, 0, 1, 'L')
        self.ln(2)

def generate_class_report_pdf(assignment_title: str, grades_data: dict) -> dict:
    grades = grades_data.get('grades', [])
    class_average = grades_data.get('class_average', 0.0)
    overall_feedback = grades_data.get('overall_feedback', '')
    max_total = grades_data.get('max_total_marks', 100.0)

    # ── Score distribution buckets ──────────────────────────────────────────
    buckets = {'Excellent (>=90%)': 0, 'Good (75-89%)': 0, 'Average (50-74%)': 0, 'Below Average (<50%)': 0}
    student_summaries = {}
    for g in grades:
        name = g.get('student_name', 'Unknown')
        marks = g.get('marks', 0)
        max_m = g.get('max_marks', 1)
        pct = (marks / max_m * 100) if max_m > 0 else 0
        if name not in student_summaries:
            student_summaries[name] = {'total': 0, 'pct': 0, 'feedback': g.get('feedback', '')}
        student_summaries[name]['total'] += marks

    student_pcts = []
    for name, info in student_summaries.items():
        pct = (info['total'] / max_total * 100) if max_total > 0 else 0
        info['pct'] = round(pct, 1)
        student_pcts.append((name, info['total'], pct, info['feedback']))
        if pct >= 90:
            buckets['Excellent (>=90%)'] += 1
        elif pct >= 75:
            buckets['Good (75-89%)'] += 1
        elif pct >= 50:
            buckets['Average (50-74%)'] += 1
        else:
            buckets['Below Average (<50%)'] += 1

    student_pcts.sort(key=lambda x: x[2])
    struggling = [name for name, _, pct, _ in student_pcts if pct < 50]

    # ── Build PDF ────────────────────────────────────────────────────────────
    pdf = PDFReport()
    pdf.add_page()
    
    # Subheader
    pdf.set_font('Helvetica', '', 11)
    pdf.set_text_color(100, 116, 139)
    pdf.cell(0, 8, f"Assignment: {assignment_title}", 0, 1, 'L')
    pdf.cell(0, 8, f"Generated: {datetime.now().strftime('%B %d, %Y at %H:%M')}", 0, 1, 'L')
    pdf.ln(5)

    # Summary Stats
    pdf.chapter_title("Summary Statistics")
    pdf.set_font('Helvetica', '', 10)
    pdf.set_text_color(0, 0, 0)
    pdf.cell(80, 8, 'Total Students Graded:', 0, 0)
    pdf.cell(0, 8, str(len(student_summaries)), 0, 1)
    pdf.cell(80, 8, 'Class Average:', 0, 0)
    pdf.cell(0, 8, f"{round(class_average, 1)}%", 0, 1)
    pdf.cell(80, 8, 'Max Marks per Assignment:', 0, 0)
    pdf.cell(0, 8, str(max_total), 0, 1)
    pdf.cell(80, 8, 'Struggling Students (<50%):', 0, 0)
    pdf.cell(0, 8, str(len(struggling)), 0, 1)
    pdf.ln(5)

    # Score Distribution
    pdf.chapter_title("Score Distribution")
    for band, count in buckets.items():
        pdf.cell(80, 8, band, 0, 0)
        pdf.cell(0, 8, str(count), 0, 1)
    pdf.ln(5)

    # Per-student breakdown
    pdf.chapter_title("Student Score Breakdown")
    pdf.set_font('Helvetica', 'B', 10)
    pdf.cell(70, 8, 'Student Name', border=1)
    pdf.cell(30, 8, 'Marks', border=1)
    pdf.cell(30, 8, 'Score %', border=1)
    pdf.cell(40, 8, 'Status', border=1, ln=1)
    
    pdf.set_font('Helvetica', '', 10)
    for name, total, pct, _ in sorted(student_pcts, key=lambda x: -x[2]):
        status = 'Pass' if pct >= 50 else 'Fail'
        pdf.cell(70, 8, str(name)[:30], border=1)
        pdf.cell(30, 8, f"{round(total, 1)}/{max_total}", border=1)
        pdf.cell(30, 8, f"{round(pct, 1)}%", border=1)
        pdf.cell(40, 8, status, border=1, ln=1)
    pdf.ln(5)

    # Struggling students
    if struggling:
        pdf.chapter_title("Students Requiring Attention (<50%)")
        pdf.set_font('Helvetica', '', 10)
        for name in struggling:
            pdf.cell(0, 8, f"- {name}", 0, 1)
        pdf.ln(5)

    # Overall feedback
    if overall_feedback:
        pdf.chapter_title("Overall Class Feedback")
        pdf.set_font('Helvetica', '', 10)
        pdf.multi_cell(0, 8, str(overall_feedback))

    pdf_bytes = pdf.output(dest='S')
    b64 = base64.b64encode(pdf_bytes).decode('utf-8')

    safe_title = "".join(c if c.isalnum() or c in (' ', '-') else '_' for c in assignment_title)
    filename = f"Class_Report_{safe_title.replace(' ', '_')}.pdf"

    return {
        "filename": filename,
        "mime_type": "application/pdf",
        "file_base64": b64,
    }
