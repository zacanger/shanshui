import { stroke } from './stroke.js'
import { distance, poly, normRand, bezmh } from './utils.js'
import { rand } from './rand.js'

export class Man {
  constructor (Noise, PolyTools) {
    this.Noise = Noise
    this.PolyTools = PolyTools
  }

  expand (ptlist, wfun) {
    const vtxlist0 = []
    const vtxlist1 = []

    for (let i = 1; i < ptlist.length - 1; i++) {
      const w = wfun(i / ptlist.length)
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
    const l = ptlist.length - 1
    const a0 = Math.atan2(ptlist[1][1] - ptlist[0][1],
      ptlist[1][0] - ptlist[0][0]
    ) - Math.PI / 2

    const a1 = Math.atan2(
      ptlist[l][1] - ptlist[l - 1][1],
      ptlist[l][0] - ptlist[l - 1][0]
    ) - Math.PI / 2
    const w0 = wfun(0)
    const w1 = wfun(1)
    vtxlist0.unshift([
      ptlist[0][0] + w0 * Math.cos(a0),
      ptlist[0][1] + w0 * Math.sin(a0)
    ])
    vtxlist1.unshift([
      ptlist[0][0] - w0 * Math.cos(a0),
      ptlist[0][1] - w0 * Math.sin(a0)
    ])
    vtxlist0.push([
      ptlist[l][0] + w1 * Math.cos(a1),
      ptlist[l][1] + w1 * Math.sin(a1)
    ])
    vtxlist1.push([
      ptlist[l][0] - w1 * Math.cos(a1),
      ptlist[l][1] - w1 * Math.sin(a1)
    ])
    return [vtxlist0, vtxlist1]
  }

  tranpoly (p0, p1, ptlist) {
    const plist = ptlist.map((v) => [-v[0], v[1]])
    const ang = Math.atan2(p1[1] - p0[1], p1[0] - p0[0]) - Math.PI / 2
    const scl = distance(p0, p1)
    const qlist = plist.map((v) => {
      const d = distance(v, [0, 0])
      const a = Math.atan2(v[1], v[0])
      return [
        p0[0] + d * scl * Math.cos(ang + a),
        p0[1] + d * scl * Math.sin(ang + a)
      ]
    })
    return qlist
  }

  flipper (plist) {
    return plist.map((v) => [-v[0], v[1]])
  }

  hat01 (p0, p1, args = {}) {
    const { fli = false } = args

    let canv = ''
    const seed = rand()
    const f = fli
      ? (plist) => this.flipper(plist)
      : (plist) => plist

    canv += poly(
      this.tranpoly(
        p0,
        p1,
        f([
          [-0.3, 0.5],
          [0.3, 0.8],
          [0.2, 1],
          [0, 1.1],
          [-0.3, 1.15],
          [-0.55, 1],
          [-0.65, 0.5]
        ])
      ),
      { fil: 'rgba(100,100,100,0.8)' }
    )

    const qlist1 = []
    for (let i = 0; i < 10; i++) {
      qlist1.push([
        -0.3 - this.Noise.noise(i * 0.2, seed) * i * 0.1,
        0.5 - i * 0.3
      ])
    }
    canv += poly(this.tranpoly(p0, p1, f(qlist1)), {
      str: 'rgba(100,100,100,0.8)',
      wid: 1
    })

    return canv
  }

  hat02 (p0, p1, args = {}) {
    const { fli = false } = args

    let canv = ''

    const f = fli
      ? (plist) => this.flipper(plist)
      : (plist) => plist

    canv += poly(
      this.tranpoly(
        p0,
        p1,
        f([
          [-0.3, 0.5],
          [-1.1, 0.5],
          [-1.2, 0.6],
          [-1.1, 0.7],
          [-0.3, 0.8],
          [0.3, 0.8],
          [1.0, 0.7],
          [1.3, 0.6],
          [1.2, 0.5],
          [0.3, 0.5]
        ])
      ),
      { fil: 'rgba(100,100,100,0.8)' }
    )
    return canv
  }

  stick01 (p0, p1, args = {}) {
    const { fli = false } = args

    let canv = ''
    const seed = rand()
    const f = fli
      ? (plist) => this.flipper(plist)
      : (plist) => plist

    const qlist1 = []
    const l = 12
    for (let i = 0; i < l; i++) {
      qlist1.push([
        -this.Noise.noise(i * 0.1, seed) * 0.1 * Math.sin((i / l) * Math.PI) * 5,
        0 + i * 0.3
      ])
    }
    canv += poly(this.tranpoly(p0, p1, f(qlist1)), {
      str: 'rgba(100,100,100,0.5)',
      wid: 1
    })

    return canv
  }

  //      2
  //    1/
  // 7/  | \_ 6
  // 8| 0 \ 5
  //      /3
  //     4

  man (xoff, yoff, args = {}) {
    const {
      sca = 0.5,
      hat = (p0, p1, rgs) => this.hat01(p0, p1, rgs),
      ite = () => '',
      fli = true,
      ang = [
        0,
        -Math.PI / 2,
        normRand(0, 0),
        (Math.PI / 4) * rand(),
        ((Math.PI * 3) / 4) * rand(),
        (Math.PI * 3) / 4,
        -Math.PI / 4,
        (-Math.PI * 3) / 4 - (Math.PI / 4) * rand(),
        -Math.PI / 4
      ]
    } = args

    let len = args.len
    if (len === undefined) {
      len = [0, 30, 20, 30, 30, 30, 30, 30, 30]
    }
    len = len.map((v) => v * sca)

    let canv = ''
    const sct = {
      0: { 1: { 2: {}, 5: { 6: {} }, 7: { 8: {} } }, 3: { 4: {} } }
    }

    const toGlobal = (v) => [(fli ? -1 : 1) * v[0] + xoff, v[1] + yoff]

    function gpar (sct, ind) {
      const keys = Object.keys(sct)
      for (let i = 0; i < keys.length; i++) {
        if (keys[i] === ind.toString()) {
          return [ind]
        }
        const r = gpar(sct[keys[i]], ind)
        if (r) {
          return [parseFloat(keys[i])].concat(r)
        }
      }
      return undefined
    }

    function grot (sct, ind) {
      const par = gpar(sct, ind)
      let rot = 0
      for (let i = 0; i < par.length; i++) {
        rot += ang[par[i]]
      }
      return rot
    }

    function gpos (sct, ind) {
      const par = gpar(sct, ind)
      const pos = [0, 0]
      for (let i = 0; i < par.length; i++) {
        const a = grot(sct, par[i])
        pos[0] += len[par[i]] * Math.cos(a)
        pos[1] += len[par[i]] * Math.sin(a)
      }

      return pos
    }

    const pts = []
    for (let i = 0; i < ang.length; i++) {
      pts.push(gpos(sct, i))
    }
    yoff -= pts[4][1]

    const cloth = (plist, fun) => {
      let canv = ''
      const tlist = bezmh(this.PolyTools, plist, 2)
      const [tlist1, tlist2] = this.expand(tlist, fun)
      canv += poly(tlist1.concat(tlist2.reverse()).map(toGlobal), {
        fil: 'white'
      })
      canv += stroke(tlist1.map(toGlobal), {
        wid: 1,
        col: 'rgba(100,100,100,0.5)'
      }, this.Noise)
      canv += stroke(tlist2.map(toGlobal), {
        wid: 1,
        col: 'rgba(100,100,100,0.6)'
      }, this.Noise)

      return canv
    }

    const fsleeve = (x) => sca * 8 * (
      Math.sin(0.5 * x * Math.PI) *
      Math.pow(Math.sin(x * Math.PI), 0.1) + (1 - x) * 0.4
    )

    const fbody = (x) => sca * 11 * (
      Math.sin(0.5 * x * Math.PI) *
      Math.pow(Math.sin(x * Math.PI), 0.1) + (1 - x) * 0.5
    )

    const fhead = (x) => sca * 7 * Math.pow(0.25 - Math.pow(x - 0.5, 2), 0.3)

    canv += ite(toGlobal(pts[8]), toGlobal(pts[6]), { fli })
    canv += cloth([pts[1], pts[7], pts[8]], fsleeve)
    canv += cloth([pts[1], pts[0], pts[3], pts[4]], fbody)
    canv += cloth([pts[1], pts[5], pts[6]], fsleeve)
    canv += cloth([pts[1], pts[2]], fhead)

    const hlist = bezmh(this.PolyTools, [pts[1], pts[2]], 2)
    const [hlist1, hlist2] = this.expand(hlist, fhead)
    hlist1.splice(0, Math.floor(hlist1.length * 0.1))
    hlist2.splice(0, Math.floor(hlist2.length * 0.95))
    canv += poly(hlist1.concat(hlist2.reverse()).map(toGlobal), {
      fil: 'rgba(100,100,100,0.6)'
    })

    canv += hat(toGlobal(pts[1]), toGlobal(pts[2]), { fli })

    return canv
  }
}
