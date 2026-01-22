from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers

User = get_user_model()

class RegisterSerializer(serializers.Serializer):
    username = serializers.CharField(max_length=150)
    email = serializers.EmailField(required=False, allow_blank=True)
    password = serializers.CharField(write_only=True, min_length=8)
    password2 = serializers.CharField(write_only=True, min_length=8)

    def validate(self, attrs):
        if attrs["password"] != attrs["password2"]:
            raise serializers.ValidationError({"password2": "Passwords do not match."})

        # Django’s built-in password validators (stronger, consistent)
        validate_password(attrs["password"])
        return attrs

    def create(self, validated_data):
        username = validated_data["username"]
        email = validated_data.get("email", "")
        password = validated_data["password"]

        user = User.objects.create_user(username=username, email=email, password=password)

        # If your User model has a role field, default it to CITIZEN when possible.
        if hasattr(user, "role") and not getattr(user, "role", None):
            try:
                user.role = "CITIZEN"
                user.save(update_fields=["role"])
            except Exception:
                pass

        return user
