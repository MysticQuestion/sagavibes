from enum import Enum
from typing import Any, Literal

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


class StudioSelection(BaseModel):
    page_id: str | None = None
    node_id: str | None = None


class StudioCommand(BaseModel):
    prompt: str = Field(min_length=2, max_length=4_000)
    site_version: int = Field(default=1, ge=1)
    selection: StudioSelection = Field(default_factory=StudioSelection)


class SitePatchOperation(BaseModel):
    op: Literal["set", "append_node", "remove_node"]
    path: str | None = None
    value: Any = None
    page_id: str | None = None
    node: dict[str, Any] | None = None
    node_id: str | None = None


class StudioPlan(BaseModel):
    agent: Literal["conductor", "brand", "visual", "copy", "ux", "seo"]
    intent: str
    summary: str
    operations: list[SitePatchOperation]
    requires_human_approval: bool = True
    base_site_version: int
