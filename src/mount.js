import { div } from './div.js'
import { stroke } from './stroke.js'
import { texture } from './texture.js'
import { loopNoise, normRand, poly, randChoice } from './utils.js'
import { rand } from './rand.js'

export class Mount {
  constructor (Noise, Tree, Arch, PolyTools) {
    this.Noise = Noise
    this.Tree = Tree
    this.Arch = Arch
    this.PolyTools = PolyTools
  }

  foot (ptlist, args = {}) {
    const {
      xof = 0,
      yof = 0,
      ret = 0
    } = args

    const ftlist = []
    const span = 10
    let ni = 0
    for (let i = 0; i < ptlist.length - 2; i += 1) {
      if (i === ni) {
        ni = Math.min(ni + randChoice([1, 2]), ptlist.length - 1)

        ftlist.push([])
        ftlist.push([])
        for (let j = 0; j < Math.min(ptlist[i].length / 8, 10); j++) {
          ftlist[ftlist.length - 2].push([
            ptlist[i][j][0] + this.Noise.noise(j * 0.1, i) * 10,
            ptlist[i][j][1]
          ])
          ftlist[ftlist.length - 1].push([
            ptlist[i][ptlist[i].length - 1 - j][0] -
                        this.Noise.noise(j * 0.1, i) * 10,
            ptlist[i][ptlist[i].length - 1 - j][1]
          ])
        }

        ftlist[ftlist.length - 2] = ftlist[ftlist.length - 2].reverse()
        ftlist[ftlist.length - 1] = ftlist[ftlist.length - 1].reverse()
        for (let j = 0; j < span; j++) {
          const p = j / span
          const x1 = ptlist[i][0][0] * (1 - p) + ptlist[ni][0][0] * p
          let y1 = ptlist[i][0][1] * (1 - p) + ptlist[ni][0][1] * p

          const x2 = ptlist[i][ptlist[i].length - 1][0] * (1 - p) +
            ptlist[ni][ptlist[i].length - 1][0] * p
          let y2 = ptlist[i][ptlist[i].length - 1][1] * (1 - p) +
            ptlist[ni][ptlist[i].length - 1][1] * p

          const vib = -1.7 * (p - 1) * Math.pow(p, 1 / 5)
          y1 += vib * 5 + this.Noise.noise(xof * 0.05, i) * 5
          y2 += vib * 5 + this.Noise.noise(xof * 0.05, i) * 5

          ftlist[ftlist.length - 2].push([x1, y1])
          ftlist[ftlist.length - 1].push([x2, y2])
        }
      }
    }

    let canv = ''
    for (let i = 0; i < ftlist.length; i++) {
      canv += poly(ftlist[i], {
        xof,
        yof,
        fil: 'white',
        str: 'none'
      })
    }
    for (let j = 0; j < ftlist.length; j++) {
      canv += stroke(
        ftlist[j].map((x) => [x[0] + xof, x[1] + yof]),
        {
          col: 'rgba(100,100,100,' +
            (0.1 + rand() * 0.1).toFixed(3) +
            ')',
          wid: 1
        }, this.Noise)
    }
    return ret ? ftlist : canv
  }

  vegetate (treeFunc, growthRule, proofRule, ptlist, canv) {
    const veglist = []
    for (let i = 0; i < ptlist.length; i += 1) {
      for (let j = 0; j < ptlist[i].length; j += 1) {
        if (growthRule(i, j)) {
          veglist.push([ptlist[i][j][0], ptlist[i][j][1]])
        }
      }
    }
    for (let i = 0; i < veglist.length; i++) {
      if (proofRule(veglist, i)) {
        canv += treeFunc(veglist[i][0], veglist[i][1])
      }
    }
  }

