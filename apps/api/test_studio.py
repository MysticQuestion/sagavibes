from models import StudioCommand, StudioSelection
from studio import plan_studio_command


def test_visual_command_proposes_structured_patch() -> None:
    plan = plan_studio_command(
        StudioCommand(
            prompt="Make this more premium and center it.",
            site_version=7,
            selection=StudioSelection(page_id="home", node_id="hero_01"),
        )
    )

    assert plan.agent == "visual"
    assert plan.base_site_version == 7
    assert plan.requires_human_approval is True
    assert len(plan.operations) >= 3
    assert any(operation.path == "/nodes/hero_01/style/align" for operation in plan.operations)


def test_copy_command_uses_user_supplied_text() -> None:
    plan = plan_studio_command(
        StudioCommand(
            prompt='Set heading to "Build what comes next."',
            selection=StudioSelection(page_id="home", node_id="hero_01"),
        )
    )

    assert plan.agent == "copy"
    assert plan.intent == "update_heading"
    assert plan.operations[-1].path == "/nodes/hero_01/props/heading"
    assert plan.operations[-1].value == "Build what comes next."


def test_unimplemented_request_does_not_fabricate_mutation() -> None:
    plan = plan_studio_command(
        StudioCommand(
            prompt="Research my competitors and rewrite the whole page.",
            selection=StudioSelection(page_id="home", node_id="hero_01"),
        )
    )

    assert plan.operations == []
    assert "will not invent" in plan.summary
