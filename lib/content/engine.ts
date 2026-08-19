export type PartId =
  | "piston"
  | "crankshaft"
  | "connecting-rod"
  | "intake-valve"
  | "exhaust-valve"
  | "spark-plug"
  | "camshaft"
  | "flywheel"
  | "cylinder-block"
  | "crank-journal"
  | "counterweight"
  | "intake-manifold"
  | "exhaust-manifold"
  | "cylinder-head"
  | "sump"
  | "liners"
  | "timing-gear";

export type StrokeId = "intake" | "compression" | "power" | "exhaust";

export type EnginePart = {
  id: PartId;
  name: string;
  shortName: string;
  summary: string;
  detail: string;
  fact: string;
  colour: string;
};

export const engineParts: EnginePart[] = [
  {
    id: "piston",
    name: "Pistons",
    shortName: "Pistons",
    summary: "Four pistons turn gas pressure into force.",
    detail:
      "Pistons 1 and 4 move as a pair. Pistons 2 and 3 move in the opposite direction.",
    fact: "Each piston completes one power stroke for every two crank turns.",
    colour: "#d8d2c7",
  },
  {
    id: "connecting-rod",
    name: "Connecting rods",
    shortName: "Con rods",
    summary: "Link each piston to the crankshaft.",
    detail:
      "Each rod carries force from its piston and swings within the crankcase as the crank turns.",
    fact: "Exact rod length and crank offset keep the piston inside its bore.",
    colour: "#b8a890",
  },
  {
    id: "crankshaft",
    name: "Crankshaft",
    shortName: "Crankshaft",
    summary: "Changes straight motion into rotary motion.",
    detail:
      "Four offset crank pins turn piston movement into one smooth rotary output.",
    fact: "Pistons 1 and 4 share one phase; pistons 2 and 3 share the other.",
    colour: "#716a62",
  },
  {
    id: "crank-journal",
    name: "Crank journals",
    shortName: "Crank journal",
    summary: "Offset journals carry the connecting-rod big ends.",
    detail:
      "Each journal moves in a circle. Its offset from the main axis sets the piston stroke.",
    fact: "Journals for cylinders 1 and 4 sit opposite those for cylinders 2 and 3.",
    colour: "#69635d",
  },
  {
    id: "counterweight",
    name: "Counterweights",
    shortName: "Counterweight",
    summary: "Balance part of the moving crank and rod mass.",
    detail:
      "Each weight sits opposite a crank journal to cut bearing loads and vibration.",
    fact: "Counterweights reduce load but cannot remove all inline-four vibration.",
    colour: "#5f5b56",
  },
  {
    id: "cylinder-block",
    name: "Cylinder block",
    shortName: "Cylinder block",
    summary: "Supports the cylinders and main crank bearings.",
    detail:
      "The block keeps each bore, crank journal and head face in close alignment.",
    fact: "Coolant passages in a real block remove heat from the cylinder walls.",
    colour: "#40504f",
  },
  {
    id: "intake-valve",
    name: "Intake valves",
    shortName: "Intake",
    summary: "Let the air and fuel mixture enter.",
    detail:
      "The intake camshaft opens each valve only when its cylinder starts the intake stroke.",
    fact: "Valve lift follows a smooth cam profile to prevent sudden contact.",
    colour: "#7aa6a1",
  },
  {
    id: "exhaust-valve",
    name: "Exhaust valves",
    shortName: "Exhaust",
    summary: "Let burnt gas leave each cylinder.",
    detail:
      "The exhaust camshaft opens each valve during its cylinder's exhaust stroke.",
    fact: "Exhaust valves often run hotter than intake valves.",
    colour: "#b87a64",
  },
  {
    id: "spark-plug",
    name: "Spark plugs",
    shortName: "Spark plugs",
    summary: "Start combustion in firing order.",
    detail:
      "The plugs fire in the order 1-3-4-2, with one power event every half turn.",
    fact: "Staggered firing gives smoother output than one cylinder can make.",
    colour: "#e1c15b",
  },
  {
    id: "camshaft",
    name: "Camshafts",
    shortName: "Camshafts",
    summary: "Open all eight valves at the correct time.",
    detail:
      "Separate intake and exhaust camshafts turn once while the crankshaft turns twice.",
    fact: "Valve timing has a large effect on power and fuel use.",
    colour: "#81796f",
  },
  {
    id: "flywheel",
    name: "Flywheel",
    shortName: "Flywheel",
    summary: "Keeps the crankshaft turning smoothly.",
    detail:
      "Its stored energy smooths the four staggered power events and carries the crank between them.",
    fact: "An inline-four still needs a flywheel because its torque is not constant.",
    colour: "#9b9388",
  },
  {
    id: "intake-manifold",
    name: "Intake manifold",
    shortName: "Intake path",
    summary: "Shares fresh charge between the four intake valves.",
    detail:
      "Four branches link the inlet plenum to each cylinder. Flow starts only when its intake valve opens.",
    fact: "Equal branch lengths help each cylinder receive a similar charge.",
    colour: "#46756e",
  },
  {
    id: "exhaust-manifold",
    name: "Exhaust manifold",
    shortName: "Exhaust path",
    summary: "Collects burnt gas from all four exhaust valves.",
    detail:
      "Each branch carries gas from one open exhaust valve to the common outlet.",
    fact: "Branch shape affects pressure waves and cylinder emptying.",
    colour: "#935239",
  },
  {
    id: "cylinder-head",
    name: "Cylinder head",
    shortName: "Head",
    summary: "Closes the top of each cylinder and holds the valves.",
    detail:
      "The head forms the combustion chamber with the piston crown. Ports lead to the intake and exhaust valves.",
    fact: "A real head often carries the camshafts and coolant passages.",
    colour: "#3d4848",
  },
  {
    id: "sump",
    name: "Sump",
    shortName: "Sump",
    summary: "Forms the base of the crankcase and holds oil.",
    detail:
      "The sump bolts under the block and keeps oil around the crankshaft.",
    fact: "Oil from the sump feeds the main and rod bearings.",
    colour: "#292f30",
  },
  {
    id: "liners",
    name: "Cylinder liners",
    shortName: "Liners",
    summary: "Hard sleeves that form the piston bores.",
    detail:
      "Each liner guides a piston and takes the wear of the sliding rings.",
    fact: "Worn liners can be replaced without a new block.",
    colour: "#848a88",
  },
  {
    id: "timing-gear",
    name: "Timing gear",
    shortName: "Timing gear",
    summary: "Keeps the camshafts in time with the crankshaft.",
    detail:
      "The gear turns at half crank speed so each valve opens once per cycle.",
    fact: "Wrong timing can make a valve hit a piston.",
    colour: "#606464",
  },
];

