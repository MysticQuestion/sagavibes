from enum import Enum
from typing import Literal

from pydantic import BaseModel, Field


class BuildRoute(str, Enum):
    RAPID = "rapid"
    HYBRID = "hybrid"
    ENTERPRISE = "enterprise"


class ProjectIntake(BaseModel):
    idea: str = Field(min_length=10, max_length=20_000)
    prototype_only: bool = False
    speed_priority: int = Field(default=3, ge=0, le=5)
    compliance: int = Field(default=0, ge=0, le=5)
    integration_complexity: int = Field(default=1, ge=0, le=5)
    custom_backend: int = Field(default=1, ge=0, le=5)
    data_sensitivity: int = Field(default=0, ge=0, le=5)
    scale_requirement: int = Field(default=1, ge=0, le=5)
    expected_longevity: int = Field(default=3, ge=0, le=5)


class RouteDecision(BaseModel):
    route: BuildRoute
    enterprise_score: float
    reason_codes: list[str]
    recommended_lane: list[str]
    requires_human_approval: bool = True
    policy_version: Literal["2026-07-07.v1"] = "2026-07-07.v1"
