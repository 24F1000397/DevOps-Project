import os
from fastapi import FastAPI, status, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from prometheus_fastapi_instrumentator import Instrumentator
from sqlalchemy.orm import Session

from app.config import settings
from app.database import check_database_connection, get_db
from app.routers import items, categories, transactions, stats

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

# Real Prometheus Metrics Instrumentation
instrumentator = Instrumentator(
    should_group_status_codes=True,
    should_ignore_untemplated=True,
    should_instrument_requests_inprogress=True,
    excluded_handlers=["/metrics", "/health", "/ready"],
    inprogress_name="campusstock_http_requests_inprogress",
    inprogress_labels=True,
)
instrumentator.instrument(app).expose(app, endpoint="/metrics", tags=["Monitoring"], include_in_schema=True)

# Include Routers
app.include_router(items.router, prefix=settings.API_PREFIX)
app.include_router(categories.router, prefix=settings.API_PREFIX)
app.include_router(transactions.router, prefix=settings.API_PREFIX)
app.include_router(stats.router, prefix=settings.API_PREFIX)


@app.get("/", tags=["Root"])
def read_root():
    """Welcome endpoint providing service discovery links."""
    return {
        "service": settings.APP_NAME,
        "environment": settings.APP_ENV,
        "docs": "/docs",
        "health": "/health",
        "ready": "/ready",
        "metrics": "/metrics",
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
    db_ok = check_database_connection()
    if not db_ok:
        return JSONResponse(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            content={
                "status": "unready",
                "service": settings.APP_NAME,
                "database": "disconnected",
            },
        )
    return {
        "status": "ready",
        "service": settings.APP_NAME,
        "database": "connected",
    }
