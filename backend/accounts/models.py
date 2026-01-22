from django.db import models

from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    class Role(models.TextChoices):
        ADMIN = "ADMIN", "Admin"
        OFFICIAL = "OFFICIAL", "Official"
        CITIZEN = "CITIZEN", "Citizen"

    role = models.CharField(max_length=20, choices=Role.choices, default=Role.CITIZEN)
