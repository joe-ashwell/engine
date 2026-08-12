export function valveMotion(
  localAngle: number,
  intake: boolean,
  maximumLift: number,
) {
  if (intake && localAngle < 180) {
    return Math.sin((localAngle * Math.PI) / 180) * maximumLift;
  }
  if (!intake && localAngle >= 540) {
    return Math.sin(((localAngle - 540) * Math.PI) / 180) * maximumLift;
  }
  return 0;
}
