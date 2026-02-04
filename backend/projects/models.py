from django.core.validators import MaxValueValidator, MinValueValidator
from django.db import models

class Project(models.Model):
    class Status(models.TextChoices):
        PLANNED = "PLANNED", "Planned"
        ONGOING = "ONGOING", "Ongoing"
        COMPLETED = "COMPLETED", "Completed"
        STALLED = "STALLED", "Stalled"

    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)

    county = models.CharField(max_length=100, blank=True)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PLANNED)

    budget = models.DecimalField(max_digits=14, decimal_places=2, null=True, blank=True)
    progress = models.PositiveSmallIntegerField(
        default=0,
        validators=[MinValueValidator(0), MaxValueValidator(100)],
    )  # 0-100

    latitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    longitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)

    start_date = models.DateField(null=True, blank=True)
    end_date = models.DateField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title
