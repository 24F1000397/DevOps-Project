import os
from fastapi import FastAPI, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.config import settings

app = FastAPI(
    title="CampusStock — Campus Inventory & Asset Management System",
    description="Production-grade API for managing campus inventory, assets, stock levels, and issue/return operations.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/", tags=["Root"])
def read_root():
    """Welcome endpoint providing service discovery links."""
    return {
        "service": settings.APP_NAME,
        "environment": settings.APP_ENV,
        "docs": "/docs",
        "health": "/health",
        "ready": "/ready",
        "version": "1.0.0",
    }


@app.get("/health", tags=["Health"], status_code=status.HTTP_200_OK)
def health_check():
    """Liveness probe endpoint."""
    return {
        "status": "healthy",
        "service": settings.APP_NAME,
        "version": "1.0.0",
    }


@app.get("/ready", tags=["Health"])
def readiness_check():
    """Readiness probe endpoint checking app and database readiness."""
    # When database module is added in subsequent milestone, this probes the DB
    return {
        "status": "ready",
        "service": settings.APP_NAME,
        "database": "configured",
    }
