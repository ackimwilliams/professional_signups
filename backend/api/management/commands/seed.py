from django.core.management.base import BaseCommand
from api.models import Professional


class Command(BaseCommand):
    help = "Seed database with sample professionals; extend here to add more professionals."

    def handle(self, *args, **options):
        samples = [
            dict(
                full_name="John W. Smith",
                email="john.w.smith@example.com",
                phone="555-555-0001",
                company_name="Acme Health",
                job_title="Biomedical Researcher",
                source=Professional.Source.DIRECT,
            ),
            dict(
                full_name="Taylor Johnson",
                email="taylor.johnson@example.com",
                phone="555-555-0002",
                company_name="Wellness Partners",
                job_title="Environmental Scientist",
                source=Professional.Source.PARTNER,
            ),
            dict(
                full_name="Morgan Lee",
                email="morgan.lee@example.com",
                phone="555-555-0003",
                company_name="Internal Ops",
                job_title="Clinical Research Coordinator",
                source=Professional.Source.INTERNAL,
            ),
        ]

        created = 0

        for sample in samples:
            obj, was_created = Professional.objects.get_or_create(email=sample["email"], defaults=sample)
            created += 1 if was_created else 0

        self.stdout.write(self.style.SUCCESS(f"Seed completed. Created {created} professionals."))
