import { rand } from './rand.js'

export const distance = (p0, p1) =>
  Math.sqrt(Math.pow(p0[0] - p1[0], 2) + Math.pow(p0[1] - p1[1], 2))

export const mapval = (value, istart, istop, ostart, ostop) =>
  ostart + (ostop - ostart) * (((value - istart) * 1.0) / (istop - istart))

export const loopNoise = (noiseList) => {
  const dif = noiseList[noiseList.length - 1] - noiseList[0]
  const bounds = [100, -100]

  for (let i = 0; i < noiseList.length; i++) {
    noiseList[i] += (dif * (noiseList.length - 1 - i)) / (noiseList.length - 1)
    if (noiseList[i] < bounds[0]) bounds[0] = noiseList[i]
    if (noiseList[i] > bounds[1]) bounds[1] = noiseList[i]
  }

  for (let j = 0; j < noiseList.length; j++) {
    noiseList[j] = mapval(noiseList[j], bounds[0], bounds[1], 0, 1)
  }
}

export const randChoice = (arr) => arr[Math.floor(arr.length * rand())]

export const normRand = (m, M) => mapval(rand(), 0, 1, m, M)

export const wtrand = (weightFunction) => {
  const x = rand()
  const y = rand()

  if (y < weightFunction(x)) {
    return x
  }

  return wtrand(weightFunction)
}

export const randGaussian = () =>
  wtrand((x) => Math.pow(Math.E, -24 * Math.pow(x - 0.5, 2))) * 2 - 1

export const bezmh = (polyTool, P, w = 1) => {
  if (P.length === 2) {
    P = [P[0], polyTool.midPt([P[0], P[1]]), P[1]]
  }

  const plist = []
  for (let j = 0; j < P.length - 2; j++) {
    let p0
    let p2
    if (j === 0) {
      p0 = P[j]
    } else {
      p0 = polyTool.midPt([P[j], P[j + 1]])
    }

    const p1 = P[j + 1]
    if (j === P.length - 3) {
      p2 = P[j + 2]
    } else {
      p2 = polyTool.midPt([P[j + 1], P[j + 2]])
    }

    const pl = 20
    for (let i = 0; i < pl + ((j === P.length - 3) ? 1 : 0); i += 1) {
      const t = i / pl
      const u = Math.pow(1 - t, 2) + 2 * t * (1 - t) * w + t * t
      plist.push([
        (Math.pow(1 - t, 2) * p0[0] +
          2 * t * (1 - t) * p1[0] * w +
          t * t * p2[0]) / u,

        (Math.pow(1 - t, 2) * p0[1] +
          2 * t * (1 - t) * p1[1] * w +
          t * t * p2[1]) / u
      ])
    }
  }
  return plist
}

export const poly = (plist, args = {}) => {
  const {
    xof = 0,
    yof = 0,
    fil = 'rgba(0,0,0,0)',
    str = 'rgba(0,0,0,0)',
    wid = 0
  } = args

  let canv = "<polyline points='"
  for (let i = 0; i < plist.length; i++) {
    canv += ' ' +
      (plist[i][0] + xof).toFixed(1) +
      ',' + (plist[i][1] + yof).toFixed(1)
  }

  canv +=
    "' style='fill:" +
    fil +
    ';stroke:' +
    str +
    ';stroke-width:' +
    wid +
    "'/>"
  return canv
}
