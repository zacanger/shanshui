import { stroke } from './stroke.js'

export function texture (ptlist, args = {}, noise) {
  const {
    xof = 0,
    yof = 0,
    tex = 400,
    wid = 1.5,
    len = 0.2,
    sha = 0,
    ret = 0,
    noi = (x) => 30 / x,
    col = (_) => 'rgba(100,100,100,' + (Math.random() * 0.3).toFixed(3) + ')',
    dis = () => Math.random() > 0.5
      ? (1 / 3) * Math.random()
      : (1 * 2) / 3 + (1 / 3) * Math.random()
  } = args

  const reso = [ptlist.length, ptlist[0].length]
  const texlist = []
  for (let i = 0; i < tex; i++) {
    const mid = (dis() * reso[1]) | 0
    // mid = (reso[1]/3+reso[1]/3*Math.random())|0

    const hlen = Math.floor(Math.random() * (reso[1] * len))

    let start = mid - hlen
    let end = mid + hlen
    start = Math.min(Math.max(start, 0), reso[1])
    end = Math.min(Math.max(end, 0), reso[1])

    const layer = (i / tex) * (reso[0] - 1)

    texlist.push([])
    for (let j = start; j < end; j++) {
      const p = layer - Math.floor(layer)

      const x = ptlist[Math.floor(layer)][j][0] * p +
        ptlist[Math.ceil(layer)][j][0] * (1 - p)

      const y = ptlist[Math.floor(layer)][j][1] * p +
        ptlist[Math.ceil(layer)][j][1] * (1 - p)

      const ns = [
        noi(layer + 1) * (noise.noise(x, j * 0.5) - 0.5),
        noi(layer + 1) * (noise.noise(y, j * 0.5) - 0.5)
      ]

      texlist[texlist.length - 1].push([x + ns[0], y + ns[1]])
    }
  }
  let canv = ''

  // SHADE
  if (sha) {
    for (let j = 0; j < texlist.length; j += 1 + ((sha !== 0) ? 1 : 0)) {
      canv += stroke(
        texlist[j].map((x) => [x[0] + xof, x[1] + yof]),
        { col: 'rgba(100,100,100,0.1)', wid: sha }, noise
      )
    }
  }

  // TEXTURE
  for (let j = 0 + sha; j < texlist.length; j += 1 + sha) {
    canv += stroke(
      texlist[j].map((x) => [x[0] + xof, x[1] + yof]),
      { col: col(j / texlist.length), wid }, noise
    )
  }

  return ret ? texlist : canv
}
