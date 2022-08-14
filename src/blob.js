import { loopNoise, poly } from './utils.js'
import { rand } from './rand.js'

export const blob = (x, y, args = {}, noise) => {
  const {
    len = 20,
    wid = 5,
    ang = 0,
    col = 'rgba(200,200,200,0.9)',
    noi = 0.5,
    ret = 0,
    fun = (x) => x <= 1
      ? Math.pow(Math.sin(x * Math.PI), 0.5)
      : -Math.pow(Math.sin((x + 1) * Math.PI), 0.5)
  } = args

  const reso = 20.0
  const lalist = []

  for (let i = 0; i < reso + 1; i++) {
    const p = (i / reso) * 2
    const xo = len / 2 - Math.abs(p - 1) * len
    const yo = (fun(p) * wid) / 2
    const a = Math.atan2(yo, xo)
    const l = Math.sqrt(xo * xo + yo * yo)
    lalist.push([l, a])
  }

  const nslist = []
  const n0 = rand() * 10

  for (let i = 0; i < reso + 1; i++) {
    nslist.push(noise.noise(i * 0.05, n0))
  }

  loopNoise(nslist)
  const plist = []

  for (let i = 0; i < lalist.length; i++) {
    const ns = nslist[i] * noi + (1 - noi)
    const nx = x + Math.cos(lalist[i][1] + ang) * lalist[i][0] * ns
    const ny = y + Math.sin(lalist[i][1] + ang) * lalist[i][0] * ns
    plist.push([nx, ny])
  }

  return ret === 0
    ? poly(plist, { fil: col, str: col, wid: 0 })
    : plist
}
