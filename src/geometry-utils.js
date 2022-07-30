import { AssertSlopeIntercept } from './point'

export const Distance = (p0, p1) =>
  Math.sqrt(Math.pow(p0[0] - p1[0], 2) + Math.pow(p0[1] - p1[1], 2))

export const ToLine = (p0, p1) => {
  const dX = p1[0] - p0[0]
  const m = dX === 0 ? Infinity : (p1[1] - p0[1]) / dX
  const k = p1[1] - m * p0[0]
  AssertSlopeIntercept([m, k])
  return [m, k]
}

export const SegmentLengths = (points) => {
  const lengths = []
  for (let i = 0; i < points.length; i++) {
    lengths[i] = Distance(points[i], points[(i + 1) % points.length])
  }
  return lengths
}

export const Area = (tri) => {
  const slist = SegmentLengths(tri)
  const a = slist[0]
  const b = slist[1]
  const c = slist[2]
  const s = (a + b + c) / 2
  return Math.sqrt(s * (s - a) * (s - b) * (s - c))
}
