from models import BuildRoute, ProjectIntake
from routing import select_build_route


def test_sensitive_project_forces_enterprise_route() -> None:
    intake = ProjectIntake(
        idea="Build a regulated case-management application with sensitive records.",
        speed_priority=5,
        compliance=4,
        data_sensitivity=4,
    )

    decision = select_build_route(intake)

    assert decision.route == BuildRoute.ENTERPRISE
    assert "regulated_or_compliance_sensitive" in decision.reason_codes
    assert "sensitive_data" in decision.reason_codes


def test_standard_fast_prototype_uses_rapid_route() -> None:
    intake = ProjectIntake(
        idea="Build a marketing prototype with a contact form and a simple dashboard.",
        prototype_only=True,
        speed_priority=5,
        compliance=0,
        integration_complexity=0,
        custom_backend=0,
        data_sensitivity=0,
        scale_requirement=0,
        expected_longevity=0,
    )

    decision = select_build_route(intake)

    assert decision.route == BuildRoute.RAPID


def test_complex_product_uses_hybrid_route() -> None:
    intake = ProjectIntake(
        idea="Build a premium real estate platform with search, broker workflows, and concierge appointments.",
        speed_priority=4,
        compliance=1,
        integration_complexity=3,
        custom_backend=3,
        data_sensitivity=1,
        scale_requirement=3,
        expected_longevity=4,
    )

    decision = select_build_route(intake)

    assert decision.route == BuildRoute.HYBRID
