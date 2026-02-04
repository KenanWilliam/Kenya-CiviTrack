from rest_framework import serializers

from .models import Comment


class CommentSerializer(serializers.ModelSerializer):
    user_username = serializers.CharField(source="user.username", read_only=True)
    user_role = serializers.CharField(source="user.role", read_only=True)

    class Meta:
        model = Comment
        fields = [
            "id",
            "project",
            "user",
            "user_username",
            "user_role",
            "body",
            "created_at",
        ]
        read_only_fields = ["id", "project", "user", "user_username", "user_role", "created_at"]

    def validate_body(self, value: str) -> str:
        if not value or not value.strip():
            raise serializers.ValidationError("Comment body is required.")
        return value.strip()
