from __future__ import annotations

import json
from pathlib import Path

import numpy as np
import trimesh
from build123d import Align, Box, Cylinder, Pos, Rot, Sphere, Torus, fillet


ROOT = Path(__file__).resolve().parents[2]
MODEL_PATH = ROOT / "public/models/inline-four-engine.glb"
MANIFEST_PATH = ROOT / "lib/generated/inline-four-manifest.json"

D = {
    "bore": 1.18,
    "stroke": 1.3,
    "crankRadius": 0.65,
    "rodLength": 2.5,
    "pistonHeight": 0.74,
    "crankY": -1.55,
    "deckY": 2.1,
    "valveClosedY": 2.5,
    "valveLift": 0.24,
    "cylinderSpacing": 1.55,
    "timingGearTeeth": 20,
    "pistonPinAxis": "x",
    "pistonPinRadius": 0.085,
    "pistonPinHoleRadius": 0.105,
    "rodSmallEndBoreRadius": 0.095,
    "crankPinRadius": 0.16,
    "rodBigEndBoreRadius": 0.17,
}

CYLINDER_X = [-2.325, -0.775, 0.775, 2.325]
CENTER = (Align.CENTER, Align.CENTER, Align.CENTER)

COLOURS = {
    "BlockFull": [42, 54, 55, 255],
    "BlockCutaway": [49, 67, 66, 255],
    "HeadFull": [54, 65, 65, 255],
    "HeadCutaway": [60, 79, 77, 255],
    "SumpFull": [37, 43, 44, 255],
    "SumpCutaway": [45, 53, 53, 255],
    "LinersFull": [120, 126, 124, 255],
    "LinersCutaway": [137, 143, 140, 255],
    "IntakeManifold": [62, 105, 99, 255],
    "ExhaustManifold": [130, 71, 49, 255],
    "Piston": [188, 187, 181, 255],
    "Rod": [117, 120, 119, 255],
    "Crankshaft": [47, 50, 52, 255],
    "Flywheel": [41, 43, 44, 255],
    "IntakeValve": [76, 125, 116, 255],
    "ExhaustValve": [151, 77, 57, 255],
    "SparkPlug": [219, 211, 193, 255],
    "IntakeCamshaft": [53, 69, 68, 255],
    "ExhaustCamshaft": [72, 61, 58, 255],
    "TimingGear": [83, 86, 86, 255],
}


def rounded_box(length: float, width: float, height: float, radius: float):
    shape = Box(length, width, height, align=CENTER)
    try:
        return fillet(shape.edges(), radius)
    except Exception:
        return shape


def axis_x_cylinder(radius: float, length: float):
    return Rot(0, 90, 0) * Cylinder(radius, length, align=CENTER)


def axis_y_cylinder(radius: float, length: float):
    return Rot(90, 0, 0) * Cylinder(radius, length, align=CENTER)


def make_block():
    block = rounded_box(7.45, 2.7, 3.8, 0.22)
    block = Pos(0, 0, 0.2) * block
    for x in CYLINDER_X:
        block -= Pos(x, 0, 1.0) * Cylinder(D["bore"] / 2 + 0.055, 2.45, align=CENTER)
    block -= Pos(0, 0, -1.18) * Box(6.75, 2.15, 1.25, align=CENTER)
    cutaway = block - Pos(0, -1.25, 0.35) * Box(8.2, 2.5, 5.1, align=CENTER)
    return block, cutaway


def make_head():
    head = Pos(0, 0, 2.43) * rounded_box(7.65, 2.92, 0.68, 0.2)
    for x in CYLINDER_X:
        head -= Pos(x, 0, 2.22) * Cylinder(D["bore"] * 0.42, 0.45, align=CENTER)
        for y in (-0.42, 0.42):
            head -= Pos(x, y, 2.48) * Cylinder(0.095, 0.9, align=CENTER)
    cutaway = head - Pos(0, -1.35, 2.43) * Box(8.2, 2.7, 1.3, align=CENTER)
    return head, cutaway


def make_sump():
    sump = Pos(0, 0, -2.08) * rounded_box(7.6, 2.85, 0.78, 0.25)
    cutaway = sump - Pos(0, -1.25, -2.08) * Box(8.2, 2.5, 1.4, align=CENTER)
    return sump, cutaway


def make_liners():
    liners = None
    for x in CYLINDER_X:
        tube = Pos(x, 0, 0.98) * (
            Cylinder(D["bore"] / 2 + 0.045, 2.2, align=CENTER)
            - Cylinder(D["bore"] / 2, 2.3, align=CENTER)
        )
        liners = tube if liners is None else liners + tube
    cutaway = liners - Pos(0, -1.2, 0.98) * Box(8, 2.4, 3, align=CENTER)
    return liners, cutaway


