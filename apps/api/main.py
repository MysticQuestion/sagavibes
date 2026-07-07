from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from models import ProjectIntake, RouteDecision
from routing import select_build_route

app = FastAPI(
    title="SagaVibes Orchestrator API",
    version="0.1.0",
    description="Control-plane API for project intake and software-factory routing.",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/healthz")
def healthz() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/api/projects/route", response_model=RouteDecision)
def route_project(intake: ProjectIntake) -> RouteDecision:
    return select_build_route(intake)
