# /// script
# requires-python = ">=3.11"
# dependencies = ["mcp>=1.0.0", "pydantic>=2.6"]
# ///

"""
Minimal MCP server exposing a single tool that returns Tech Radar entries.

Usage (no prior installs required via uv script metadata):

  uv run https://radar.sandbox.aetheron.com/radar-mcp.py

To test the MCP server, use the MCP Inspector:

  npx @modelcontextprotocol/inspector

Then configure your MCP-capable client (e.g., Cursor) to launch the above command.

Tool name: "get_tech_stack_guidance"
Arguments (all optional):
  - quadrant: list[int]  (0=Infrastructure, 1=Languages & Frameworks, 2=Services & LLMs, 3=Tools & Methodologies)
  - ring:     list[int]  (0=Primary, 1=Consider, 2=Experiment, 3=Avoid)

The server fetches entries from RADAR_ENTRIES_URL (env override) or the hosted default.
"""

from __future__ import annotations

import json
import os
import ssl
import time
import urllib.request
from typing import Any, Iterable, TypedDict, Annotated
from pydantic import Field, BeforeValidator
import re

from mcp.server.fastmcp import FastMCP


DEFAULT_ENTRIES_URL = "https://radar.sandbox.aetheron.com/radar-entries.json"
ENTRIES_URL_ENV = "RADAR_ENTRIES_URL"


def _as_int_set(value: int | Iterable[int] | None) -> set[int] | None:
  """Normalize an int or iterable of ints into a set of ints; None passes through."""
  if value is None:
    return None
  if isinstance(value, int):
    return {value}
  try:
    return {int(v) for v in value}
  except TypeError:
    # Not iterable
    return {int(value)}


def _coerce_to_int_list(value: Any) -> list[int] | None:
  """Coerce common inputs (int, list[int|str], comma/space-separated str) to list[int]."""
  if value is None:
    return None
  if isinstance(value, int):
    return [value]
  if isinstance(value, str):
    s = value.strip()
    # Handle JSON-style array in a string, e.g. "[1, 2]" or '["1","2"]'
    if (s.startswith("[") and s.endswith("]")):
      try:
        loaded = json.loads(s)
        tokens = loaded if isinstance(loaded, list) else [loaded]
      except Exception:
        # Fallback to splitting after trimming brackets
        s = s.removeprefix("[").removesuffix("]")
        tokens = [t for t in re.split(r"[,\s]+", s) if t]
    else:
      tokens = [t for t in re.split(r"[,\s]+", s) if t]
  else:
    try:
      tokens = list(value)
    except TypeError:
      return [int(value)]

  result: list[int] = []
  for token in tokens:
    if isinstance(token, int):
      result.append(token)
    else:
      s = str(token).strip()
      if not s:
        continue
      result.append(int(s))
  return result


def _fetch_entries(url: str, timeout: float = 10.0) -> list[dict[str, Any]]:
  """Fetch and parse the radar entries JSON from the given URL."""
  ctx = ssl.create_default_context()
  req = urllib.request.Request(url, headers={"User-Agent": "aetheron-mcp-radar/1.0"})
  with urllib.request.urlopen(req, timeout=timeout, context=ctx) as resp:
    charset = resp.headers.get_content_charset() or "utf-8"
    data = resp.read().decode(charset)
  parsed = json.loads(data)
  if not isinstance(parsed, list):
    raise ValueError("radar-entries.json did not contain a JSON array")
  return [e for e in parsed if isinstance(e, dict)]


def _filter_entries(
  entries: list[dict[str, Any]], quadrants: set[int] | None, rings: set[int] | None
) -> list[dict[str, Any]]:
  """Filter entries by quadrant/ring if provided; results sorted by label."""
  def keep(e: dict[str, Any]) -> bool:
    if quadrants is not None and int(e.get("quadrant", -1)) not in quadrants:
      return False
    if rings is not None and int(e.get("ring", -1)) not in rings:
      return False
    return True

  filtered = [e for e in entries if keep(e)]
  filtered.sort(key=lambda x: (int(x.get("ring", 99)), str(x.get("label", ""))))
  return filtered


