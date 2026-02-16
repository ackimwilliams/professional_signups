from django.db import models


RESUME_SUMMARY_LENGTH = 40 # no words

class Professional(models.Model):
    class Source(models.TextChoices):
        DIRECT = "direct", "direct"
        PARTNER = "partner", "partner"
        INTERNAL = "internal", "internal"

    full_name = models.CharField(max_length=255)
    email = models.EmailField(unique=True, null=True, blank=True)
    phone = models.CharField(max_length=32, unique=True, null=True, blank=True)

    company_name = models.CharField(max_length=255, blank=True, default="")
    job_title = models.CharField(max_length=255, blank=True, default="")

    source = models.CharField(max_length=16, choices=Source.choices)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self) -> str:
        return f"{self.full_name} ({self.email or self.phone or 'no-email'})"


def resume_upload_path(instance: "ResumeUpload", filename: str) -> str:
    # @todo: consider renaming with a professional only bucket
    return f"resumes/professional_{instance.professional_id}/{filename}"


class ResumeUpload(models.Model):
    professional = models.OneToOneField(Professional, on_delete=models.CASCADE, related_name="resume")

    file = models.FileField(upload_to=resume_upload_path)
    extracted_text = models.TextField(blank=True, default="")  # text summary of resume
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self) -> str:
        return f"ResumeUpload(professional_id={self.professional_id})"

    @property
    def resume_summary(self) -> str:
        words = (self.extracted_text or "").split()
        return " ".join(words[:RESUME_SUMMARY_LENGTH])