def make_manifold(front: bool):
    y = -1.74 if front else 1.74
    manifold = Pos(0, y, 2.38) * axis_x_cylinder(0.19 if front else 0.22, 7.25)
    for x in CYLINDER_X:
        branch = Pos(x, y / 2 + (-0.08 if front else 0.08), 2.38) * axis_y_cylinder(
            0.14 if front else 0.17, 1.45
        )
        manifold += branch
    return manifold


def make_piston():
    piston = Cylinder(D["bore"] / 2 - 0.055, D["pistonHeight"], align=CENTER)
    piston += Pos(0, 0, D["pistonHeight"] / 2) * Cylinder(
        D["bore"] / 2 - 0.045, 0.08, align=CENTER
    )
    piston -= axis_x_cylinder(D["pistonPinHoleRadius"], 1.4)
    piston += axis_x_cylinder(D["pistonPinRadius"], 0.82)
    for z in (0.19, 0.29):
        piston += Pos(0, 0, z) * Torus(D["bore"] / 2 - 0.055, 0.018)
    return piston


def make_rod():
    length = D["rodLength"]
    rod = Box(0.23, 0.16, length - 0.55, align=CENTER)
    big_end = Pos(0, 0, -length / 2) * (
        axis_x_cylinder(0.24, 0.28)
        - axis_x_cylinder(D["rodBigEndBoreRadius"], 0.38)
    )
    small_end = Pos(0, 0, length / 2) * (
        axis_x_cylinder(0.16, 0.28)
        - axis_x_cylinder(D["rodSmallEndBoreRadius"], 0.38)
    )
    return rod + big_end + small_end


def make_crankshaft():
    main_journal_x = [-3.1, -1.55, 0, 1.55, 3.1]
    crank = None
    for x in main_journal_x:
        journal = Pos(x, 0, 0) * axis_x_cylinder(0.2, 0.46)
        crank = journal if crank is None else crank + journal

    crank += Pos(-3.72, 0, 0) * axis_x_cylinder(0.16, 0.95)
    crank += Pos(3.72, 0, 0) * axis_x_cylinder(0.16, 0.95)

    for index, x in enumerate(CYLINDER_X):
        phase = 1 if index in (0, 3) else -1
        pin_z = phase * D["crankRadius"]
        crank += Pos(x, 0, pin_z) * axis_x_cylinder(D["crankPinRadius"], 0.76)
        for offset in (-0.38, 0.38):
            web_x = x + offset
            crank += Pos(web_x, 0, pin_z / 2) * Box(
                0.14, 0.36, 1.16, align=CENTER
            )
            crank += Pos(web_x, 0, -phase * 0.42) * axis_x_cylinder(0.38, 0.14)

    for x in (-3.22, 3.22):
        crank += Pos(x, 0, 0) * axis_x_cylinder(0.3, 0.16)
    return crank


def make_flywheel():
    wheel = axis_x_cylinder(1.02, 0.24)
    wheel -= axis_x_cylinder(0.18, 0.4)
    for angle in (0, 90, 180, 270):
        hole = Pos(0, np.sin(np.deg2rad(angle)) * 0.62, np.cos(np.deg2rad(angle)) * 0.62)
        wheel -= hole * axis_x_cylinder(0.13, 0.4)
    return wheel


def make_valve(exhaust: bool):
    valve = Cylinder(0.045, 0.82, align=CENTER)
    valve += Pos(0, 0, -0.44) * Cylinder(0.19 if exhaust else 0.17, 0.09, align=CENTER)
    valve += Pos(0, 0, 0.43) * Cylinder(0.085, 0.06, align=CENTER)
    return valve


def make_spark_plug():
    plug = Cylinder(0.07, 0.48, align=CENTER)
    plug += Pos(0, 0, 0.25) * Cylinder(0.11, 0.1, align=CENTER)
    plug += Pos(0, 0, -0.27) * Cylinder(0.025, 0.13, align=CENTER)
    return plug


def make_camshaft(exhaust: bool):
    cam = axis_x_cylinder(0.09, 7.75)
    y_offset = -0.11 if exhaust else 0.11
    for x in CYLINDER_X:
        cam += Pos(x, y_offset, 0) * axis_x_cylinder(0.23, 0.16)
    for x in (-3.45, 3.45):
        cam += Pos(x, 0, 0) * axis_x_cylinder(0.2, 0.13)
    return cam


