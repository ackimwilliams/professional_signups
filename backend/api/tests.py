import tempfile
from unittest.mock import patch

from django.test import override_settings
from rest_framework import status
from rest_framework.test import APITestCase
from django.core.files.uploadedfile import SimpleUploadedFile

from .models import Professional, ResumeUpload


class ProfessionalApiIntegrationTests(APITestCase):
    def _create_professional(self, **overrides):
        data = {
            "full_name": "Jane Doe",
            "email": "jane@example.com",
            "phone": None,
            "company_name": "",
            "job_title": "",
            "source": "direct",
        }

        data.update(overrides)

        return Professional.objects.create(**data)

    @override_settings(MEDIA_ROOT=tempfile.gettempdir())
    def test_list_professionals_default_excludes_resume(self):
        professional = self._create_professional()

        ResumeUpload.objects.create(
            professional=professional,
            file=SimpleUploadedFile(
                "resume.pdf",
                b"%PDF-1.4 test",
                content_type="application/pdf"),
            extracted_text="one two three four five",
        )

        resp = self.client.get("/api/professionals/")

        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertEqual(len(resp.data), 1)
        self.assertIsNone(resp.data[0]["resume_url"])
        self.assertIsNone(resp.data[0]["resume_summary"])

    @override_settings(MEDIA_ROOT=tempfile.gettempdir())
    def test_list_professionals_include_resume(self):
        prof = self._create_professional(email="newtonx@example.com")
        extracted_text = "a summary extracted from resume"

        ResumeUpload.objects.create(
            professional=prof,
            file=SimpleUploadedFile(
                "resume.pdf",
                b"%PDF-1.4 test",
                content_type="application/pdf"
            ),
            extracted_text=extracted_text,
        )

        resp = self.client.get("/api/professionals/?include_resume=true")

        # assertions
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertEqual(len(resp.data), 1)
        self.assertIsNotNone(resp.data[0]["resume_url"])
        self.assertEqual(resp.data[0]["resume_summary"], extracted_text)

    def test_list_professionals_filter_by_source(self):
        self._create_professional(email="a@example.com", source="direct")
        self._create_professional(email="b@example.com", source="partner")

        resp = self.client.get("/api/professionals/?source=partner")

        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertEqual(len(resp.data), 1)
        self.assertEqual(resp.data[0]["source"], "partner")

    def test_create_professional_upserts_on_existing_email(self):
        existing = self._create_professional(email="exists@example.com", full_name="Old Name")

        resp = self.client.post(
            "/api/professionals/",
            data={
                "full_name": "New Name",
                "email": "exists@example.com",
                "source": "direct",
            },
            format="json",
        )

        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        existing.refresh_from_db()
        self.assertEqual(existing.full_name, "New Name")

    def test_bulk_upsert_updates_existing_email(self):
        existing = self._create_professional(email="exists@example.com", full_name="Old Name")

        payload = [
            {"full_name": "New Name", "email": "exists@example.com", "source": "direct"},
            {"full_name": "Phone Only", "phone": "555-000-1111", "source": "partner"},
            {"full_name": "Invalid", "source": "internal"},
        ]

        resp = self.client.post("/api/professionals/bulk", data=payload, format="json")

        self.assertEqual(resp.status_code, 207) # 207 used for multi-status

        self.assertEqual(resp.data["created"], 1)
        self.assertEqual(resp.data["updated"], 1)
        self.assertEqual(resp.data["failed"], 1)

        existing.refresh_from_db()
        self.assertEqual(existing.full_name, "New Name")

    @override_settings(MEDIA_ROOT=tempfile.gettempdir())
    @patch("api.views.extract_text_from_pdf", return_value="resume summary from sample")
    def test_resume_upload_creates_resume(self, _extract_mock):
        prof = self._create_professional(email="resume@example.com")
        file = SimpleUploadedFile(
            "resume.pdf",
            b"%PDF-1.4 test",
            content_type="application/pdf"
        )

        resp = self.client.post(
            f"/api/professionals/{prof.id}/resume",
            data={"file": file},
            format="multipart",
        )

        self.assertEqual(resp.status_code, status.HTTP_201_CREATED)
        self.assertEqual(ResumeUpload.objects.filter(professional=prof).count(), 1)
        self.assertEqual(
            resp.data["extracted_text"],
            "resume summary from sample"
        )
