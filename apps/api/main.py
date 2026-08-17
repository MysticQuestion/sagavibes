from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from models import ProjectIntake, RouteDecision, StudioCommand, StudioPlan
from routing import select_build_route
from studio import plan_studio_command

app = FastAPI(
    title="SagaVibes Orchestrator API",
    version="0.2.0",
    description="Control-plane API for project intake, software-factory routing, and governed Studio mutations.",
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


@app.post("/api/studio/plan", response_model=StudioPlan)
def plan_studio_change(command: StudioCommand) -> StudioPlan:
    return plan_studio_command(command)
