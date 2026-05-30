"""
ReportGenerator.py — Generates a PDF class performance report from batch grading data.
Returns the report as a base64-encoded string (no disk writes).
"""
import io
import base64
from datetime import datetime


def generate_class_report_pdf(assignment_title: str, grades_data: dict) -> dict:
    """
    Generate a PDF class performance report from batch grading results.

    Args:
        assignment_title: Title of the graded assignment.
        grades_data: Dict matching BatchGradingResult schema:
            {
                "grades": [
                    {"student_name": str, "marks": float, "max_marks": float, "feedback": str, ...}
                ],
                "total_marks": float,
                "max_total_marks": float,
                "overall_feedback": str,
                "class_average": float
            }

    Returns:
        {
            "filename": str,
            "mime_type": "application/pdf",
            "file_base64": str (base64-encoded PDF bytes)
        }
    """
    try:
        from reportlab.lib.pagesizes import A4
        from reportlab.lib import colors
        from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
        from reportlab.lib.units import cm
        from reportlab.platypus import (
            SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable
        )
    except ImportError:
        raise ImportError("reportlab is required for PDF generation. Install it with: pip install reportlab")

    grades = grades_data.get('grades', [])
    class_average = grades_data.get('class_average', 0.0)
    overall_feedback = grades_data.get('overall_feedback', '')
    max_total = grades_data.get('max_total_marks', 100.0)

    # ── Score distribution buckets ──────────────────────────────────────────
    buckets = {'Excellent (≥90%)': 0, 'Good (75–89%)': 0, 'Average (50–74%)': 0, 'Below Average (<50%)': 0}
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
            buckets['Excellent (≥90%)'] += 1
        elif pct >= 75:
            buckets['Good (75–89%)'] += 1
        elif pct >= 50:
            buckets['Average (50–74%)'] += 1
        else:
            buckets['Below Average (<50%)'] += 1

    # Sort: lowest scorers first (for flagging struggling students)
    student_pcts.sort(key=lambda x: x[2])
    struggling = [name for name, _, pct, _ in student_pcts if pct < 50]

    # ── Build PDF ────────────────────────────────────────────────────────────
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=A4,
        rightMargin=2*cm, leftMargin=2*cm,
        topMargin=2*cm, bottomMargin=2*cm
    )

    styles = getSampleStyleSheet()
    title_style = ParagraphStyle('Title', parent=styles['Title'], fontSize=18, spaceAfter=6, textColor=colors.HexColor('#1e293b'))
    h2_style = ParagraphStyle('H2', parent=styles['Heading2'], fontSize=13, spaceBefore=16, spaceAfter=6, textColor=colors.HexColor('#4338ca'))
    normal = styles['Normal']
    small = ParagraphStyle('Small', parent=normal, fontSize=9, textColor=colors.HexColor('#64748b'))

    story = []

    # Header
    story.append(Paragraph(f"Class Performance Report", title_style))
    story.append(Paragraph(f"Assignment: <b>{assignment_title}</b>", normal))
    story.append(Paragraph(f"Generated: {datetime.now().strftime('%B %d, %Y at %H:%M')}", small))
    story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor('#e2e8f0'), spaceAfter=12))

    # Summary stats
    story.append(Paragraph("Summary Statistics", h2_style))
    summary_data = [
        ['Metric', 'Value'],
        ['Total Students Graded', str(len(student_summaries))],
        ['Class Average', f"{round(class_average, 1)}%"],
        ['Max Marks per Assignment', str(max_total)],
        ['Struggling Students (<50%)', str(len(struggling))],
    ]
    summary_table = Table(summary_data, colWidths=[10*cm, 6*cm])
    summary_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#4338ca')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 10),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.HexColor('#f8fafc'), colors.white]),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#e2e8f0')),
        ('PADDING', (0, 0), (-1, -1), 8),
    ]))
    story.append(summary_table)
    story.append(Spacer(1, 12))

    # Score distribution
    story.append(Paragraph("Score Distribution", h2_style))
    dist_data = [['Performance Band', 'Number of Students']] + [[band, str(count)] for band, count in buckets.items()]
    dist_table = Table(dist_data, colWidths=[10*cm, 6*cm])
    dist_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#0f172a')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 10),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.HexColor('#f0fdf4'), colors.white]),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#e2e8f0')),
        ('PADDING', (0, 0), (-1, -1), 8),
    ]))
    story.append(dist_table)
    story.append(Spacer(1, 12))

    # Per-student breakdown
    story.append(Paragraph("Student Score Breakdown", h2_style))
    student_data = [['Student Name', 'Total Marks', 'Score %', 'Status']]
    for name, total, pct, _ in sorted(student_pcts, key=lambda x: -x[2]):
        status = '✓ Pass' if pct >= 50 else '✗ Fail'
        student_data.append([name, f"{round(total, 1)}/{max_total}", f"{round(pct, 1)}%", status])

    student_table = Table(student_data, colWidths=[6*cm, 4*cm, 3*cm, 3*cm])
    student_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#1e293b')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 9),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.HexColor('#f8fafc'), colors.white]),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#e2e8f0')),
        ('PADDING', (0, 0), (-1, -1), 7),
    ]))
    story.append(student_table)
    story.append(Spacer(1, 12))

    # Struggling students
    if struggling:
        story.append(Paragraph("⚠ Students Requiring Attention (<50%)", h2_style))
        for name in struggling:
            story.append(Paragraph(f"• {name}", normal))
        story.append(Spacer(1, 8))

    # Overall feedback
    if overall_feedback:
        story.append(Paragraph("Overall Class Feedback", h2_style))
        story.append(Paragraph(overall_feedback, normal))

    doc.build(story)
    buffer.seek(0)
    pdf_bytes = buffer.read()
    b64 = base64.b64encode(pdf_bytes).decode('utf-8')

    safe_title = "".join(c if c.isalnum() or c in (' ', '-') else '_' for c in assignment_title)
    filename = f"Class_Report_{safe_title.replace(' ', '_')}.pdf"

    return {
        "filename": filename,
        "mime_type": "application/pdf",
        "file_base64": b64,
    }
