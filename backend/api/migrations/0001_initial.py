import api.models
import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):
    initial = True

    dependencies = []

    operations = [
        migrations.CreateModel(
            name="Professional",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                ("full_name", models.CharField(max_length=255)),
                (
                    "email",
                    models.EmailField(
                        blank=True, max_length=254, null=True, unique=True
                    ),
                ),
                (
                    "phone",
                    models.CharField(blank=True, max_length=32, null=True, unique=True),
                ),
                (
                    "company_name",
                    models.CharField(blank=True, default="", max_length=255),
                ),
                ("job_title", models.CharField(blank=True, default="", max_length=255)),
                (
                    "source",
                    models.CharField(
                        choices=[
                            ("direct", "direct"),
                            ("partner", "partner"),
                            ("internal", "internal"),
                        ],
                        max_length=16,
                    ),
                ),
                ("created_at", models.DateTimeField(auto_now_add=True)),
            ],
        ),
        migrations.CreateModel(
            name="ResumeUpload",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                ("file", models.FileField(upload_to=api.models.resume_upload_path)),
                ("extracted_text", models.TextField(blank=True, default="")),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                (
                    "professional",
                    models.OneToOneField(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="resume",
                        to="api.professional",
                    ),
                ),
            ],
        ),
    ]
