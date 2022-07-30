import { blob } from './blob'
import { div } from './div'
import { stroke } from './stroke'
import { distance, loopNoise, normRand, poly, randChoice, randGaussian } from './utils'

export class Tree {
  constructor (Noise, PolyTools) {
    this.Noise = Noise
    this.PolyTools = PolyTools
  }

  tree01 (x, y, args = {}) {
    const { hei = 50, wid = 3, col = 'rgba(100,100,100,0.5)' } = args

    const reso = 10
    const nslist = []
    for (let i = 0; i < reso; i++) {
      nslist.push([this.Noise.noise(i * 0.5), this.Noise.noise(i * 0.5, 0.5)])
    }

    let leafcol
    if (col.includes('rgba(')) {
      leafcol = col
        .replace('rgba(', '')
        .replace(')', '')
        .split(',')
    } else {
      leafcol = ['100', '100', '100', '0.5']
    }
    let canv = ''
    const line1 = []
    const line2 = []
    for (let i = 0; i < reso; i++) {
      const nx = x
      const ny = y - (i * hei) / reso
      if (i >= reso / 4) {
        for (let j = 0; j < (reso - i) / 5; j++) {
          canv += blob(
            nx + (Math.random() - 0.5) * wid * 1.2 * (reso - i),
            ny + (Math.random() - 0.5) * wid,
            {
              len: Math.random() * 20 * (reso - i) * 0.2 + 10,
              wid: Math.random() * 6 + 3,
              ang: ((Math.random() - 0.5) * Math.PI) / 6,
              col: 'rgba(' +
                leafcol[0] +
                ',' +
                leafcol[1] +
                ',' +
                leafcol[2] +
                ',' +
                (Math.random() * 0.2 + parseFloat(leafcol[3])).toFixed(1) +
                ')'
            },
            this.Noise
          )
        }
      }
      line1.push([nx + (nslist[i][0] - 0.5) * wid - wid / 2, ny])
      line2.push([nx + (nslist[i][1] - 0.5) * wid + wid / 2, ny])
    }
    canv +=
            poly(line1, { fil: 'none', str: col, wid: 1.5 }) +
            poly(line2, { fil: 'none', str: col, wid: 1.5 })
    return canv
  }

  tree02 (x, y, args = {}) {
    const {
      hei = 16,
      wid = 8,
      clu = 5,
      col = 'rgba(100,100,100,0.5)'
    } = args

    let canv = ''
    for (let i = 0; i < clu; i++) {
      canv += blob(
        x + randGaussian() * clu * 4,
        y + randGaussian() * clu * 4,
        {
          ang: Math.PI / 2,
          fun: function (x) {
            return x <= 1
              ? Math.pow(Math.sin(x * Math.PI) * x, 0.5)
              : -Math.pow(Math.sin((x - 2) * Math.PI * (x - 2)), 0.5)
          },
          wid: Math.random() * wid * 0.75 + wid * 0.5,
          len: Math.random() * hei * 0.75 + hei * 0.5,
          col
        },
        this.Noise
      )
    }
    return canv
  };

  tree03 (x, y, args = {}) {
    const {
      hei = 50,
      wid = 5,
      col = 'rgba(100,100,100,0.5)',
      ben = (_) => 0
    } = args

    const reso = 10
    const nslist = []
    for (let i = 0; i < reso; i++) {
      nslist.push([this.Noise.noise(i * 0.5), this.Noise.noise(i * 0.5, 0.5)])
    }

    const leafcol =
    col.includes('rgba(')
      ? col.replace('rgba(', '').replace(')', '').split(',')
      : ['100', '100', '100', '0.5']

    let canv = ''
    let blobs = ''
    const line1 = []
    const line2 = []
    for (let i = 0; i < reso; i++) {
      const nx = x + ben(i / reso) * 100
      const ny = y - (i * hei) / reso
      if (i >= reso / 5) {
        for (let j = 0; j < (reso - i) * 2; j++) {
          const shape = function (x) {
            return Math.log(50 * x + 1) / 3.95
          }
          const ox = Math.random() * wid * 2 * shape((reso - i) / reso)
          blobs += blob(
            nx + ox * randChoice([-1, 1]),
            ny + (Math.random() - 0.5) * wid * 2,
            {
              len: ox * 2,
              wid: Math.random() * 6 + 3,
              ang: ((Math.random() - 0.5) * Math.PI) / 6,
              col: 'rgba(' +
                leafcol[0] +
                ',' +
                leafcol[1] +
                ',' +
                leafcol[2] +
                ',' +
                (Math.random() * 0.2 + parseFloat(leafcol[3])).toFixed(3) +
                ')'
            },
            this.Noise
          )
        }
      }
      line1.push([
        nx + (((nslist[i][0] - 0.5) * wid - wid / 2) * (reso - i)) / reso,
        ny
      ])
      line2.push([
        nx + (((nslist[i][1] - 0.5) * wid + wid / 2) * (reso - i)) / reso,
        ny
      ])
    }
    const lc = line1.concat(line2.reverse())
    canv += poly(lc, { fil: 'white', str: col, wid: 1.5 })
    canv += blobs
    return canv
  }

