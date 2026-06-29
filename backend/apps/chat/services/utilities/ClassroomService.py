import os
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build
from google.auth.transport.requests import Request
from apps.users.models import User

# IMPORTANT SCOPES required for Classroom Integration:
# 'https://www.googleapis.com/auth/classroom.courses.readonly'
# 'https://www.googleapis.com/auth/classroom.coursework.students'
# 'https://www.googleapis.com/auth/classroom.announcements'

class ClassroomServiceError(Exception):
    pass

class ClassroomService:
    @staticmethod
    def get_credentials(user: User):
        if not user.google_access_token or not user.google_refresh_token:
            raise ClassroomServiceError("User has not authorized Google Classroom")
            
        creds = Credentials(
            token=user.google_access_token,
            refresh_token=user.google_refresh_token,
            token_uri="https://oauth2.googleapis.com/token",
            client_id=os.environ.get("GOOGLE_CLIENT_ID"),
            client_secret=os.environ.get("GOOGLE_CLIENT_SECRET"),
        )
        
        # Check expiry and refresh if needed
        if creds.expired and creds.refresh_token:
            try:
                creds.refresh(Request())
                # Update user with new token
                user.google_access_token = creds.token
                user.save(update_fields=['google_access_token'])
            except Exception as e:
                raise ClassroomServiceError(f"Failed to refresh Google token: {str(e)}")
                
        return creds

    @staticmethod
    def get_service(user: User):
        creds = ClassroomService.get_credentials(user)
        return build('classroom', 'v1', credentials=creds)

    @staticmethod
    def list_courses(user: User):
        try:
            service = ClassroomService.get_service(user)
            results = service.courses().list(teacherId='me').execute()
            courses = results.get('courses', [])
            return [{"id": course.get("id"), "name": course.get("name"), "description": course.get("descriptionHeading")} for course in courses]
        except Exception as e:
            raise ClassroomServiceError(f"Failed to list courses: {str(e)}")

    @staticmethod
    def list_coursework(user: User, course_id: str):
        try:
            service = ClassroomService.get_service(user)
            results = service.courses().courseWork().list(courseId=course_id).execute()
            coursework = results.get('courseWork', [])
            return [{"id": cw.get("id"), "title": cw.get("title"), "maxPoints": cw.get("maxPoints")} for cw in coursework]
        except Exception as e:
            raise ClassroomServiceError(f"Failed to list coursework: {str(e)}")

    @staticmethod
    def post_assignment(user: User, course_id: str, title: str, description: str, max_points: float = 100, due_date_str: str = None, due_time_str: str = None):
        try:
            service = ClassroomService.get_service(user)
            coursework = {
                'title': title,
                'description': description,
                'maxPoints': max_points,
                'workType': 'ASSIGNMENT',
                'state': 'PUBLISHED'
            }
            
            if due_date_str:
                # Expects 'YYYY-MM-DD'
                parts = due_date_str.split('-')
                if len(parts) == 3:
                    coursework['dueDate'] = {
                        'year': int(parts[0]),
                        'month': int(parts[1]),
                        'day': int(parts[2])
                    }
                    # Default time to 23:59:59 if no time provided
                    if due_time_str:
                        time_parts = due_time_str.split(':')
                        coursework['dueTime'] = {
                            'hours': int(time_parts[0]),
                            'minutes': int(time_parts[1]),
                            'seconds': int(time_parts[2]) if len(time_parts) > 2 else 0
                        }
                    else:
                        coursework['dueTime'] = {'hours': 23, 'minutes': 59, 'seconds': 59}

            coursework = service.courses().courseWork().create(
                courseId=course_id, body=coursework).execute()
                
            return {
                "id": coursework.get("id"),
                "title": coursework.get("title"),
                "alternateLink": coursework.get("alternateLink")
            }
        except Exception as e:
            error_msg = str(e)
            import re
            match = re.search(r'returned "(.*?)"', error_msg)
            if match:
                clean_msg = match.group(1)
                raise ClassroomServiceError(f"Classroom API Error: {clean_msg}")
            raise ClassroomServiceError(f"Failed to post assignment: {error_msg}")

    @staticmethod
    def post_announcement(user: User, course_id: str, text: str):
        try:
            service = ClassroomService.get_service(user)
            announcement = {
                'text': text,
                'state': 'PUBLISHED'
            }
            result = service.courses().announcements().create(
                courseId=course_id, body=announcement).execute()
            return {"id": result.get("id")}
        except Exception as e:
            raise ClassroomServiceError(f"Failed to post announcement: {str(e)}")

    @staticmethod
    def upload_file_to_drive(user: User, filename: str, file_bytes: bytes, mime_type: str) -> dict:
        """
        Upload a file to the teacher's Google Drive using the drive.file scope.
        Returns the Drive file ID and a shareable URL.
        """
        try:
            from googleapiclient.discovery import build
            from googleapiclient.http import MediaIoBaseUpload
            import io

            creds = ClassroomService.get_credentials(user)
            drive_service = build('drive', 'v3', credentials=creds)

            file_metadata = {'name': filename}
            media = MediaIoBaseUpload(
                io.BytesIO(file_bytes),
                mimetype=mime_type,
                resumable=True
            )
            drive_file = drive_service.files().create(
                body=file_metadata,
                media_body=media,
                fields='id, webViewLink'
            ).execute()

            # Make the file readable by anyone with the link (so Classroom can display it)
            drive_service.permissions().create(
                fileId=drive_file['id'],
                body={'type': 'anyone', 'role': 'reader'},
            ).execute()

            return {
                "drive_file_id": drive_file.get("id"),
                "drive_file_url": drive_file.get("webViewLink"),
                "filename": filename,
            }
        except Exception as e:
            raise ClassroomServiceError(f"Failed to upload file to Drive: {str(e)}")

    @staticmethod
    def create_assignment_with_drive_attachment(
        user: User,
        course_id: str,
        title: str,
        description: str,
        max_points: float,
        drive_file_id: str,
        drive_file_title: str,
    ) -> dict:
        """
        Create a Google Classroom assignment with a Drive file attached as material.
        The file must already be uploaded to Drive (use upload_file_to_drive first).
        """
        try:
            service = ClassroomService.get_service(user)
            coursework = {
                'title': title,
                'description': description,
                'maxPoints': max_points,
                'workType': 'ASSIGNMENT',
                'state': 'PUBLISHED',
                'materials': [
                    {
                        'driveFile': {
                            'driveFile': {
                                'id': drive_file_id,
                                'title': drive_file_title,
                            },
                            'shareMode': 'VIEW',
                        }
                    }
                ],
            }
            result = service.courses().courseWork().create(
                courseId=course_id, body=coursework
            ).execute()
            return {
                "id": result.get("id"),
                "title": result.get("title"),
                "alternateLink": result.get("alternateLink"),
            }
        except Exception as e:
            raise ClassroomServiceError(f"Failed to create assignment with attachment: {str(e)}")

    @staticmethod
    def get_submissions(user: User, course_id: str, coursework_id: str):
        try:
            service = ClassroomService.get_service(user)
            results = service.courses().courseWork().studentSubmissions().list(
                courseId=course_id, courseWorkId=coursework_id).execute()
            submissions = results.get('studentSubmissions', [])

            students_result = service.courses().students().list(courseId=course_id).execute()
            students = {s['userId']: s['profile']['name']['fullName'] for s in students_result.get('students', [])}

            parsed_submissions = []
            for sub in submissions:
                parsed_submissions.append({
                    "id": sub.get("id"),
                    "userId": sub.get("userId"),
                    "studentName": students.get(sub.get("userId"), "Unknown Student"),
                    "state": sub.get("state"),
                    "assignedGrade": sub.get("assignedGrade"),
                    "hasAttachments": bool(sub.get("assignmentSubmission", {}).get("attachments")),
                })
            return parsed_submissions
        except Exception as e:
            raise ClassroomServiceError(f"Failed to get submissions: {str(e)}")

    @staticmethod
    def fetch_submission_content(user: User, course_id: str, coursework_id: str, submission_id: str) -> str:
        """
        Fetch and extract readable text content from a single student submission.
        Supports Google Docs (exported as plain text) and Drive files (PDF/DOCX exported as plain text).
        Returns a concatenated plain-text string of all attachments.
        Requires scopes:
          - https://www.googleapis.com/auth/drive.readonly
          - https://www.googleapis.com/auth/classroom.student-submissions.students.readonly
        """
        try:
            from googleapiclient.discovery import build
            from googleapiclient.http import MediaIoBaseDownload
            import io

            creds = ClassroomService.get_credentials(user)
            classroom_service = build('classroom', 'v1', credentials=creds)
            drive_service = build('drive', 'v3', credentials=creds)

            result = classroom_service.courses().courseWork().studentSubmissions().get(
                courseId=course_id,
                courseWorkId=coursework_id,
                id=submission_id
            ).execute()

            attachments = result.get('assignmentSubmission', {}).get('attachments', [])
            if not attachments:
                return "[No attachments found in this submission]"

            extracted_parts = []
            for attachment in attachments:
                try:
                    if 'driveFile' in attachment:
                        file_id = attachment['driveFile']['id']
                        file_meta = drive_service.files().get(
                            fileId=file_id, 
                            fields='mimeType,name',
                            supportsAllDrives=True
                        ).execute()
                        mime = file_meta.get('mimeType', '')
                        name = file_meta.get('name', 'file')

                        if mime in ['application/vnd.google-apps.document', 'application/vnd.google-apps.presentation']:
                            # Export Google Doc / Slide as plain text
                            response = drive_service.files().export(
                                fileId=file_id, mimeType='text/plain'
                            ).execute()
                            text = response.decode('utf-8') if isinstance(response, bytes) else str(response)
                        else:
                            # Download PDF/DOCX and extract text
                            request = drive_service.files().get_media(fileId=file_id)
                            buffer = io.BytesIO()
                            downloader = MediaIoBaseDownload(buffer, request)
                            done = False
                            while not done:
                                _, done = downloader.next_chunk()
                            buffer.seek(0)

                            if 'pdf' in mime:
                                try:
                                    import pdfplumber
                                    with pdfplumber.open(buffer) as pdf:
                                        text = '\n'.join(page.extract_text() or '' for page in pdf.pages)
                                except Exception:
                                    text = f"[Could not extract text from PDF: {name}]"
                            elif 'wordprocessingml' in mime or 'docx' in mime:
                                try:
                                    from docx import Document
                                    doc = Document(buffer)
                                    text = '\n'.join(p.text for p in doc.paragraphs)
                                except Exception:
                                    text = f"[Could not extract text from DOCX: {name}]"
                            elif 'presentationml' in mime or 'pptx' in mime:
                                try:
                                    from pptx import Presentation
                                    prs = Presentation(buffer)
                                    text_parts = []
                                    for slide in prs.slides:
                                        for shape in slide.shapes:
                                            if hasattr(shape, "text"):
                                                text_parts.append(shape.text)
                                    text = '\n'.join(text_parts)
                                except Exception:
                                    text = f"[Could not extract text from PPTX: {name}]"
                            else:
                                text = f"[Unsupported file type: {mime} — {name}]"

                        extracted_parts.append(f"--- Attachment: {name} ---\n{text.strip()}")

                    elif 'link' in attachment:
                        extracted_parts.append(f"[Link submission: {attachment['link'].get('url', 'unknown')}]")

                except Exception as attach_err:
                    extracted_parts.append(f"[Error reading attachment: {attach_err}]")

            return "\n\n".join(extracted_parts)

        except Exception as e:
            raise ClassroomServiceError(f"Failed to fetch submission content: {str(e)}")

    @staticmethod
    def patch_grade(user: User, course_id: str, coursework_id: str, submission_id: str, assigned_grade: float, draft_grade: float = None):
        """
        Push a grade back to Google Classroom for a specific student submission.
        Sets both assignedGrade (released to student) and optionally draftGrade.
        Requires scope:
          - https://www.googleapis.com/auth/classroom.grades
        """
        try:
            service = ClassroomService.get_service(user)

            body = {'assignedGrade': assigned_grade}
            if draft_grade is not None:
                body['draftGrade'] = draft_grade

            # updateMask specifies which fields to update
            update_mask = 'assignedGrade'
            if draft_grade is not None:
                update_mask += ',draftGrade'

            result = service.courses().courseWork().studentSubmissions().patch(
                courseId=course_id,
                courseWorkId=coursework_id,
                id=submission_id,
                updateMask=update_mask,
                body=body
            ).execute()

            return {
                "submission_id": result.get("id"),
                "assignedGrade": result.get("assignedGrade"),
                "draftGrade": result.get("draftGrade"),
                "state": result.get("state"),
            }
        except Exception as e:
            raise ClassroomServiceError(f"Failed to patch grade: {str(e)}")
