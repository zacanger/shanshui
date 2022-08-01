import { Area, SegmentLengths, ToLine } from './geometry-utils.js'
import { AssertPoint, AssertTriangle } from './point.js'

export class PolyTools {
  constructor () {
    this.area = 100
    this.convex = false
    this.optimize = true
  }

  midPt (points) {
    const point = points.reduce(
      (acc, v) =>
        [v[0] / points.length + acc[0], v[1] / points.length + acc[1]],
      [0, 0])
    AssertPoint(point)
    return point
  }

  sliverRatio (plist) {
    AssertTriangle(plist)
    const A = Area(plist)
    const P = SegmentLengths(plist).reduce((m, n) => m + n, 0)
    return A / P
  }

  shatter (plist, maxArea) {
    if (plist.length === 0) {
      return []
    }
    AssertTriangle(plist)
    if (Area(plist) < maxArea) {
      return [plist]
    }

    const slist = SegmentLengths(plist)
    const rightMostIndex = slist.reduce(
      (iMax, x, i, arr) => (x > arr[iMax] ? i : iMax),
      0
    )
    const nextIndex = (rightMostIndex + 1) % plist.length
    const previousIndex = (rightMostIndex + 2) % plist.length
    let mid
    try {
      mid = this.midPt([plist[rightMostIndex], plist[nextIndex]])
    } catch (err) {
      return []
    }

    return this.shatter([plist[rightMostIndex], mid, plist[previousIndex]], maxArea)
      .concat(this.shatter([plist[previousIndex], plist[nextIndex], mid], maxArea)
      )
  }

  inBounds (p, ln) {
    // non-inclusive
    return (
      Math.min(ln[0][0], ln[1][0]) <= p[0] &&
            p[0] <= Math.max(ln[0][0], ln[1][0]) &&
            Math.min(ln[0][1], ln[1][1]) <= p[1] &&
            p[1] <= Math.max(ln[0][1], ln[1][1])
    )
  }

  intersect (ln0, ln1) {
    const le0 = ToLine(ln0[0], ln0[1])
    const le1 = ToLine(ln1[0], ln1[1])
    const dSlope = le0[0] - le1[0]
    if (dSlope === 0) {
      return undefined
    }
    const x = (le1[1] - le0[1]) / dSlope
    const y = le0[0] * x + le0[1]
    if (this.inBounds([x, y], ln0) && this.inBounds([x, y], ln1)) {
      return [x, y]
    }
    return undefined
  }

  ptInPoly (pt, plist) {
    let scount = 0
    for (let i = 0; i < plist.length; i++) {
      const np = plist[i !== plist.length - 1 ? i + 1 : 0]
      const sect = this.intersect(
        [plist[i], np],
        [pt, [pt[0] + 999, pt[1] + 999]]
      )
      if (sect) {
        scount++
      }
    }
    return scount % 2 === 1
  }

  lnInPoly (ln, plist) {
    const lnc = [[0, 0], [0, 0]]
    const ep = 0.01

    lnc[0][0] = ln[0][0] * (1 - ep) + ln[1][0] * ep
    lnc[0][1] = ln[0][1] * (1 - ep) + ln[1][1] * ep
    lnc[1][0] = ln[0][0] * ep + ln[1][0] * (1 - ep)
    lnc[1][1] = ln[0][1] * ep + ln[1][1] * (1 - ep)

    for (let i = 0; i < plist.length; i++) {
      const pt = plist[i]
      const np = plist[i !== plist.length - 1 ? i + 1 : 0]
      if (this.intersect(lnc, [pt, np])) {
        return false
      }
    }

    const mid = this.midPt(ln)
    if (!(this.ptInPoly(mid, plist))) {
      return false
    }
    return true
  }

  bestEar (plist) {
    const cuts = []
    for (let i = 0; i < plist.length; i++) {
      const pt = plist[i]
      const lp = plist[i !== 0 ? i - 1 : plist.length - 1]
      const np = plist[i !== plist.length - 1 ? i + 1 : 0]
      const qlist = plist.slice()
      qlist.splice(i, 1)
      if (this.convex || this.lnInPoly([lp, np], plist)) {
        if (!this.optimize) {
          return [[lp, pt, np], qlist]
        }
        cuts.push([[lp, pt, np], qlist])
      }
    }
    let best = [plist, []]
    let bestRatio = 0
    for (let i = 0; i < cuts.length; i++) {
      const r = this.sliverRatio(cuts[i][0])
      if (r >= bestRatio) {
        best = cuts[i]
        bestRatio = r
      }
    }

    return best
  }

  triangulate (plist, args = {}) {
    const {
      area = 100,
      convex = false,
      optimize = true
    } = args
    this.area = area
    this.convex = convex
    this.optimize = optimize

    if (plist.length <= 3) {
      return this.shatter(plist, this.area)
    } else {
      const cut = this.bestEar(plist)
      return this.shatter(cut[0], this.area).concat(
        this.triangulate(cut[1], args)
      )
    }
  }
}