  branch (args = {}) {
    const {
      hei = 300,
      wid = 6,
      ang = 0,
      det = 10,
      ben = Math.PI * 0.2
    } = args

    let nx = 0
    let ny = 0
    const tlist = [[nx, ny]]
    let a0 = 0
    const g = 3

    for (let i = 0; i < g; i++) {
      a0 += (ben / 2 + (Math.random() * ben) / 2) * randChoice([-1, 1])
      nx += (Math.cos(a0) * hei) / g
      ny -= (Math.sin(a0) * hei) / g
      tlist.push([nx, ny])
    }

    const ta = Math.atan2(
      tlist[tlist.length - 1][1],
      tlist[tlist.length - 1][0]
    )

    for (let i = 0; i < tlist.length; i++) {
      const a = Math.atan2(tlist[i][1], tlist[i][0])
      const d = Math.sqrt(
        tlist[i][0] * tlist[i][0] + tlist[i][1] * tlist[i][1]
      )
      tlist[i][0] = d * Math.cos(a - ta + ang)
      tlist[i][1] = d * Math.sin(a - ta + ang)
    }

    const trlist1 = []
    const trlist2 = []
    const span = det
    const tl = (tlist.length - 1) * span
    let lx = 0
    let ly = 0

    for (let i = 0; i < tl; i += 1) {
      const lastp = tlist[Math.floor(i / span)]
      const nextp = tlist[Math.ceil(i / span)]
      const p = (i % span) / span
      const nx = lastp[0] * (1 - p) + nextp[0] * p
      const ny = lastp[1] * (1 - p) + nextp[1] * p

      const ang = Math.atan2(ny - ly, nx - lx)
      const woff = ((this.Noise.noise(i * 0.3) - 0.5) * wid * hei) / 80

      let b = 0
      if (p === 0) {
        b = Math.random() * wid
      }

      const nw = wid * (((tl - i) / tl) * 0.5 + 0.5)
      trlist1.push([
        nx + Math.cos(ang + Math.PI / 2) * (nw + woff + b),
        ny + Math.sin(ang + Math.PI / 2) * (nw + woff + b)
      ])
      trlist2.push([
        nx + Math.cos(ang - Math.PI / 2) * (nw - woff + b),
        ny + Math.sin(ang - Math.PI / 2) * (nw - woff + b)
      ])
      lx = nx
      ly = ny
    }

    return [trlist1, trlist2]
  }

