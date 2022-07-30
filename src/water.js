import { stroke } from './stroke'

export function water (xoff, yoff, seed, Noise, args = {}) {
  const { hei = 2, len = 800, clu = 10 } = args
  let canv = ''

  const ptlist = []
  let yk = 0
  for (let i = 0; i < clu; i++) {
    ptlist.push([])
    const xk = (Math.random() - 0.5) * (len / 8)
    yk += Math.random() * 5
    const lk = len / 4 + Math.random() * (len / 4)
    const reso = 5
    for (let j = -lk; j < lk; j += reso) {
      ptlist[ptlist.length - 1].push([
        j + xk,
        Math.sin(j * 0.2) * hei * Noise.noise(j * 0.1) - 20 + yk
      ])
    }
  }

  for (let j = 1; j < ptlist.length; j += 1) {
    canv += stroke(
      ptlist[j].map(function (x) {
        return [x[0] + xoff, x[1] + yoff]
      }),
      {
        col: 'rgba(100,100,100,' + (0.3 + Math.random() * 0.3).toFixed(3) + ')',
        wid: 1
      },
      Noise
    )
  }

  return canv
}
