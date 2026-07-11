from apps.core.models import Submission, StudentPerformance, Quiz
from django.contrib.auth import get_user_model
from apps.chat.services.utilities.TestTopicEvaluator import TestTopicEvaluator
import asyncio

def run():
    User = get_user_model()
    try:
        user = User.objects.get(email='hashirali12123@gmail.com')
    except User.DoesNotExist:
        print("User not found!")
        return
        
    StudentPerformance.objects.filter(student=user).delete()
    print("Deleted old performance records.")
    
    submissions = list(Submission.objects.filter(student=user).select_related('quiz').prefetch_related('quiz__questions').order_by('submitted_at'))
    print(f"Found {len(submissions)} submissions.")
    
    evaluator = TestTopicEvaluator()
    
    async def get_topic(questions_list, existing_topics):
        return await evaluator.evaluate_topic({"grades": questions_list}, existing_topics)

    for s in submissions:
        quiz = s.quiz
        if not quiz:
            continue
            
        clean_title = quiz.title.replace(" MCQ", "").replace(" MCQ Test", "").replace(" Mock Test", "").replace(" Test", "").replace(" Quiz", "").replace(" Practice", "").strip()
        
        if clean_title.lower() in ['', 'mcq', 'mcq test', 'test', 'uploaded material', 'mixed topics', 'general study', 'practice test', 'mcq practice', 'quiz']:
            questions = list(quiz.questions.all())
            questions_list = [{"question": q.text, "correct_answer": ""} for q in questions]
            
            perfs = list(StudentPerformance.objects.filter(student=user))
            existing_topics = [p.topic for p in perfs if p.topic]
            banned_existing = ['mixed topics', 'uploaded material', 'general study', 'general']
            existing_topics = [t for t in existing_topics if t.lower() not in banned_existing]
            
            print(f"Running LLM evaluation for quiz '{quiz.title}'...")
            topic = asyncio.run(get_topic(questions_list, existing_topics))
        else:
            topic = clean_title.title()
            
        perf, created = StudentPerformance.objects.get_or_create(
            student=user,
            topic=topic,
            defaults={'average_score': s.score, 'tests_taken': 1, 'strength_score': s.score}
        )
        if not created:
            total = perf.average_score * perf.tests_taken
            perf.tests_taken += 1
            perf.average_score = (total + s.score) / perf.tests_taken
            perf.strength_score = perf.average_score
            perf.save()
            
        print(f"Processed: '{quiz.title}' -> '{topic}' (Score: {s.score}%, Tests Taken: {perf.tests_taken})")
        
    from django.core.cache import cache
    cache.delete(f'student_insights_{user.id}')
    print("Insights cache cleared.")

run()