  twig (tx, ty, dep, args = {}) {
    const {
      dir = 1,
      sca = 1,
      wid = 1,
      ang = 0,
      lea = [true, 12]
    } = args

    let canv = ''
    const twlist = []
    const tl = 10
    const hs = Math.random() * 0.5 + 0.5
    const fun2 = (x) => -1 / Math.pow(x / tl + 1, 5) + 1
    const tfun = randChoice([fun2])
    const a0 = ((Math.random() * Math.PI) / 6) * dir + ang

    for (let i = 0; i < tl; i++) {
      const mx = dir * tfun(i / tl) * 50 * sca * hs
      const my = -i * 5 * sca

      const a = Math.atan2(my, mx)
      const d = Math.pow(mx * mx + my * my, 0.5)

      const nx = Math.cos(a + a0) * d
      const ny = Math.sin(a + a0) * d

      twlist.push([nx + tx, ny + ty])

      if ((i === ((tl / 3) | 0) || i === (((tl * 2) / 3) | 0)) && dep > 0) {
        canv += this.twig(nx + tx, ny + ty, dep - 1, {
          ang,
          sca: sca * 0.8,
          wid,
          dir: dir * randChoice([-1, 1]),
          lea
        })
      }

      if (i === tl - 1 && lea[0] === true) {
        for (let j = 0; j < 5; j++) {
          const dj = (j - 2.5) * 5
          canv += blob(
            nx + tx + Math.cos(ang) * dj * wid,
            ny + ty + (Math.sin(ang) * dj - lea[1] / (dep + 1)) * wid,
            {
              wid: (6 + 3 * Math.random()) * wid,
              len: (15 + 12 * Math.random()) * wid,
              ang: ang / 2 + Math.PI / 2 + Math.PI * 0.2 * (Math.random() - 0.5),
              col: 'rgba(100,100,100,' + (0.5 + dep * 0.2).toFixed(3) + ')',
              fun: (x) => x <= 1
                ? Math.pow(Math.sin(x * Math.PI) * x, 0.5)
                : -Math.pow(Math.sin((x - 2) * Math.PI * (x - 2)), 0.5)
            },
            this.Noise
          )
        }
      }
    }
    canv += stroke(twlist, {
      wid: 1,
      fun: (x) => Math.cos((x * Math.PI) / 2),
      col: 'rgba(100,100,100,0.5)'
    }, this.Noise)
    return canv
  }

  #bark (x, y, wid, ang) {
    const len = 10 + 10 * Math.random()
    const noi = 0.5
    const fun = (x) => x <= 1
      ? Math.pow(Math.sin(x * Math.PI), 0.5)
      : -Math.pow(Math.sin((x + 1) * Math.PI), 0.5)
    const reso = 20.0
    let canv = ''

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
    const n0 = Math.random() * 10
    for (let i = 0; i < reso + 1; i++) {
      nslist.push(this.Noise.noise(i * 0.05, n0))
    }

    loopNoise(nslist)
    const brklist = []
    for (let i = 0; i < lalist.length; i++) {
      const ns = nslist[i] * noi + (1 - noi)
      const nx = x + Math.cos(lalist[i][1] + ang) * lalist[i][0] * ns
      const ny = y + Math.sin(lalist[i][1] + ang) * lalist[i][0] * ns
      brklist.push([nx, ny])
    }
    const fr = Math.random()
    canv += stroke(brklist, {
      wid: 0.8,
      noi: 0,
      col: 'rgba(100,100,100,0.4)',
      out: 0,
      fun: (x) => Math.sin((x + fr) * Math.PI * 3)
    }, this.Noise)