  mountain (xoff, yoff, seed = 0, args = {}) {
    const {
      hei = 100 + rand() * 400,
      wid = 400 + rand() * 200,
      tex = 200,
      veg = true,
      ret = 0,
      col = undefined
    } = args

    let canv = ''

    const ptlist = []
    const h = hei
    const w = wid
    const reso = [10, 50]

    let hoff = 0
    for (let j = 0; j < reso[0]; j++) {
      hoff += (rand() * yoff) / 100
      ptlist.push([])
      for (let i = 0; i < reso[1]; i++) {
        const x = (i / reso[1] - 0.5) * Math.PI
        let y = Math.cos(x)
        y *= this.Noise.noise(x + 10, j * 0.15, seed)
        const p = 1 - j / reso[0]
        ptlist[ptlist.length - 1].push([
          (x / Math.PI) * w * p,
          -y * h * p + hoff
        ])
      }
    }

    // RIM
    this.vegetate(
      (x, y) =>
        this.Tree.tree02(x + xoff, y + yoff - 5, {
          col: 'rgba(100,100,100,' +
            (this.Noise.noise(0.01 * x, 0.01 * y) * 0.5 * 0.3 + 0.5).toFixed(3) +
            ')',
          clu: 2
        }),
      (i, j) => {
        const ns = this.Noise.noise(j * 0.1, seed)
        return (
          i === 0 && ns * ns * ns < 0.1 && Math.abs(ptlist[i][j][1]) / h > 0.2
        )
      },
      (veglist, i) => true,
      ptlist, canv
    )

    // WHITE BG
    canv += poly(ptlist[0].concat([[0, reso[0] * 4]]), {
      xof: xoff,
      yof: yoff,
      fil: 'white',
      str: 'none'
    })

    // OUTLINE
    canv += stroke(
      ptlist[0].map((x) => [x[0] + xoff, x[1] + yoff]),
      { col: 'rgba(100,100,100,0.3)', noi: 1, wid: 3 },
      this.Noise
    )

    canv += this.foot(ptlist, { xof: xoff, yof: yoff })
    canv += texture(ptlist, {
      xof: xoff,
      yof: yoff,
      tex,
      sha: randChoice([0, 0, 0, 0, 5]),
      col
    }, this.Noise)

    // TOP
    this.vegetate(
      (x, y) => this.Tree.tree02(x + xoff, y + yoff, {
        col: 'rgba(100,100,100,' +
        (this.Noise.noise(0.01 * x, 0.01 * y) * 0.5 * 0.3 + 0.5).toFixed(3) +
        ')'
      }),
      (i, j) => {
        const ns = this.Noise.noise(i * 0.1, j * 0.1, seed + 2)
        return ns * ns * ns < 0.1 && Math.abs(ptlist[i][j][1]) / h > 0.5
      },
      (veglist, i) => true,
      ptlist, canv
    )

    if (veg) {
      // MIDDLE
      this.vegetate(
        (x, y) => {
          let ht = ((h + y) / h) * 70
          ht = ht * 0.3 + rand() * ht * 0.7
          return this.Tree.tree01(x + xoff, y + yoff, {
            hei: ht,
            wid: rand() * 3 + 1,
            col: 'rgba(100,100,100,' +
            (this.Noise.noise(0.01 * x, 0.01 * y) * 0.5 * 0.3 + 0.3).toFixed(3) +
            ')'
          })
        },
        (i, j) => {
          const ns = this.Noise.noise(i * 0.2, j * 0.05, seed)
          return (
            (j % 2 !== 0) &&
            (ns * ns * ns * ns < 0.012) &&
            (Math.abs(ptlist[i][j][1]) / h < 0.3)
          )
        },
        (veglist, i) => {
          let counter = 0
          for (let j = 0; j < veglist.length; j++) {
            if (
              i !== j &&
              Math.pow(veglist[i][0] - veglist[j][0], 2) +
              Math.pow(veglist[i][1] - veglist[j][1], 2) <
              30 * 30
            ) {
              counter++
            }
            if (counter > 2) {
              return true
            }
          }
          return false
        }, ptlist, canv)

      // BOTTOM
      this.vegetate(
        (x, y) => {
          let ht = ((h + y) / h) * 120
          ht = ht * 0.5 + rand() * ht * 0.5
          const bc = rand() * 0.1
          const bp = 1
          return this.Tree.tree03(x + xoff, y + yoff, {
            hei: ht,
            ben: (x) => Math.pow(x * bc, bp),
            col: 'rgba(100,100,100,' +
            (this.Noise.noise(0.01 * x, 0.01 * y) * 0.5 * 0.3 + 0.3).toFixed(3) +
            ')'
          })
        },
        (i, j) => {
          const ns = this.Noise.noise(i * 0.2, j * 0.05, seed)
          return (
            (j === 0 || j === ptlist[i].length - 1) && ns * ns * ns * ns < 0.012
          )
        },
        (veglist, i) => true,
        ptlist, canv)
    }

    // BOTT ARCH
    this.vegetate(
      (x, y) => {
        const tt = randChoice([0, 0, 1, 1, 1, 2])
        if (tt === 1) {
          return this.Arch.arch02(x + xoff, y + yoff, seed, {
            wid: normRand(40, 70),
            sto: randChoice([1, 2, 2, 3]),
            rot: rand(),
            sty: randChoice([1, 2, 3])
          })
        }

        if (tt === 2) {
          return this.Arch.arch04(x + xoff, y + yoff, seed, {
            sto: randChoice([1, 1, 1, 2, 2])
          })
        }

        return ''
      },
      (i, j) => {
        const ns = this.Noise.noise(i * 0.2, j * 0.05, seed + 10)
        return (
          i !== 0 &&
          (j === 1 || j === ptlist[i].length - 2) &&
          ns * ns * ns * ns < 0.008
        )
      },
      (veglist, i) => true,
      ptlist, canv
    )

    // TOP ARCH
    this.vegetate(
      (x, y) =>
        this.Arch.arch03(x + xoff, y + yoff, seed, {
          sto: randChoice([5, 7]),
          wid: 40 + rand() * 20
        }),
      (i, j) => i === 1 &&
      Math.abs(j - ptlist[i].length / 2) < 1 &&
      rand() < 0.02,
      (veglist, i) => true,
      ptlist, canv)

    // BOTT ROCK
    this.vegetate(
      (x, y) => this.rock(x + xoff, y + yoff, seed, {
        wid: 20 + rand() * 20,
        hei: 20 + rand() * 20,
        sha: 2
      }),
      (i, j) => (j === 0 || j === ptlist[i].length - 1) && rand() < 0.1,
      (veglist, i) => true,
      ptlist, canv)

    return ret === 0 ? canv : [ptlist]
  }

