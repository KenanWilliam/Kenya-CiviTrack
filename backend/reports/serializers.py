from rest_framework import serializers

from .models import Report


class ReportSerializer(serializers.ModelSerializer):
    user_username = serializers.CharField(source="user.username", read_only=True)
    user_role = serializers.CharField(source="user.role", read_only=True)

    class Meta:
        model = Report
        fields = [
            "id",
            "project",
            "user",
            "user_username",
            "user_role",
            "category",
            "description",
            "status",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "id",
            "project",
            "user",
            "user_username",
            "user_role",
            "status",
            "created_at",
            "updated_at",
        ]

    def validate_description(self, value: str) -> str:
        if not value or not value.strip():
            raise serializers.ValidationError("Description is required.")
        return value.strip()


class ReportStatusSerializer(serializers.ModelSerializer):
    class Meta:
        model = Report
        fields = ["status"]
