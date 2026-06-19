#!/usr/bin/env python3
"""Run the Medha AI backend server."""
import os
import uvicorn

if __name__ == "__main__":
    reload = os.getenv("ENVIRONMENT", "development") == "development"
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=reload,
        log_level="info",
    )