  flatMount (xoff, yoff, seed = 0, args = {}) {
    const {
      hei = 40 + rand() * 400,
      wid = 400 + rand() * 200,
      tex = 80,
      cho = 0.5
    } = args

    let canv = ''
    const ptlist = []
    const reso = [5, 50]
    let hoff = 0
    const flat = []
    for (let j = 0; j < reso[0]; j++) {
      hoff += (rand() * yoff) / 100
      ptlist.push([])
      flat.push([])
      for (let i = 0; i < reso[1]; i++) {
        const x = (i / reso[1] - 0.5) * Math.PI
        let y = Math.cos(x * 2) + 1
        y *= this.Noise.noise(x + 10, j * 0.1, seed)
        const p = 1 - (j / reso[0]) * 0.6
        const nx = (x / Math.PI) * wid * p
        let ny = -y * hei * p + hoff
        const h = 100
        if (ny < -h * cho + hoff) {
          ny = -h * cho + hoff
          if (flat[flat.length - 1].length % 2 === 0) {
            flat[flat.length - 1].push([nx, ny])
          }
        } else {
          if (flat[flat.length - 1].length % 2 === 1) {
            flat[flat.length - 1].push(
              ptlist[ptlist.length - 1][ptlist[ptlist.length - 1].length - 1]
            )
          }
        }

        ptlist[ptlist.length - 1].push([nx, ny])
      }
    }

    // WHITE BG
    canv += poly(ptlist[0].concat([[0, reso[0] * 4]]), {
      xof: xoff,
      yof: yoff,
      fil: 'white',
      str: 'none'
    })
    // OUTLINE
    canv += stroke(
      ptlist[0].map((x) => [x[0] + xoff, x[1] + yoff]),
      { col: 'rgba(100,100,100,0.3)', noi: 1, wid: 3 },
      this.Noise
    )

    // canv += foot(ptlist,{xof:xoff,yof:yoff})
    canv += texture(ptlist, {
      xof: xoff,
      yof: yoff,
      tex,
      wid: 2,
      dis: () => rand() > 0.5
        ? 0.1 + 0.4 * rand()
        : 0.9 - 0.4 * rand()
    }, this.Noise)
    let grlist1 = []
    let grlist2 = []
    for (let i = 0; i < flat.length; i += 2) {
      if (flat[i].length >= 2) {
        grlist1.push(flat[i][0])
        grlist2.push(flat[i][flat[i].length - 1])
      }
    }

    if (grlist1.length === 0) {
      return canv
    }

    let wb = [grlist1[0][0], grlist2[0][0]]
    for (let i = 0; i < 3; i++) {
      const p = 0.8 - i * 0.2

      grlist1.unshift([wb[0] * p, grlist1[0][1] - 5])
      grlist2.unshift([wb[1] * p, grlist2[0][1] - 5])
    }
    wb = [grlist1[grlist1.length - 1][0], grlist2[grlist2.length - 1][0]]
    for (let i = 0; i < 3; i++) {
      const p = 0.6 - i * i * 0.1
      grlist1.push([wb[0] * p, grlist1[grlist1.length - 1][1] + 1])
      grlist2.push([wb[1] * p, grlist2[grlist2.length - 1][1] + 1])
    }

    const d = 5
    grlist1 = div(grlist1, d)
    grlist2 = div(grlist2, d)

    const grlist = grlist1.reverse().concat(grlist2.concat([grlist1[0]]))
    for (let i = 0; i < grlist.length; i++) {
      const v = (1 - Math.abs((i % d) - d / 2) / (d / 2)) * 0.12
      grlist[i][0] *= 1 - v + this.Noise.noise(grlist[i][1] * 0.5) * v
    }

    canv += poly(grlist, {
      xof: xoff,
      yof: yoff,
      str: 'none',
      fil: 'white',
      wid: 2
    })

    canv += stroke(grlist.map(x => [x[0] + xoff, x[1] + yoff]), {
      wid: 3,
      col: 'rgba(100,100,100,0.2)'
    }, this.Noise)

    canv += this.flatDec(xoff, yoff, this.bound(grlist))

    return canv
  }

