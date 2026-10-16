"""Common API dependencies for CampusStock."""
from typing import Generator
from sqlalchemy.orm import Session
from app.config import settings
from app.database import get_db


def get_settings():
    """Retrieve application settings."""
    return settings


__all__ = ["get_settings", "get_db", "Session"]
