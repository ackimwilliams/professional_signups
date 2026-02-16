import logging
from django.db import transaction
from django.db.models import Q
from rest_framework import status
from rest_framework.parsers import JSONParser, MultiPartParser, FormParser
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Professional, ResumeUpload
from .serializers import (
    ProfessionalCreateSerializer,
    ProfessionalListSerializer,
    ResumeUploadSerializer,
)
from .services.resume_extractor import extract_text_from_pdf

logger = logging.getLogger("api")


class ProfessionalsView(APIView):
    """
    Save and get professional profiles

    POST /api/professionals/
    GET  /api/professionals/?source=direct|partner|internal&include_resume=true
    """
    parser_classes = [JSONParser]

    def post(self, request):
        email = (request.data.get("email") or "").strip() or None
        phone = (request.data.get("phone") or "").strip() or None

        # upsert if email exist, if not use phone
        find_via_email_phone = Q(email=email) if email else Q(phone=phone)
        existing = Professional.objects.filter(find_via_email_phone).first() if (email or phone) else None

        serializer = ProfessionalCreateSerializer(instance=existing, data=request.data)
        serializer.is_valid(raise_exception=True)

        if existing:
            professional = serializer.save()

            logger.info(
                "Updated professional",
                extra={
                    "professional_id": professional.id,
                    "source": professional.source
                })
            return Response(
                ProfessionalListSerializer(professional, context={"request": request}).data,
                status=200,
            )

        professional = serializer.save()
        logger.info("Created professional", extra={"professional_id": professional.id, "source": professional.source})

        return Response(ProfessionalListSerializer(professional, context={"request": request}).data, status=201)

    def get(self, request):
        """
        @todo: paginate later
        """
        qs = Professional.objects.all().order_by("-created_at")
        source = request.query_params.get("source")

        if source:
            qs = qs.filter(source=source)

        include_resume = request.query_params.get("include_resume") == "true"
        if include_resume:
            qs = qs.select_related("resume")  # avoid N+1 db queries

        data = ProfessionalListSerializer(qs, many=True, context={"request": request}).data

        # @todo: update logs to be more informative
        logger.info(f"Fetching professionals: returned {len(data)}")
        return Response(data, status=200)


class ProfessionalsBulkUpsertView(APIView):
    """
    Bulk api for professionals
    POST /api/professionals/bulk

    - upsert by email if present else phone
    - for partial success, return partial success
    """
    parser_classes = [JSONParser]

    def post(self, request):
        if not isinstance(request.data, list):
            return Response({"detail": "Expected a list of profiles."}, status=400)

        results = []
        created = 0
        updated = 0
        failed = 0

        for idx, professional in enumerate(request.data):
            try:
                email = (professional.get("email") or "").strip() or None
                phone = (professional.get("phone") or "").strip() or None

                if not email and not phone:
                    failed += 1
                    results.append(
                        {
                            "index": idx,
                            "status": "failed",
                            "error": "either email or phone is required"
                        })

                    continue # skip

                # upsert record
                find_via_email_phone = Q(email=email) if email else Q(phone=phone)

                with transaction.atomic():
                    existing = Professional.objects.filter(find_via_email_phone).first()

                    serialized = ProfessionalCreateSerializer(instance=existing, data=professional)
                    serialized.is_valid(raise_exception=True)

                    if existing:
                        professional = serialized.save()
                        updated += 1
                        results.append({"index": idx, "status": "updated", "id": professional.id})
                    else:
                        professional = Professional.objects.create(**serialized.validated_data)
                        created += 1
                        results.append({"index": idx, "status": "created", "id": professional.id})

            except Exception as e:
                logger.exception("bulk upsert item failed")
                failed += 1
                results.append({"index": idx, "status": "failed", "error": str(e)})

        return Response(
            {
                "created": created,
                "updated": updated,
                "failed": failed,
                "results": results
            },
            status=207,
        )


class ResumeUploadView(APIView):
    """
    POST /api/professionals/<id>/resume

    multipart/form-data: filetype: pdf

    stores file to cloud storage
    """
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request, professional_id: int):
        professional = Professional.objects.filter(id=professional_id).first()

        if not professional:
            return Response({"detail": "professional not found"}, status=404)

        pdf = request.FILES.get("file")
        if not pdf:
            return Response({"detail": "missing resume file"}, status=400)

        # update or create the resume
        resume, _ = ResumeUpload.objects.get_or_create(professional=professional)
        resume.file = pdf
        resume.save()

        # --------------- extract text from resume
        try:
            with resume.file.open("rb") as f:
                extracted = extract_text_from_pdf(f)
        except Exception:
            logger.exception("failed to open stored resume")
            extracted = ""

        resume.extracted_text = extracted
        resume.save(update_fields=["extracted_text"])

        logger.info("Uploaded resume", extra={"professional_id": professional.id, "resume_id": resume.id})

        return Response(ResumeUploadSerializer(resume).data, status=201) # created
