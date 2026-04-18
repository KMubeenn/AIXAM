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
    def post_assignment(user: User, course_id: str, title: str, description: str, max_points: float = 100):
        try:
            service = ClassroomService.get_service(user)
            coursework = {
                'title': title,
                'description': description,
                'maxPoints': max_points,
                'workType': 'ASSIGNMENT',
                'state': 'PUBLISHED'
            }
            # Optional: Add deadline logic here into coursework['dueDate'] & coursework['dueTime'] if needed
            
            coursework = service.courses().courseWork().create(
                courseId=course_id, body=coursework).execute()
                
            return {
                "id": coursework.get("id"),
                "title": coursework.get("title"),
                "alternateLink": coursework.get("alternateLink")
            }
        except Exception as e:
            raise ClassroomServiceError(f"Failed to post assignment: {str(e)}")

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
    def get_submissions(user: User, course_id: str, coursework_id: str):
        try:
            service = ClassroomService.get_service(user)
            # 1. Fetch all student submissions
            results = service.courses().courseWork().studentSubmissions().list(
                courseId=course_id, courseWorkId=coursework_id).execute()
            submissions = results.get('studentSubmissions', [])
            
            # 2. Fetch student profiles to attach names
            students_result = service.courses().students().list(courseId=course_id).execute()
            students = {s['userId']: s['profile']['name']['fullName'] for s in students_result.get('students', [])}
            
            parsed_submissions = []
            for sub in submissions:
                # Submissions can have attachments (Google Docs, Links, Drive Files). 
                # This grabs the submission IDs and current grading states.
                parsed_submissions.append({
                    "id": sub.get("id"),
                    "userId": sub.get("userId"),
                    "studentName": students.get(sub.get("userId"), "Unknown Student"),
                    "state": sub.get("state"),
                    "assignedGrade": sub.get("assignedGrade"),
                })
            return parsed_submissions
        except Exception as e:
            raise ClassroomServiceError(f"Failed to get submissions: {str(e)}")
