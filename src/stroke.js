import { poly } from './utils.js'
import { rand } from './rand.js'

export function stroke (ptlist, args = {}, noise) {
  const {
    xof = 0,
    yof = 0,
    wid = 2,
    col = 'rgba(200,200,200,0.9)',
    noi = 0.5,
    out = 1,
    fun = (x) => Math.sin(x * Math.PI)
  } = args

  if (ptlist.length === 0) {
    return ''
  }

  const vtxlist0 = []
  const vtxlist1 = []
  let vtxlist = []
  const n0 = rand() * 10

  for (let i = 1; i < ptlist.length - 1; i++) {
    let w = wid * fun(i / ptlist.length)
    w = w * (1 - noi) + w * noi * noise.noise(i * 0.5, n0)
    const a1 = Math.atan2(
      ptlist[i][1] - ptlist[i - 1][1],
      ptlist[i][0] - ptlist[i - 1][0]
    )
    const a2 = Math.atan2(
      ptlist[i][1] - ptlist[i + 1][1],
      ptlist[i][0] - ptlist[i + 1][0]
    )
    let a = (a1 + a2) / 2
    if (a < a2) {
      a += Math.PI
    }
    vtxlist0.push([
      ptlist[i][0] + w * Math.cos(a),
      ptlist[i][1] + w * Math.sin(a)
    ])
    vtxlist1.push([
      ptlist[i][0] - w * Math.cos(a),
      ptlist[i][1] - w * Math.sin(a)
    ])
  }

  vtxlist = [ptlist[0]]
    .concat(
      vtxlist0.concat(vtxlist1.concat([ptlist[ptlist.length - 1]]).reverse())
    )
    .concat([ptlist[0]])

  const canv = poly(
    vtxlist.map((x) => [x[0] + xof, x[1] + yof]),
    { fil: col, str: col, wid: out }
  )

  return canv
}