  bound (plist) {
    let xmin
    let xmax
    let ymin
    let ymax
    for (let i = 0; i < plist.length; i++) {
      if (xmin === undefined || plist[i][0] < xmin) {
        xmin = plist[i][0]
      }
      if (xmax === undefined || plist[i][0] > xmax) {
        xmax = plist[i][0]
      }
      if (ymin === undefined || plist[i][1] < ymin) {
        ymin = plist[i][1]
      }
      if (ymax === undefined || plist[i][1] > ymax) {
        ymax = plist[i][1]
      }
    }

    return { xmin, xmax, ymin, ymax }
  }

  flatDec (xoff, yoff, grbd) {
    let canv = ''

    const tt = randChoice([0, 0, 1, 2, 3, 4])

    for (let j = 0; j < rand() * 5; j++) {
      canv += this.rock(
        xoff + normRand(grbd.xmin, grbd.xmax),
        yoff + (grbd.ymin + grbd.ymax) / 2 + normRand(-10, 10) + 10,
        rand() * 100,
        {
          wid: 10 + rand() * 20,
          hei: 10 + rand() * 20,
          sha: 2
        }
      )
    }
    for (let j = 0; j < randChoice([0, 0, 1, 2]); j++) {
      const xr = xoff + normRand(grbd.xmin, grbd.xmax)
      const yr = yoff + (grbd.ymin + grbd.ymax) / 2 + normRand(-5, 5) + 20
      for (let k = 0; k < 2 + rand() * 3; k++) {
        canv += this.Tree.tree08(
          xr + Math.min(Math.max(normRand(-30, 30), grbd.xmin), grbd.xmax),
          yr,
          { hei: 60 + rand() * 40 }
        )
      }
    }

    if (tt === 0) {
      for (let j = 0; j < rand() * 3; j++) {
        canv += this.rock(
          xoff + normRand(grbd.xmin, grbd.xmax),
          yoff + (grbd.ymin + grbd.ymax) / 2 + normRand(-5, 5) + 20,
          rand() * 100,
          {
            wid: 50 + rand() * 20,
            hei: 40 + rand() * 20,
            sha: 5
          }
        )
      }
    }

    if (tt === 1) {
      const pmin = rand() * 0.5
      const pmax = rand() * 0.5 + 0.5
      const xmin = grbd.xmin * (1 - pmin) + grbd.xmax * pmin
      const xmax = grbd.xmin * (1 - pmax) + grbd.xmax * pmax
      for (let i = xmin; i < xmax; i += 30) {
        canv += this.Tree.tree05(
          xoff + i + 20 * normRand(-1, 1),
          yoff + (grbd.ymin + grbd.ymax) / 2 + 20,
          { hei: 100 + rand() * 200 }
        )
      }
      for (let j = 0; j < rand() * 4; j++) {
        canv += this.rock(
          xoff + normRand(grbd.xmin, grbd.xmax),
          yoff + (grbd.ymin + grbd.ymax) / 2 + normRand(-5, 5) + 20,
          rand() * 100,
          {
            wid: 50 + rand() * 20,
            hei: 40 + rand() * 20,
            sha: 5
          }
        )
      }
    } else if (tt === 2) {
      for (let i = 0; i < randChoice([1, 1, 1, 1, 2, 2, 3]); i++) {
        const xr = normRand(grbd.xmin, grbd.xmax)
        const yr = (grbd.ymin + grbd.ymax) / 2
        canv += this.Tree.tree04(xoff + xr, yoff + yr + 20, {})
        for (let j = 0; j < rand() * 2; j++) {
          canv += this.rock(
            xoff + Math.max(
              grbd.xmin,
              Math.min(grbd.xmax, xr + normRand(-50, 50))
            ),
            yoff + yr + normRand(-5, 5) + 20,
            j * i * rand() * 100,
            {
              wid: 50 + rand() * 20,
              hei: 40 + rand() * 20,
              sha: 5
            }
          )
        }
      }
    } else if (tt === 3) {
      for (let i = 0; i < randChoice([1, 1, 1, 1, 2, 2, 3]); i++) {
        canv += this.Tree.tree06(
          xoff + normRand(grbd.xmin, grbd.xmax),
          yoff + (grbd.ymin + grbd.ymax) / 2,
          { hei: 60 + rand() * 60 }
        )
      }
    } else if (tt === 4) {
      const pmin = rand() * 0.5
      const pmax = rand() * 0.5 + 0.5
      const xmin = grbd.xmin * (1 - pmin) + grbd.xmax * pmin
      const xmax = grbd.xmin * (1 - pmax) + grbd.xmax * pmax
      for (let i = xmin; i < xmax; i += 20) {
        canv += this.Tree.tree07(
          xoff + i + 20 * normRand(-1, 1),
          yoff + (grbd.ymin + grbd.ymax) / 2 + normRand(-1, 1) + 0,
          { hei: normRand(40, 80) }
        )
      }
    }

    for (let i = 0; i < 50 * rand(); i++) {
      canv += this.Tree.tree02(
        xoff + normRand(grbd.xmin, grbd.xmax),
        yoff + normRand(grbd.ymin, grbd.ymax)
      )
    }

    const ts = randChoice([0, 0, 0, 0, 1])
    if (ts === 1 && tt !== 4) {
      canv += this.Arch.arch01(
        xoff + normRand(grbd.xmin, grbd.xmax),
        yoff + (grbd.ymin + grbd.ymax) / 2 + 20,
        rand(),
        {
          wid: normRand(160, 200),
          hei: normRand(80, 100),
          per: rand()
        }
      )
    }

    return canv
  }

