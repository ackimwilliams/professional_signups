import re
from rest_framework import serializers
from .models import Professional, ResumeUpload
from django.core.exceptions import ObjectDoesNotExist


class ProfessionalCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Professional
        fields = [
            "id",
            "full_name",
            "email",  # validated in model
            "phone",
            "company_name",
            "job_title",
            "source",
            "created_at",
        ]
        read_only_fields = ["id", "created_at"]

    def validate_phone(self, value):
        if not value:
            return value

        digits = re.sub(r"\D", "", str(value))

        if not digits.isdigit():
            raise serializers.ValidationError("phone must contain digits only")

        if not 7 <= len(digits) <= 15:
            raise serializers.ValidationError("phone must be between 7 and 15 digits")

        return digits

    def validate_source(self, value):
        allowed = {choice[0] for choice in Professional.Source.choices}

        if value not in allowed:
            raise serializers.ValidationError(
                f"source is invalid and must be one of: {sorted(allowed)}"
            )

        return value

    def validate_phone(self, value):
        if not value:
            return value

        digits = re.sub(r"\D", "", str(value))

        if not digits.isdigit():
            raise serializers.ValidationError("phone must contain digits only")

        if not 7 <= len(digits) <= 15:
            raise serializers.ValidationError("phone must be between 7 and 15 digits")

        return digits

    def validate(self, attrs):
        email = attrs.get("email")
        phone = attrs.get("phone")

        if not email and not phone:
            raise serializers.ValidationError("either email or phone is required")

        return attrs


class ProfessionalListSerializer(serializers.ModelSerializer):
    resume_url = serializers.SerializerMethodField()
    resume_summary = serializers.SerializerMethodField()

    class Meta:
        model = Professional
        fields = [
            "id",
            "full_name",
            "email",
            "phone",
            "company_name",
            "job_title",
            "source",
            "created_at",
            "resume_url",
            "resume_summary",
        ]

    def _get_resume_or_none(self, obj: Professional):
        try:
            return obj.resume
        except ObjectDoesNotExist:
            return None

    def _include_resume(self) -> bool:
        request = self.context.get("request")
        if not request:
            return False

        include_resume = request.query_params.get("include_resume", "")
        return str(include_resume).strip().lower()  == "true"

    def get_resume_url(self, obj: Professional):
        request = self.context.get("request")
        if not self._include_resume():
            return None

        resume = self._get_resume_or_none(obj)
        if not resume or not getattr(resume, "file"):
            return None

        # @todo: this is a quickfix
        url = resume.file.url.replace("minio", "localhost")
        return request.build_absolute_uri(url) if request else url

    def get_resume_summary(self, obj: Professional):
        if not self._include_resume():
            return None

        resume = self._get_resume_or_none(obj)
        if not resume:
            return None

        return resume.resume_summary


class ResumeUploadSerializer(serializers.ModelSerializer):
    class Meta:
        model = ResumeUpload
        fields = ["id", "professional", "file", "extracted_text", "created_at"]
        read_only_fields = ["id", "extracted_text", "created_at"]
