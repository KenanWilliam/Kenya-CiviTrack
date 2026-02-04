from django.db import migrations, models
import django.db.models.deletion
from django.conf import settings


class Migration(migrations.Migration):
    initial = True

    dependencies = [
        ("projects", "0002_add_progress_validators"),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name="Report",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("category", models.CharField(choices=[("CORRUPTION", "Corruption"), ("DELAY", "Delay"), ("QUALITY", "Quality issue"), ("BUDGET", "Budget concern"), ("OTHER", "Other")], default="OTHER", max_length=30)),
                ("description", models.TextField()),
                ("status", models.CharField(choices=[("OPEN", "Open"), ("IN_REVIEW", "In review"), ("RESOLVED", "Resolved"), ("DISMISSED", "Dismissed")], default="OPEN", max_length=20)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("project", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="reports", to="projects.project")),
                ("user", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="reports", to=settings.AUTH_USER_MODEL)),
            ],
            options={
                "ordering": ["-created_at"],
            },
        ),
    ]