  distMount (xoff, yoff, seed = 0, args = {}) {
    const {
      hei = 300,
      len = 2000,
      seg = 5
    } = args

    let canv = ''
    const span = 10
    const ptlist = []

    for (let i = 0; i < len / span / seg; i++) {
      ptlist.push([])
      for (let j = 0; j < seg + 1; j++) {
        const tran = (k) => [
          xoff + k * span,
          yoff - hei *
          this.Noise.noise(k * 0.05, seed) *
          Math.pow(Math.sin((Math.PI * k) / (len / span)), 0.5)
        ]

        ptlist[ptlist.length - 1].push(tran(i * seg + j))
      }

      for (let j = 0; j < seg / 2 + 1; j++) {
        const tran = (k) => [
          xoff + k * span,
          yoff + 24 *
          this.Noise.noise(k * 0.05, 2, seed) *
          Math.pow(Math.sin((Math.PI * k) / (len / span)), 1)
        ]

        ptlist[ptlist.length - 1].unshift(tran(i * seg + j * 2))
      }
    }

    for (let i = 0; i < ptlist.length; i++) {
      const getCol = (x, y) => {
        const c = (this.Noise.noise(x * 0.02, y * 0.02, yoff) * 55 + 200) | 0
        return 'rgb(' + c + ',' + c + ',' + c + ')'
      }
      canv += poly(ptlist[i], {
        fil: getCol(
          ptlist[i][ptlist[i].length - 1][0],
          ptlist[i][ptlist[i].length - 1][1]
        ),
        str: 'none',
        wid: 1
      })

      const T = this.PolyTools.triangulate(ptlist[i], {
        area: 100,
        convex: true,
        optimize: false
      })
      for (let k = 0; k < T.length; k++) {
        const m = this.PolyTools.midPt(T[k])
        const co = getCol(m[0], m[1])
        canv += poly(T[k], { fil: co, str: co, wid: 1 })
      }
    }

    return canv
  }