mcp = FastMCP("Aetheron Tech Radar")


class Link(TypedDict):
  title: str
  url: str


class RadarEntry(TypedDict, total=False):
  label: str
  quadrant: int
  ring: int
  summary: str
  decision: str
  when_to_use: list[str]
  consider_alternitive: list[str]
  links: list[Link]
  logo: str


class Filters(TypedDict):
  quadrant: list[int] | None
  ring: list[int] | None


class RadarResponse(TypedDict):
  source_url: str
  filters: Filters
  count: int
  duration_ms: int
  entries: list[RadarEntry]


# Load once at startup (simple strategy)
_SOURCE_URL = os.environ.get(ENTRIES_URL_ENV, DEFAULT_ENTRIES_URL)
_ENTRIES: list[RadarEntry] = _fetch_entries(_SOURCE_URL)  # type: ignore[assignment]


@mcp.tool(
  name="get_tech_stack_guidance",
  title="Aetheron Tech Radar — Tech Stack Guidance",
  description=(
    """Get Aetheron's official technology decisions and recommendations from our Tech Radar.
    
    Use this tool when:
    - Designing new features or products to choose the right tech stack
    - Writing PRDs or technical specifications 
    - Making architecture decisions or technology trade-offs
    - Evaluating whether to adopt, consider, experiment with, or avoid specific technologies
    - Understanding our standard practices and approved alternatives
    
    Returns our curated technology choices with decision rationale, use cases, and alternatives.
    
    Quadrants: 0=Infrastructure, 1=Languages & Frameworks, 2=Services & LLMs, 3=Tools & Methodologies
    Rings: 0=Primary (default choice), 1=Consider (case-by-case), 2=Experiment (trial phase), 3=Avoid (use alternatives)
    
    Examples:
    - get_tech_stack_guidance() - Get all technology decisions
    - get_tech_stack_guidance(quadrant=[1], ring=[0, 1]) - Primary + Consider languages/frameworks
    - get_tech_stack_guidance(ring=[0]) - All primary/default technologies across categories
    """
  ),
  annotations={
    "title": "Aetheron Tech Radar — Tech Stack Guidance",
    "readOnlyHint": True,
    "idempotentHint": True,
    "openWorldHint": True,
  },
  structured_output=True,
)
def get_tech_stack_guidance(
  quadrant: Annotated[
    list[Annotated[int, Field(ge=0, le=3)]] | None,
    BeforeValidator(_coerce_to_int_list),
    Field(description=(
      "Quadrant filter as an array of integers (0–3). "
      "0=Infrastructure, 1=Languages & Frameworks, 2=Services & LLMs, 3=Tools & Methodologies."
    )),
  ] = None,
  ring: Annotated[
    list[Annotated[int, Field(ge=0, le=3)]] | None,
    BeforeValidator(_coerce_to_int_list),
    Field(description=(
      "Ring filter as an array of integers (0–3). "
      "0=Primary, 1=Consider, 2=Experiment, 3=Avoid."
    )),
  ] = None,
) -> RadarResponse:
  started = time.time()

  quadrants = _as_int_set(quadrant)
  rings = _as_int_set(ring)
  filtered = _filter_entries(_ENTRIES, quadrants, rings)
  duration_ms = int((time.time() - started) * 1000)

  return {
    "source_url": _SOURCE_URL,
    "filters": {
      "quadrant": sorted(quadrants) if quadrants is not None else None,
      "ring": sorted(rings) if rings is not None else None,
    },
    "count": len(filtered),
    "duration_ms": duration_ms,
    "entries": filtered,
  }


if __name__ == "__main__":
  # Defaults to stdio transport; clients like Cursor can spawn this directly.
  mcp.run()