    return canv
  }

  barkify (x, y, trlist) {
    let canv = ''

    for (let i = 2; i < trlist[0].length - 1; i++) {
      const a0 = Math.atan2(
        trlist[0][i][1] - trlist[0][i - 1][1],
        trlist[0][i][0] - trlist[0][i - 1][0]
      )
      const a1 = Math.atan2(
        trlist[1][i][1] - trlist[1][i - 1][1],
        trlist[1][i][0] - trlist[1][i - 1][0]
      )
      const p = Math.random()
      const nx = trlist[0][i][0] * (1 - p) + trlist[1][i][0] * p
      const ny = trlist[0][i][1] * (1 - p) + trlist[1][i][1] * p
      if (Math.random() < 0.2) {
        canv += blob(nx + x, ny + y, {
          noi: 1,
          len: 15,
          wid: 6 - Math.abs(p - 0.5) * 10,
          ang: (a0 + a1) / 2,
          col: 'rgba(100,100,100,0.6)'
        }, this.Noise)
      } else {
        canv += this.bark(
          nx + x,
          ny + y,
          5 - Math.abs(p - 0.5) * 10,
          (a0 + a1) / 2
        )
      }

      if (Math.random() < 0.05) {
        const jl = Math.random() * 2 + 2
        const xya = randChoice([
          [trlist[0][i][0], trlist[0][i][1], a0],
          [trlist[1][i][0], trlist[1][i][1], a1]
        ])
        for (let j = 0; j < jl; j++) {
          canv += blob(
            xya[0] + x + Math.cos(xya[2]) * (j - jl / 2) * 4,
            xya[1] + y + Math.sin(xya[2]) * (j - jl / 2) * 4,
            {
              wid: 4,
              len: 4 + 6 * Math.random(),
              ang: a0 + Math.PI / 2,
              col: 'rgba(100,100,100,0.6)'
            }, this.Noise
          )
        }
      }
    }
    const trflist = trlist[0].concat(trlist[1].slice().reverse())
    const rglist = [[]]
    for (let i = 0; i < trflist.length; i++) {
      if (Math.random() < 0.5) {
        rglist.push([])
      } else {
        rglist[rglist.length - 1].push(trflist[i])
      }
    }

    for (let i = 0; i < rglist.length; i++) {
      rglist[i] = div(rglist[i], 4)
      for (let j = 0; j < rglist[i].length; j++) {
        rglist[i][j][0] += (this.Noise.noise(i, j * 0.1, 1) - 0.5) * (15 + 5 * randGaussian())
        rglist[i][j][1] += (this.Noise.noise(i, j * 0.1, 2) - 0.5) * (15 + 5 * randGaussian())
      }
      canv += stroke(
        rglist[i].map((v) => [v[0] + x, v[1] + y]),
        { wid: 1.5, col: 'rgba(100,100,100,0.7)', out: 0 },
        this.Noise
      )
    }
    return canv
  }

  tree04 (x, y, args = {}) {
    const {
      hei = 300,
      wid = 6,
      col = 'rgba(100,100,100,0.5)'
    } = args

    let canv = ''
    let txcanv = ''
    let twcanv = ''

    const trlist2 = this.branch({ hei, wid, ang: -Math.PI / 2 })
    txcanv += this.barkify(x, y, trlist2)
    const trlist = trlist2[0].concat(trlist2[1].reverse())

    let trmlist = []

    for (let i = 0; i < trlist.length; i++) {
      if (
        (i >= trlist.length * 0.3 &&
          i <= trlist.length * 0.7 &&
          Math.random() < 0.1) ||
        i === trlist.length / 2 - 1
      ) {
        const ba = Math.PI * 0.2 - Math.PI * 1.4 * ((i > trlist.length / 2) ? 1 : 0)
        const brlist = this.branch({
          hei: hei * (Math.random() + 1) * 0.3,
          wid: wid * 0.5,
          ang: ba
        })

        brlist[0].splice(0, 1)
        brlist[1].splice(0, 1)
        const foff = (v) => [v[0] + trlist[i][0], v[1] + trlist[i][1]]
        txcanv += this.barkify(x, y, [brlist[0].map(foff), brlist[1].map(foff)])

        for (let j = 0; j < brlist[0].length; j++) {
          if (Math.random() < 0.2 || j === brlist[0].length - 1) {
            twcanv += this.twig(
              brlist[0][j][0] + trlist[i][0] + x,
              brlist[0][j][1] + trlist[i][1] + y,
              1,
              {
                wid: hei / 300,
                ang: ba > -Math.PI / 2 ? ba : ba + Math.PI,
                sca: (0.5 * hei) / 300,
                dir: ba > -Math.PI / 2 ? 1 : -1
              }
            )
          }
        }
        const brlist2 = brlist[0].concat(brlist[1].reverse())
        trmlist = trmlist.concat(
          brlist2.map((v) => [v[0] + trlist[i][0], v[1] + trlist[i][1]])
        )
      } else {
        trmlist.push(trlist[i])
      }
    }
    canv += poly(trmlist, { xof: x, yof: y, fil: 'white', str: col, wid: 0 })

    trmlist.splice(0, 1)
    trmlist.splice(trmlist.length - 1, 1)
    canv += stroke(
      trmlist.map((v) => [v[0] + x, v[1] + y]),
      {
        col: 'rgba(100,100,100,' + (0.4 + Math.random() * 0.1).toFixed(3) + ')',
        wid: 2.5,
        fun: (x) => Math.sin(1),
        noi: 0.9,
        out: 0
      },
      this.Noise
    )

    canv += txcanv
    canv += twcanv
    return canv
  }

  tree05 (x, y, args = {}) {
    const {
      hei = 300,
      wid = 5,
      col = 'rgba(100,100,100,0.5)'
    } = args

    let canv = ''
    let txcanv = ''
    let twcanv = ''

    const trlist2 = this.branch({ hei, wid, ang: -Math.PI / 2, ben: 0 })
    txcanv += this.barkify(x, y, trlist2)
    const trlist = trlist2[0].concat(trlist2[1].reverse())

    let trmlist = []

    for (let i = 0; i < trlist.length; i++) {
      const p = Math.abs(i - trlist.length * 0.5) / (trlist.length * 0.5)
      if ((i >= trlist.length * 0.2 &&
        i <= trlist.length * 0.8 &&
        i % 3 === 0 && Math.random() > p) ||
        i === trlist.length / 2 - 1) {
        const bar = Math.random() * 0.2
        const ba = -bar * Math.PI - (1 - bar * 2) * Math.PI * ((i > trlist.length / 2) ? 1 : 0)
        const brlist = this.branch({
          hei: hei * (0.3 * p - Math.random() * 0.05),
          wid: wid * 0.5,
          ang: ba,
          ben: 0.5
        })

        brlist[0].splice(0, 1)
        brlist[1].splice(0, 1)

        for (let j = 0; j < brlist[0].length; j++) {
          if (j % 20 === 0 || j === brlist[0].length - 1) {
            twcanv += this.twig(
              brlist[0][j][0] + trlist[i][0] + x,
              brlist[0][j][1] + trlist[i][1] + y,
              0,
              {
                wid: hei / 300,
                ang: ba > -Math.PI / 2 ? ba : ba + Math.PI,
                sca: (0.2 * hei) / 300,
                dir: ba > -Math.PI / 2 ? 1 : -1,
                lea: [true, 5]
              }
            )
          }
        }
        const brlist2 = brlist[0].concat(brlist[1].reverse())
        trmlist = trmlist.concat(
          brlist2.map((v) => [v[0] + trlist[i][0], v[1] + trlist[i][1]])
        )
      } else {
        trmlist.push(trlist[i])
      }
    }

    canv += poly(trmlist, { xof: x, yof: y, fil: 'white', str: col, wid: 0 })

    trmlist.splice(0, 1)
    trmlist.splice(trmlist.length - 1, 1)
    canv += stroke(
      trmlist.map((v) => [v[0] + x, v[1] + y]),
      {
        col: 'rgba(100,100,100,' + (0.4 + Math.random() * 0.1).toFixed(3) + ')',
        wid: 2.5,
        fun: (x) => Math.sin(1),
        noi: 0.9,
        out: 0
      },
      this.Noise
    )

    canv += txcanv
    canv += twcanv
    return canv
  }

  #fracTree (xoff, yoff, dep, args = {}, txcanv, twcanv) {
    const {
      hei = 300,
      wid = 5,
      ang = 0,
      ben = Math.PI * 0.2
    } = args

    const trlist2 = this.branch({
      hei,
      wid,
      ang,
      ben,
      det: hei / 20
    })
    txcanv += this.barkify(xoff, yoff, trlist2)
    const trlist = trlist2[0].concat(trlist2[1].reverse())

    let trmlist = []

    for (let i = 0; i < trlist.length; i++) {
      if (
        ((Math.random() < 0.025 &&
          i >= trlist.length * 0.2 &&
          i <= trlist.length * 0.8) ||
          i === ((trlist.length / 2) | 0) - 1 ||
          i === ((trlist.length / 2) | 0) + 1) &&
        dep > 0
      ) {
        const bar = 0.02 + Math.random() * 0.08
        const ba = bar * Math.PI - bar * 2 * Math.PI * ((i > trlist.length / 2) ? 1 : 0)

        const brlist = this.fracTree(
          trlist[i][0] + xoff,
          trlist[i][1] + yoff,
          dep - 1,
          {
            hei: hei * (0.7 + Math.random() * 0.2),
            wid: wid * 0.6,
            ang: ang + ba,
            ben: 0.55
          },
          txcanv, twcanv
        )

        for (let j = 0; j < brlist.length; j++) {
          if (Math.random() < 0.03) {
            twcanv += this.twig(
              brlist[j][0] + trlist[i][0] + xoff,
              brlist[j][1] + trlist[i][1] + yoff,
              2,
              {
                ang: ba * (Math.random() * 0.5 + 0.75),
                sca: 0.3,
                dir: ba > 0 ? 1 : -1,
                lea: [false, 0]
              }
            )
          }
        }

        trmlist = trmlist.concat(
          brlist.map((v) => [v[0] + trlist[i][0], v[1] + trlist[i][1]])
        )
      } else {
        trmlist.push(trlist[i])
      }
    }
    return trmlist
  }

  tree06 (x, y, args = {}) {
    const {
      hei = 100,
      wid = 6,
      col = 'rgba(100,100,100,0.5)'
    } = args

    let canv = ''
    const txcanv = ''
    const twcanv = ''

    const trmlist = this.fracTree(x, y, 3, {
      hei,
      wid,
      ang: -Math.PI / 2,
      ben: 0
    },
    txcanv,
    twcanv)

    canv += poly(trmlist, { xof: x, yof: y, fil: 'white', str: col, wid: 0 })

    trmlist.splice(0, 1)
    trmlist.splice(trmlist.length - 1, 1)
    canv += stroke(
      trmlist.map((v) => [v[0] + x, v[1] + y]),
      {
        col: 'rgba(100,100,100,' + (0.4 + Math.random() * 0.1).toFixed(3) + ')',
        wid: 2.5,
        fun: (_) => Math.sin(1),
        noi: 0.9,
        out: 0
      },
      this.Noise
    )

    canv += txcanv
    canv += twcanv
    return canv
  }

  tree07 (x, y, args = {}) {
    const {
      hei = 60,
      wid = 4,
      ben = (x) => Math.sqrt(x) * 0.2,
      col = 'rgba(100,100,100,1)'
    } = args

    const reso = 10
    const nslist = []
    for (let i = 0; i < reso; i++) {
      nslist.push([this.Noise.noise(i * 0.5), this.Noise.noise(i * 0.5, 0.5)])
    }

    const leafcol = col.includes('rgba(')
      ? col.replace('rgba(', '').replace(')', '').split(',')
      : ['100', '100', '100', '1']

    let canv = ''
    const line1 = []
    const line2 = []
    let T = []
    for (let i = 0; i < reso; i++) {
      const nx = x + ben(i / reso) * 100
      const ny = y - (i * hei) / reso
      if (i >= reso / 4) {
        for (let j = 0; j < 1; j++) {
          const bpl = blob(
            nx + (Math.random() - 0.5) * wid * 1.2 * (reso - i) * 0.5,
            ny + (Math.random() - 0.5) * wid * 0.5,
            {
              len: Math.random() * 50 + 20,
              wid: Math.random() * 12 + 12,
              ang: (-Math.random() * Math.PI) / 6,
              col: 'rgba(' +
                leafcol[0] +
                ',' +
                leafcol[1] +
                ',' +
                leafcol[2] +
                ',' +
                parseFloat(leafcol[3]).toFixed(3) +
                ')',
              fun: (x) => x <= 1
                ? 2.75 * x * Math.pow(1 - x, 1 / 1.8)
                : 2.75 * (x - 2) * Math.pow(x - 1, 1 / 1.8),
              ret: 1
            },
            this.Noise
          )

          T = T.concat(
            this.PolyTools.triangulate(bpl, {
              area: 50,
              convex: true,
              optimize: false
            })
          )
        }
      }
      line1.push([nx + (nslist[i][0] - 0.5) * wid - wid / 2, ny])
      line2.push([nx + (nslist[i][1] - 0.5) * wid + wid / 2, ny])
    }

    T = this.PolyTools.triangulate(line1.concat(line2.reverse()), {
      area: 50,
      convex: true,
      optimize: true
    }).concat(T)

    for (let k = 0; k < T.length; k++) {
      const m = this.PolyTools.midPt(T[k])
      const c = (this.Noise.noise(m[0] * 0.02, m[1] * 0.02) * 200 + 50) | 0
      const co = 'rgba(' + c + ',' + c + ',' + c + ',0.8)'
      canv += poly(T[k], { fil: co, str: co, wid: 0 })
    }
    return canv
  }

  #fracTree2 (xoff, yoff, dep, args = {}) {
    const {
      ang = -Math.PI / 2,
      len = 15,
      ben = 0
    } = args

    const fun = dep === 0
      ? (x) => Math.cos(0.5 * Math.PI * x)
      : (_) => 1

    const spt = [xoff, yoff]
    const ept = [xoff + Math.cos(ang) * len, yoff + Math.sin(ang) * len]

    let trmlist = [[xoff, yoff], [xoff + len, yoff]]

    const bfun = randChoice([
      (x) => Math.sin(x * Math.PI),
      (x) => -Math.sin(x * Math.PI)
    ])

    trmlist = div(trmlist, 10)

    for (let i = 0; i < trmlist.length; i++) {
      trmlist[i][1] += bfun(i / trmlist.length) * 2
    }
    for (let i = 0; i < trmlist.length; i++) {
      const d = distance(trmlist[i], spt)
      const a = Math.atan2(trmlist[i][1] - spt[1], trmlist[i][0] - spt[0])
      trmlist[i][0] = spt[0] + d * Math.cos(a + ang)
      trmlist[i][1] = spt[1] + d * Math.sin(a + ang)
    }

    let tcanv = ''
    tcanv += stroke(trmlist, {
      fun,
      wid: 0.8,
      col: 'rgba(100,100,100,0.5)'
    }, this.Noise)

    if (dep !== 0) {
      const nben = ben + randChoice([-1, 1]) * Math.PI * 0.001 * dep * dep
      if (Math.random() < 0.5) {
        tcanv += this.fracTree2(ept[0], ept[1], dep - 1, {
          ang: ang +
            ben +
            Math.PI *
            randChoice([normRand(-1, 0.5), normRand(0.5, 1)]) *
            0.2,
          len: len * normRand(0.8, 0.9),
          ben: nben
        })
        tcanv += this.fracTree2(ept[0], ept[1], dep - 1, {
          ang: ang +
            ben +
            Math.PI *
            randChoice([normRand(-1, -0.5), normRand(0.5, 1)]) *
            0.2,
          len: len * normRand(0.8, 0.9),
          ben: nben
        })
      } else {
        tcanv += this.fracTree2(ept[0], ept[1], dep - 1, {
          ang: ang + ben,
          len: len * normRand(0.8, 0.9),
          ben: nben
        })
      }
    }
    return tcanv
  }

  tree08 (x, y, args = {}) {
    const {
      hei = 80,
      wid = 1,
      col = 'rgba(100,100,100,0.5)'
    } = args

    let canv = ''
    const txcanv = ''
    let twcanv = ''

    const ang = normRand(-1, 1) * Math.PI * 0.2

    const trlist2 = this.branch({
      hei,
      wid,
      ang: -Math.PI / 2 + ang,
      ben: Math.PI * 0.2,
      det: hei / 20
    })

    const trlist = trlist2[0].concat(trlist2[1].reverse())

    for (let i = 0; i < trlist.length; i++) {
      if (Math.random() < 0.2) {
        twcanv += this.fracTree2(
          x + trlist[i][0],
          y + trlist[i][1],
          Math.floor(4 * Math.random()),
          { hei: 20, ang: -Math.PI / 2 - ang * Math.random() }
        )
      } else if (i === Math.floor(trlist.length / 2)) {
        twcanv += this.fracTree2(x + trlist[i][0], y + trlist[i][1], 3, {
          hei: 25,
          ang: -Math.PI / 2 + ang
        })
      }
    }

    canv += poly(trlist, { xof: x, yof: y, fil: 'white', str: col, wid: 0 })

    canv += stroke(
      trlist.map((v) => [v[0] + x, v[1] + y]),
      {
        col: 'rgba(100,100,100,' + (0.6 + Math.random() * 0.1).toFixed(3) + ')',
        wid: 2.5,
        fun: (_) => Math.sin(1),
        noi: 0.9,
        out: 0
      }, this.Noise)

    canv += txcanv
    canv += twcanv
    return canv
  }
}
