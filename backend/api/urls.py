from django.urls import path
from .views import ProfessionalsView, ProfessionalsBulkUpsertView, ResumeUploadView

urlpatterns = [
    path("professionals/", ProfessionalsView.as_view()),
    path("professionals", ProfessionalsView.as_view()),
    path("professionals/bulk", ProfessionalsBulkUpsertView.as_view()),
    path("professionals/<int:professional_id>/resume", ResumeUploadView.as_view()),
]
