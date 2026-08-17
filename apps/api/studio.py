import re
from uuid import uuid4

from models import SitePatchOperation, StudioCommand, StudioPlan


def _set(path: str, value: object) -> SitePatchOperation:
    return SitePatchOperation(op="set", path=path, value=value)


def _quoted_value(prompt: str) -> str | None:
    match = re.search(r'["“](.+?)["”]', prompt)
    if match:
        return match.group(1).strip()
    return None


def _suffix_after_to(prompt: str) -> str | None:
    match = re.search(r"\bto\s+(.+)$", prompt, flags=re.IGNORECASE)
    if not match:
        return None
    value = match.group(1).strip().strip('"“”')
    return value or None


def _agent_for(text: str) -> str:
    if any(term in text for term in ("seo", "metadata", "search engine", "schema markup")):
        return "seo"
    if any(term in text for term in ("brand", "palette", "color", "typography", "font")):
        return "brand"
    if any(term in text for term in ("mobile", "responsive", "flow", "ux", "usability")):
        return "ux"
    if any(term in text for term in ("layout", "premium", "cinematic", "minimal", "center", "align", "spacing")):
        return "visual"
    if any(term in text for term in ("copy", "headline", "heading", "rewrite", "cta", "button text")):
        return "copy"
    return "conductor"


def plan_studio_command(command: StudioCommand) -> StudioPlan:
    prompt = command.prompt.strip()
    text = prompt.lower()
    node_id = command.selection.node_id or "hero_01"
    page_id = command.selection.page_id or "home"
    agent = _agent_for(text)
    operations: list[SitePatchOperation] = []
    intent = "inspect_request"

    if "center" in text:
        intent = "change_alignment"
        operations.append(_set(f"/nodes/{node_id}/style/align", "center"))
    elif "align left" in text or "left align" in text:
        intent = "change_alignment"
        operations.append(_set(f"/nodes/{node_id}/style/align", "left"))

    if any(term in text for term in ("premium", "cinematic", "stronger", "more impact")):
        intent = "increase_visual_emphasis"
        operations.extend(
            [
                _set(f"/nodes/{node_id}/style/emphasis", "strong"),
                _set(f"/nodes/{node_id}/style/density", "spacious"),
                _set(f"/nodes/{node_id}/style/tone", "accent"),
            ]
        )

    if any(term in text for term in ("minimal", "simpler", "less busy")):
        intent = "reduce_visual_density"
        operations.extend(
            [
                _set(f"/nodes/{node_id}/style/emphasis", "standard"),
                _set(f"/nodes/{node_id}/style/density", "compact"),
                _set(f"/nodes/{node_id}/style/tone", "base"),
            ]
        )

    content_value = _quoted_value(prompt) or _suffix_after_to(prompt)

    if any(term in text for term in ("set heading", "set headline", "change heading", "change headline")) and content_value:
        intent = "update_heading"
        operations.append(_set(f"/nodes/{node_id}/props/heading", content_value))

    if any(term in text for term in ("set body", "change body", "set description")) and content_value:
        intent = "update_body"
        operations.append(_set(f"/nodes/{node_id}/props/body", content_value))

    if any(term in text for term in ("set cta", "change cta", "button text")) and content_value:
        intent = "update_cta"
        operations.append(_set(f"/nodes/{node_id}/props/primaryCta", content_value))

    if "add" in text and "service" in text and "section" in text:
        intent = "add_services_section"
        node_id_new = f"services_{uuid4().hex[:8]}"
        operations.append(
            SitePatchOperation(
                op="append_node",
                page_id=page_id,
                node={
                    "id": node_id_new,
                    "type": "services",
                    "label": "New services",
                    "props": {
                        "eyebrow": "SERVICES",
                        "heading": "What we can do for you.",
                        "body": "Edit this section directly or route the content task to the Saga Copy agent.",
                        "service1": "Strategy",
                        "service2": "Design",
                        "service3": "Build",
                        "service4": "Optimize",
                    },
                    "style": {
                        "tone": "base",
                        "align": "left",
                        "emphasis": "standard",
                        "density": "comfortable",
                    },
                },
            )
        )

    if operations:
        summary = f"{agent.title()} agent prepared {len(operations)} Site Graph operation(s) for the selected scope."
    else:
        summary = (
            f"{agent.title()} agent recognized the request, but this foundation planner will not invent "
            "content or code. A model-backed specialist will handle this intent in the next integration layer."
        )

    return StudioPlan(
        agent=agent,
        intent=intent,
        summary=summary,
        operations=operations,
        requires_human_approval=True,
        base_site_version=command.site_version,
    )
