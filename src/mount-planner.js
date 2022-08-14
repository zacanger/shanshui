import { rand } from './rand.js'

export class MountPlanner {
  constructor (Noise, MEM) {
    this.Noise = Noise
    this.MEM = MEM
  }

  locmax (x, y, f, r) {
    const z0 = f(x, y)
    if (z0 <= 0.3) {
      return false
    }

    for (let i = x - r; i < x + r; i++) {
      for (let j = y - r; j < y + r; j++) {
        if (f(i, j) > z0) {
          return false
        }
      }
    }

    return true
  }

  chadd (reg, r, mind = 10) {
    for (let k = 0; k < reg.length; k++) {
      if (Math.abs(reg[k].x - r.x) < mind) {
        return false
      }
    }

    reg.push(r)
    return true
  }

  mountplanner (xmin, xmax) {
    const reg = []
    const samp = 0.03
    const ns = (x, y) => Math.max(this.Noise.noise(x * samp) - 0.55, 0) * 2
    const yr = (x) => this.Noise.noise(x * 0.01, Math.PI)

    const xstep = 5
    const mwid = 200
    for (let i = xmin; i < xmax; i += xstep) {
      const i1 = Math.floor(i / xstep)
      this.MEM.planmtx[i1] = this.MEM.planmtx[i1] || 0
    }

    let j
    for (let i = xmin; i < xmax; i += xstep) {
      for (j = 0; j < yr(i) * 480; j += 30) {
        if (this.locmax(i, j, ns, 2)) {
          const xof = i + 2 * (rand() - 0.5) * 500
          const yof = j + 300
          const r = { tag: 'mount', x: xof, y: yof, h: ns(i, j) }
          const res = this.chadd(reg, r)
          if (res) {
            for (
              let k = Math.floor((xof - mwid) / xstep);
              k < (xof + mwid) / xstep;
              k++
            ) {
              this.MEM.planmtx[k] += 1
            }
          }
        }
      }

      if (Math.abs(i) % 1000 < Math.max(1, xstep - 1)) {
        const r = {
          tag: 'distmount',
          x: i,
          y: 280 - rand() * 50,
          h: ns(i, j)
        }
        this.chadd(reg, r)
      }
    }

    for (let i = xmin; i < xmax; i += xstep) {
      if (this.MEM.planmtx[Math.floor(i / xstep)] === 0) {
        if (rand() < 0.01) {
          for (let j = 0; j < 4 * rand(); j++) {
            const r = {
              tag: 'flatmount',
              x: i + 2 * (rand() - 0.5) * 700,
              y: 700 - j * 50,
              h: ns(i, j)
            }
            this.chadd(reg, r)
          }
        }
      }
    }

    for (let i = xmin; i < xmax; i += xstep) {
      if (rand() < 0.2) {
        const r = { tag: 'boat', x: i, y: 300 + rand() * 390 }
        this.chadd(reg, r, 400)
      }
    }

    return reg
  }
}
