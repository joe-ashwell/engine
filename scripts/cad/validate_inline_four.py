from __future__ import annotations

import json
import math
from pathlib import Path


ROOT = Path(__file__).resolve().parents[2]
MANIFEST_PATH = ROOT / "lib/generated/inline-four-manifest.json"


def valve_lift(local_angle: float, intake: bool, maximum: float) -> float:
    if intake and 0 <= local_angle < 180:
        return math.sin(math.radians(local_angle)) * maximum
    if not intake and 540 <= local_angle < 720:
        return math.sin(math.radians(local_angle - 540)) * maximum
    return 0


def validate():
    manifest = json.loads(MANIFEST_PATH.read_text())
    dimensions = manifest["dimensions"]
    radius = dimensions["crankRadius"]
    rod_length = dimensions["rodLength"]
    crank_y = dimensions["crankY"]
    piston_half_height = dimensions["pistonHeight"] / 2
    deck_y = dimensions["deckY"]
    valve_closed_y = dimensions["valveClosedY"]
    valve_max_lift = dimensions["valveLift"]
    phases = manifest["crankPhases"]
    firing_offsets = manifest["firingOffsets"]

    minimum_deck_gap = float("inf")
    minimum_valve_gap = float("inf")
    minimum_crankcase_gap = float("inf")
    maximum_rod_length_error = 0
    maximum_rod_swing = 0

    for global_angle in range(720):
        for cylinder in range(4):
            theta = math.radians(global_angle + phases[cylinder])
            crank_z = radius * math.sin(theta)
            crank_pin_y = crank_y + radius * math.cos(theta)
            piston_pin_y = crank_pin_y + math.sqrt(
                rod_length**2 - crank_z**2
            )
            calculated_rod_length = math.hypot(
                piston_pin_y - crank_pin_y,
                crank_z,
            )
            maximum_rod_length_error = max(
                maximum_rod_length_error,
                abs(calculated_rod_length - rod_length),
            )
            piston_top = piston_pin_y + piston_half_height
            deck_gap = deck_y - piston_top
            minimum_deck_gap = min(minimum_deck_gap, deck_gap)
            maximum_rod_swing = max(maximum_rod_swing, abs(crank_z))
            crankcase_gap = 0.95 - (abs(crank_z) + 0.24)
            minimum_crankcase_gap = min(minimum_crankcase_gap, crankcase_gap)

            local_angle = (global_angle + firing_offsets[cylinder]) % 720
            for intake in (True, False):
                lift = valve_lift(
                    local_angle,
                    intake,
                    valve_max_lift,
                )
                valve_tip = valve_closed_y - 0.44 - lift
                valve_gap = valve_tip - piston_top
                minimum_valve_gap = min(minimum_valve_gap, valve_gap)

    failures = []
    if minimum_deck_gap < 0.12:
        failures.append(f"deck gap is {minimum_deck_gap:.3f}")
    if minimum_valve_gap < 0.05:
        failures.append(f"valve gap is {minimum_valve_gap:.3f}")
    if maximum_rod_swing > 0.9:
        failures.append(f"rod swing is {maximum_rod_swing:.3f}")
    if maximum_rod_length_error > 0.000001:
        failures.append(f"rod length error is {maximum_rod_length_error:.6f}")
    if minimum_crankcase_gap < 0.05:
        failures.append(f"crankcase gap is {minimum_crankcase_gap:.3f}")
    if phases != [0, 180, 180, 0]:
        failures.append("crank journal phases do not match the inline-four layout")
    if [offset % 360 for offset in firing_offsets] != phases:
        failures.append("firing offsets do not align with crank journals")
    if dimensions.get("pistonPinAxis") != "x":
        failures.append("piston and connecting-rod pin axes must align with the crankshaft")
    if dimensions.get("timingGearTeeth", 0) < 16:
        failures.append("timing gear must have a complete ring of teeth")
    if dimensions.get("pistonPinRadius", 0) >= dimensions.get(
        "rodSmallEndBoreRadius", 0
    ):
        failures.append("piston pin must fit inside the connecting-rod small end")
    if dimensions.get("crankPinRadius", 0) >= dimensions.get(
        "rodBigEndBoreRadius", 0
    ):
        failures.append("crank pin must fit inside the connecting-rod big end")

    if failures:
        raise SystemExit("Clearance check failed: " + ", ".join(failures))

    print(
        "Clearance check passed: "
        f"deck {minimum_deck_gap:.3f}, "
        f"valves {minimum_valve_gap:.3f}, "
        f"crankcase {minimum_crankcase_gap:.3f}, "
        f"rod error {maximum_rod_length_error:.6f}"
    )


if __name__ == "__main__":
    validate()