  rock (xoff, yoff, seed = 0, args = {}) {
    const {
      hei = 80,
      wid = 100,
      tex = 30,
      sha = 10
    } = args

    let canv = ''

    const reso = [10, 50]
    const ptlist = []

    for (let i = 0; i < reso[0]; i++) {
      ptlist.push([])

      const nslist = []
      for (let j = 0; j < reso[1]; j++) {
        nslist.push(this.Noise.noise(i, j * 0.2, seed))
      }
      loopNoise(nslist)

      for (let j = 0; j < reso[1]; j++) {
        const a = (j / reso[1]) * Math.PI * 2 - Math.PI / 2
        let l = (wid * hei) /
          Math.sqrt(
            Math.pow(hei * Math.cos(a), 2) + Math.pow(wid * Math.sin(a), 2)
          )

        l *= 0.7 + 0.3 * nslist[j]

        const p = 1 - i / reso[0]

        const nx = Math.cos(a) * l * p
        let ny = -Math.sin(a) * l * p

        if (Math.PI < a || a < 0) {
          ny *= 0.2
        }

        ny += hei * (i / reso[0]) * 0.2

        ptlist[ptlist.length - 1].push([nx, ny])
      }
    }

    // WHITE BG
    canv += poly(ptlist[0].concat([[0, 0]]), {
      xof: xoff,
      yof: yoff,
      fil: 'white',
      str: 'none'
    })

    // OUTLINE
    canv += stroke(
      ptlist[0].map((x) => [x[0] + xoff, x[1] + yoff]),
      { col: 'rgba(100,100,100,0.3)', noi: 1, wid: 3 },
      this.Noise
    )
    canv += texture(ptlist, {
      xof: xoff,
      yof: yoff,
      tex,
      wid: 3,
      sha,
      col: (x) => 'rgba(180,180,180,' + (0.3 + rand() * 0.3).toFixed(3) + ')',
      dis: () => rand() > 0.5
        ? 0.15 + 0.15 * rand()
        : 0.85 - 0.15 * rand()
    }, this.Noise)

    return canv
  }
}
