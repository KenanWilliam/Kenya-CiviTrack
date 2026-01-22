from django.core.management.base import BaseCommand
from django.utils.dateparse import parse_date
from decimal import Decimal

from projects.models import Project


class Command(BaseCommand):
    help = "Seed demo Projects (idempotent: skips titles that already exist)."

    def handle(self, *args, **options):
        # Build a set of actual DB field names so this won't crash
        # if your model is missing some optional fields.
        model_fields = {f.name for f in Project._meta.fields}

        def pick_fields(data: dict) -> dict:
            """Keep only keys that exist on the Project model."""
            return {k: v for k, v in data.items() if k in model_fields and v is not None}

        demo = [
            {
                "title": "Nairobi Road Rehabilitation",
                "description": "Resurfacing and drainage fixes on major urban roads.",
                "county": "Nairobi",
                "status": "ONGOING",
                "progress": 45,
                "budget": Decimal("250000000.00"),
                "latitude": Decimal("-1.286389"),
                "longitude": Decimal("36.817223"),
                "start_date": parse_date("2025-09-01"),
                "end_date": parse_date("2026-06-30"),
            },
            {
                "title": "Mombasa Water Pipeline Upgrade",
                "description": "Replace old pipes to reduce leaks and improve pressure.",
                "county": "Mombasa",
                "status": "ONGOING",
                "progress": 30,
                "budget": Decimal("180000000.00"),
                "latitude": Decimal("-4.043477"),
                "longitude": Decimal("39.668206"),
                "start_date": parse_date("2025-10-15"),
                "end_date": parse_date("2026-09-30"),
            },
            {
                "title": "Kisumu Street Lighting (Solar)",
                "description": "Install solar street lights in key public areas.",
                "county": "Kisumu",
                "status": "PLANNED",
                "progress": 0,
                "budget": Decimal("60000000.00"),
                "latitude": Decimal("-0.091702"),
                "longitude": Decimal("34.767956"),
                "start_date": parse_date("2026-02-01"),
                "end_date": parse_date("2026-07-31"),
            },
            {
                "title": "Nakuru Waste Management Improvement",
                "description": "Improve collection routes, bins, and sorting points.",
                "county": "Nakuru",
                "status": "ONGOING",
                "progress": 60,
                "budget": Decimal("90000000.00"),
                "latitude": Decimal("-0.303099"),
                "longitude": Decimal("36.080026"),
                "start_date": parse_date("2025-08-20"),
                "end_date": parse_date("2026-03-15"),
            },
            {
                "title": "Eldoret Public Park Revamp",
                "description": "Upgrade paths, playground equipment, and lighting.",
                "county": "Uasin Gishu",
                "status": "COMPLETED",
                "progress": 100,
                "budget": Decimal("45000000.00"),
                "latitude": Decimal("0.514277"),
                "longitude": Decimal("35.269780"),
                "start_date": parse_date("2025-01-10"),
                "end_date": parse_date("2025-05-30"),
            },
            {
                "title": "Machakos Market Drainage Upgrade",
                "description": "Drainage channels to reduce flooding near market areas.",
                "county": "Machakos",
                "status": "ONGOING",
                "progress": 25,
                "budget": Decimal("75000000.00"),
                "latitude": Decimal("-1.516667"),
                "longitude": Decimal("37.266667"),
                "start_date": parse_date("2025-11-01"),
                "end_date": parse_date("2026-08-31"),
            },
            {
                "title": "Nyeri Rural Health Center Renovation",
                "description": "Renovate wards and improve utilities for service delivery.",
                "county": "Nyeri",
                "status": "PLANNED",
                "progress": 0,
                "budget": Decimal("55000000.00"),
                "latitude": Decimal("-0.416667"),
                "longitude": Decimal("36.950000"),
                "start_date": parse_date("2026-03-01"),
                "end_date": parse_date("2026-10-15"),
            },
            {
                "title": "Kakamega School Connectivity Program",
                "description": "Internet + computer lab upgrades for selected schools.",
                "county": "Kakamega",
                "status": "STALLED",
                "progress": 15,
                "budget": Decimal("40000000.00"),
                "latitude": Decimal("0.284000"),
                "longitude": Decimal("34.752000"),
                "start_date": parse_date("2025-07-01"),
                "end_date": parse_date("2026-01-31"),
            },
            {
                "title": "Garissa Borehole Drilling Initiative",
                "description": "Drill and equip boreholes to improve access to clean water.",
                "county": "Garissa",
                "status": "ONGOING",
                "progress": 55,
                "budget": Decimal("120000000.00"),
                "latitude": Decimal("-0.456944"),
                "longitude": Decimal("39.658333"),
                "start_date": parse_date("2025-06-15"),
                "end_date": parse_date("2026-04-30"),
            },
            {
                "title": "Lodwar Flood Control (Seasonal Riverworks)",
                "description": "Riverbank reinforcement and channels to reduce flooding.",
                "county": "Turkana",
                "status": "ONGOING",
                "progress": 35,
                "budget": Decimal("160000000.00"),
                "latitude": Decimal("3.119000"),
                "longitude": Decimal("35.597000"),
                "start_date": parse_date("2025-09-20"),
                "end_date": parse_date("2026-12-15"),
            },
        ]

        created, skipped = 0, 0

        for item in demo:
            title = item.get("title")
            if not title:
                continue

            exists = Project.objects.filter(title=title).exists()
            if exists:
                skipped += 1
                continue

            data = pick_fields(item)
            Project.objects.create(**data)
            created += 1

        self.stdout.write(self.style.SUCCESS(
            f"Seed complete. Created: {created}, Skipped (already existed): {skipped}"
        ))