def make_spur_gear(
    teeth: int,
    root_radius: float,
    outer_radius: float,
    thickness: float,
    bore_radius: float,
):
    gear = axis_x_cylinder(root_radius, thickness)
    tooth_depth = outer_radius - root_radius
    tooth_radius = root_radius + tooth_depth / 2
    tooth_width = 2 * np.pi * root_radius / teeth * 0.56
    for angle in np.linspace(0, 360, teeth, endpoint=False):
        radians = np.deg2rad(angle)
        y = np.sin(radians) * tooth_radius
        z = np.cos(radians) * tooth_radius
        tooth = Box(
            thickness + 0.02,
            tooth_width,
            tooth_depth + 0.025,
            align=CENTER,
        )
        gear += Pos(0, y, z) * Rot(-angle, 0, 0) * tooth
    gear -= axis_x_cylinder(bore_radius, thickness + 0.12)
    return gear


def make_timing_gear():
    return make_spur_gear(
        teeth=D["timingGearTeeth"],
        root_radius=0.48,
        outer_radius=0.63,
        thickness=0.16,
        bore_radius=0.11,
    )


def shape_to_mesh(shape, name: str):
    vertices, faces = shape.tessellate(0.045, 0.12)
    points = np.asarray([[point.X, point.Z, -point.Y] for point in vertices], dtype=np.float32)
    triangles = np.asarray(faces, dtype=np.int64)
    mesh = trimesh.Trimesh(vertices=points, faces=triangles, process=True)
    material = trimesh.visual.material.PBRMaterial(
        name=f"{name}Material",
        baseColorFactor=COLOURS[name],
        metallicFactor=0.62,
        roughnessFactor=0.31,
    )
    mesh.visual = trimesh.visual.TextureVisuals(material=material)
    return mesh


def export_model():
    block_full, block_cutaway = make_block()
    head_full, head_cutaway = make_head()
    sump_full, sump_cutaway = make_sump()
    liners_full, liners_cutaway = make_liners()

    shapes = {
        "BlockFull": block_full,
        "BlockCutaway": block_cutaway,
        "HeadFull": head_full,
        "HeadCutaway": head_cutaway,
        "SumpFull": sump_full,
        "SumpCutaway": sump_cutaway,
        "LinersFull": liners_full,
        "LinersCutaway": liners_cutaway,
        "IntakeManifold": make_manifold(True),
        "ExhaustManifold": make_manifold(False),
        "Piston": make_piston(),
        "Rod": make_rod(),
        "Crankshaft": make_crankshaft(),
        "Flywheel": make_flywheel(),
        "IntakeValve": make_valve(False),
        "ExhaustValve": make_valve(True),
        "SparkPlug": make_spark_plug(),
        "IntakeCamshaft": make_camshaft(False),
        "ExhaustCamshaft": make_camshaft(True),
        "TimingGear": make_timing_gear(),
    }

    scene = trimesh.Scene(base_frame="EngineRoot")
    triangle_count = 0
    for name, shape in shapes.items():
        mesh = shape_to_mesh(shape, name)
        triangle_count += len(mesh.faces)
        scene.add_geometry(mesh, node_name=name, geom_name=name)

    MODEL_PATH.parent.mkdir(parents=True, exist_ok=True)
    MODEL_PATH.write_bytes(scene.export(file_type="glb"))
    return triangle_count


def export_manifest(triangle_count: int):
    manifest = {
        "version": 1,
        "model": "/models/inline-four-engine.glb",
        "dimensions": D,
        "cylinderX": CYLINDER_X,
        "crankPhases": [0, 180, 180, 0],
        "firingOffsets": [0, 180, 540, 360],
        "triangleCount": triangle_count,
        "hotspots": {
            "piston": [CYLINDER_X[0], 1.25, 0.55],
            "connecting-rod": [CYLINDER_X[0], -0.35, 0.62],
            "crankshaft": [0, D["crankY"], 0.72],
            "crank-journal": [CYLINDER_X[1], D["crankY"] - 0.1, 0.66],
            "counterweight": [CYLINDER_X[2] + 0.38, D["crankY"] - 0.42, 0.25],
            "intake-valve": [CYLINDER_X[1], 2.55, 0.52],
            "exhaust-valve": [CYLINDER_X[2], 2.55, -0.52],
            "intake-manifold": [0, 2.38, 1.74],
            "exhaust-manifold": [0, 2.38, -1.74],
            "cylinder-block": [3.2, 0.4, 0.65],
            "spark-plug": [CYLINDER_X[0], 2.72, 0],
            "camshaft": [0, 3.02, 0.48],
            "flywheel": [-4.05, D["crankY"], 0],
        },
    }
    MANIFEST_PATH.parent.mkdir(parents=True, exist_ok=True)
    MANIFEST_PATH.write_text(json.dumps(manifest, indent=2) + "\n")


if __name__ == "__main__":
    triangles = export_model()
    export_manifest(triangles)
    print(f"Generated {MODEL_PATH.relative_to(ROOT)} with {triangles:,} triangles")