export const strokes = [
  {
    id: "intake",
    name: "Intake",
    range: "0–180°",
    summary: "Piston moves down. Intake valve opens and draws mixture in.",
    detail:
      "The piston moves down and lowers pressure in the cylinder. Fresh mixture enters through the open intake valve.",
  },
  {
    id: "compression",
    name: "Compression",
    range: "180–360°",
    summary: "Both valves close. The piston squeezes the mixture.",
    detail:
      "Both valves stay shut. The piston moves up and raises the pressure and temperature of the trapped mixture.",
  },
  {
    id: "power",
    name: "Power",
    range: "360–540°",
    summary: "The spark lights the mixture. Expanding gas drives the piston down.",
    detail:
      "The spark plug fires near the top of the stroke. Expanding gas drives the piston down and turns the crank.",
  },
  {
    id: "exhaust",
    name: "Exhaust",
    range: "540–720°",
    summary: "Exhaust valve opens. The piston pushes burnt gas out.",
    detail:
      "The exhaust valve opens. The piston moves up and drives burnt gas out through the exhaust path.",
  },
] as const;

export function getStroke(angle: number) {
  return strokes[Math.min(3, Math.floor((angle % 720) / 180))];
}

export const cylinderOffsets = [0, 180, 540, 360] as const;

export function getCylinderStroke(angle: number, cylinder: number) {
  return getStroke((angle + cylinderOffsets[cylinder]) % 720);
}

export function getPart(id: PartId | null) {
  return engineParts.find((part) => part.id === id) ?? null;
}
