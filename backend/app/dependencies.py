"""Common API dependencies for CampusStock."""
from typing import Generator
from app.config import settings


def get_settings():
    """Retrieve application settings."""
    return settings
