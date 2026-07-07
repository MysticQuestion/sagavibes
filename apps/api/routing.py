from models import BuildRoute, ProjectIntake, RouteDecision


def select_build_route(intake: ProjectIntake) -> RouteDecision:
    """Select a delivery lane using auditable, deterministic policy signals.

    LLMs may extract the signal values from natural-language discovery, but an
    LLM is not allowed to make the final routing decision invisibly.
    """
    score = (
        3 * intake.compliance
        + 2 * intake.integration_complexity
        + 2 * intake.custom_backend
        + 2 * intake.data_sensitivity
        + 1.5 * intake.scale_requirement
        + 1.5 * intake.expected_longevity
        - 2 * intake.speed_priority
        - (2 if intake.prototype_only else 0)
    )

    reasons: list[str] = []
    if intake.compliance >= 3:
        reasons.append("regulated_or_compliance_sensitive")
    if intake.data_sensitivity >= 3:
        reasons.append("sensitive_data")
    if intake.integration_complexity >= 3:
        reasons.append("integration_heavy")
    if intake.custom_backend >= 3:
        reasons.append("custom_backend_required")
    if intake.speed_priority >= 4:
        reasons.append("speed_is_primary")
    if intake.prototype_only:
        reasons.append("prototype_only")

    mandatory_enterprise = intake.compliance >= 4 or intake.data_sensitivity >= 4

    if mandatory_enterprise or score >= 24:
        route = BuildRoute.ENTERPRISE
        lane = [
            "github-repository",
            "codespaces",
            "codex-or-copilot-agent",
            "ci-security-gates",
            "preview-deployment",
        ]
    elif score >= 10:
        route = BuildRoute.HYBRID
        lane = [
            "rapid-ui-scaffold",
            "github-canonical-repository",
            "custom-api-and-data-layer",
            "ci-tests",
            "preview-deployment",
        ]
    else:
        route = BuildRoute.RAPID
        lane = [
            "rapid-builder",
            "github-sync",
            "smoke-tests",
            "preview-deployment",
        ]

    if not reasons:
        reasons.append("standard_product_profile")

    return RouteDecision(
        route=route,
        enterprise_score=round(score, 2),
        reason_codes=reasons,
        recommended_lane=lane,
    )
