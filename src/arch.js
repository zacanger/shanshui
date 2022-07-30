import { div } from './div'
import { stroke } from './stroke'
import { texture } from './texture'
import { normRand, poly, randChoice, wtrand } from './utils'

export class Arch {
  constructor (Noise, PolyTools, Man) {
    this.Noise = Noise
    this.PolyTools = PolyTools
    this.Man = Man
  }

  flip (ptlist, axis = 0) {
    for (let i = 0; i < ptlist.length; i++) {
      if (ptlist[i].length > 0) {
        if (typeof ptlist[i][0] !== 'number') {
          const list = ptlist[i]
          for (let j = 0; j < ptlist[i].length; j++) {
            list[j][0] = axis - (list[j][0] - axis)
          }
        } else {
          const point = ptlist[i]
          point[0] = axis - (point[0] - axis)
        }
      }
    }

    return ptlist
  }

  hut (xoff, yoff, args = {}) {
    const {
      hei = 40,
      wid = 180,
      tex = 300
    } = args

    const reso = [10, 10]
    const ptlist = []

    for (let i = 0; i < reso[0]; i++) {
      ptlist.push([])
      const heir = hei + hei * 0.2 * Math.random()
      for (let j = 0; j < reso[1]; j++) {
        const nx = wid *
          (i / (reso[0] - 1) - 0.5) * Math.pow(j / (reso[1] - 1), 0.7)
        const ny = heir * (j / (reso[1] - 1))
        ptlist[ptlist.length - 1].push([nx, ny])
      }
    }

    let canv = ''
    canv += poly(
      ptlist[0]
        .slice(0, -1)
        .concat(ptlist[ptlist.length - 1].slice(0, -1).reverse()),
      { xof: xoff, yof: yoff, fil: 'white', str: 'none' }
    )
    canv += poly(ptlist[0], {
      xof: xoff,
      yof: yoff,
      fil: 'none',
      str: 'rgba(100,100,100,0.3)',
      wid: 2
    })
    canv += poly(ptlist[ptlist.length - 1], {
      xof: xoff,
      yof: yoff,
      fil: 'none',
      str: 'rgba(100,100,100,0.3)',
      wid: 2
    })

    canv += texture(ptlist, {
      xof: xoff,
      yof: yoff,
      tex,
      wid: 1,
      len: 0.25,
      col: (x) => 'rgba(120,120,120,' +
        (0.3 + Math.random() * 0.3).toFixed(3) + ')',
      dis: () => wtrand(a => a * a),
      noi: (x) => 5
    }, this.Noise)

    return canv
  }

  box (xoff, yoff, args = {}) {
    const {
      hei = 20,
      wid = 120,
      rot = 0.7,
      per = 4,
      tra = true,
      bot = true,
      wei = 3,
      dec = (_) => []
    } = args

    const mid = -wid * 0.5 + wid * rot
    const bmid = -wid * 0.5 + wid * (1 - rot)
    let ptlist = []

    ptlist.push(div([[-wid * 0.5, -hei], [-wid * 0.5, 0]], 5))
    ptlist.push(div([[wid * 0.5, -hei], [wid * 0.5, 0]], 5))
    if (bot) {
      ptlist.push(div([[-wid * 0.5, 0], [mid, per]], 5))
      ptlist.push(div([[wid * 0.5, 0], [mid, per]], 5))
    }
    ptlist.push(div([[mid, -hei], [mid, per]], 5))
    if (tra) {
      if (bot) {
        ptlist.push(div([[-wid * 0.5, 0], [bmid, -per]], 5))
        ptlist.push(div([[wid * 0.5, 0], [bmid, -per]], 5))
      }
      ptlist.push(div([[bmid, -hei], [bmid, -per]], 5))
    }

    const surf = (rot < 0.5 ? 1 : 0) * 2 - 1
    ptlist = ptlist.concat(
      dec({
        pul: [surf * wid * 0.5, -hei],
        pur: [mid, -hei + per],
        pdl: [surf * wid * 0.5, 0],
        pdr: [mid, per]
      })
    )

    const polist = [
      [-wid * 0.5, -hei],
      [wid * 0.5, -hei],
      [wid * 0.5, 0],
      [mid, per],
      [-wid * 0.5, 0]
    ]

    let canv = ''
    if (!tra) {
      canv += poly(polist, {
        xof: xoff,
        yof: yoff,
        str: 'none',
        fil: 'white'
      })
    }

    for (let i = 0; i < ptlist.length; i++) {
      canv += stroke(
        ptlist[i].map((x) => [x[0] + xoff, x[1] + yoff]),
        {
          col: 'rgba(100,100,100,0.4)',
          noi: 1,
          wid: wei,
          fun: (_) => 1
        }, this.Noise)
    }

    return canv
  }

  deco (style, args = {}) {
    const {
      pul = [0, 0],
      pur = [0, 100],
      pdl = [100, 0],
      pdr = [100, 100],
      hsp = [1, 3],
      vsp = [1, 2]
    } = args

    const plist = []
    const dl = div([pul, pdl], vsp[1])
    const dr = div([pur, pdr], vsp[1])
    const du = div([pul, pur], hsp[1])
    const dd = div([pdl, pdr], hsp[1])

    if (style === 1) {
      // -| |-
      const mlu = du[hsp[0]]
      const mru = du[du.length - 1 - hsp[0]]
      const mld = dd[hsp[0]]
      const mrd = dd[du.length - 1 - hsp[0]]

      for (let i = vsp[0]; i < dl.length - vsp[0]; i += vsp[0]) {
        const mml = div([mlu, mld], vsp[1])[i]
        const mmr = div([mru, mrd], vsp[1])[i]
        const ml = dl[i]
        const mr = dr[i]
        plist.push(div([mml, ml], 5))
        plist.push(div([mmr, mr], 5))
      }
      plist.push(div([mlu, mld], 5))
      plist.push(div([mru, mrd], 5))
    } else if (style === 2) {
      // ||||

      for (let i = hsp[0]; i < du.length - hsp[0]; i += hsp[0]) {
        const mu = du[i]
        const md = dd[i]
        plist.push(div([mu, md], 5))
      }
    } else if (style === 3) {
      // |##|
      const mlu = du[hsp[0]]
      const mru = du[du.length - 1 - hsp[0]]
      const mld = dd[hsp[0]]
      const mrd = dd[du.length - 1 - hsp[0]]

      for (let i = vsp[0]; i < dl.length - vsp[0]; i += vsp[0]) {
        const mml = div([mlu, mld], vsp[1])[i]
        const mmr = div([mru, mrd], vsp[1])[i]
        const mmu = div([mlu, mru], vsp[1])[i]
        const mmd = div([mld, mrd], vsp[1])[i]

        plist.push(div([mml, mmr], 5))
        plist.push(div([mmu, mmd], 5))
      }
      plist.push(div([mlu, mld], 5))
      plist.push(div([mru, mrd], 5))
    }

    return plist
  }

  rail (xoff, yoff, seed = 0, args = {}) {
    const {
      hei = 20,
      wid = 180,
      rot = 0.7,
      per = 4,
      seg = 4,
      wei = 1,
      tra = true,
      fro = true
    } = args

    const mid = -wid * 0.5 + wid * rot
    const bmid = -wid * 0.5 + wid * (1 - rot)
    const ptlist = []

    if (fro) {
      ptlist.push(div([[-wid * 0.5, 0], [mid, per]], seg))
      ptlist.push(div([[mid, per], [wid * 0.5, 0]], seg))
    }
    if (tra) {
      ptlist.push(div([[-wid * 0.5, 0], [bmid, -per]], seg))
      ptlist.push(div([[bmid, -per], [wid * 0.5, 0]], seg))
    }
    if (fro) {
      ptlist.push(div([[-wid * 0.5, -hei], [mid, -hei + per]], seg))
      ptlist.push(div([[mid, -hei + per], [wid * 0.5, -hei]], seg))
    }
    if (tra) {
      ptlist.push(div([[-wid * 0.5, -hei], [bmid, -hei - per]], seg))
      ptlist.push(div([[bmid, -hei - per], [wid * 0.5, -hei]], seg))
    }
    if (tra) {
      const open = Math.floor(Math.random() * ptlist.length)
      ptlist[open] = ptlist[open].slice(0, -1)
      ptlist[(open + ptlist.length) % ptlist.length] = ptlist[
        (open + ptlist.length) % ptlist.length
      ].slice(0, -1)
    }
    let canv = ''

    for (let i = 0; i < ptlist.length / 2; i++) {
      for (let j = 0; j < ptlist[i].length; j++) {
        ptlist[i][j][1] += (this.Noise.noise(i, j * 0.5, seed) - 0.5) * hei
        ptlist[(ptlist.length / 2 + i) % ptlist.length][
          j % ptlist[(ptlist.length / 2 + i) % ptlist.length].length
        ][1] += (this.Noise.noise(i + 0.5, j * 0.5, seed) - 0.5) * hei

        const ln = div(
          [
            ptlist[i][j],
            ptlist[(ptlist.length / 2 + i) % ptlist.length][
              j % ptlist[(ptlist.length / 2 + i) % ptlist.length].length
            ]
          ],
          2
        )

        ln[0][0] += (Math.random() - 0.5) * hei * 0.5
        canv += poly(ln, {
          xof: xoff,
          yof: yoff,
          fil: 'none',
          str: 'rgba(100,100,100,0.5)',
          wid: 2
        })
      }
    }

    for (let i = 0; i < ptlist.length; i++) {
      canv += stroke(
        ptlist[i].map((x) => [x[0] + xoff, x[1] + yoff]),
        {
          col: 'rgba(100,100,100,0.5)',
          noi: 0.5,
          wid: wei,
          fun: (_) => 1
        }, this.Noise)
    }

    return canv
  }

  roof (xoff, yoff, args = {}) {
    const {
      hei = 20,
      wid = 120,
      rot = 0.7,
      per = 4,
      cor = 5,
      wei = 3,
      pla = [0, '']
    } = args

    const opf = (ptlist) => rot < 0.5
      ? this.flip(ptlist)
      : ptlist

    const rrot = rot < 0.5 ? 1 - rot : rot

    const mid = -wid * 0.5 + wid * rrot
    const quat = (mid + wid * 0.5) * 0.5 - mid

    const ptlist = []
    ptlist.push(
      div(
        opf([
          [-wid * 0.5 + quat, -hei - per / 2],
          [-wid * 0.5 + quat * 0.5, -hei / 2 - per / 4],
          [-wid * 0.5 - cor, 0]
        ]),
        5
      )
    )
    ptlist.push(
      div(
        opf([
          [mid + quat, -hei],
          [(mid + quat + wid * 0.5) / 2, -hei / 2],
          [wid * 0.5 + cor, 0]
        ]),
        5
      )
    )
    ptlist.push(
      div(
        opf([
          [mid + quat, -hei],
          [mid + quat / 2, -hei / 2 + per / 2],
          [mid + cor, per]
        ]),
        5
      )
    )

    ptlist.push(div(opf([[-wid * 0.5 - cor, 0], [mid + cor, per]]), 5))
    ptlist.push(div(opf([[wid * 0.5 + cor, 0], [mid + cor, per]]), 5))

    ptlist.push(
      div(opf([[-wid * 0.5 + quat, -hei - per / 2], [mid + quat, -hei]]), 5)
    )

    let canv = ''

    const polist = opf([
      [-wid * 0.5, 0],
      [-wid * 0.5 + quat, -hei - per / 2],
      [mid + quat, -hei],
      [wid * 0.5, 0],
      [mid, per]
    ])
    canv += poly(polist, { xof: xoff, yof: yoff, str: 'none', fil: 'white' })

    for (let i = 0; i < ptlist.length; i++) {
      canv += stroke(
        ptlist[i].map((x) => [x[0] + xoff, x[1] + yoff]),
        {
          col: 'rgba(100,100,100,0.4)',
          noi: 1,
          wid: wei,
          fun: (_) => 1
        }, this.Noise)
    }

    if (pla[0] === 1) {
      let pp = opf([
        [mid + quat / 2, -hei / 2 + per / 2],
        [-wid * 0.5 + quat * 0.5, -hei / 2 - per / 4]
      ])
      if (pp[0][0] > pp[1][0]) {
        pp = [pp[1], pp[0]]
      }
      const mp = this.PolyTools.midPt(pp)
      const a = Math.atan2(pp[1][1] - pp[0][1], pp[1][0] - pp[0][0])
      const adeg = (a * 180) / Math.PI
      canv += "<text font-size='" +
        hei * 0.6 +
        "' font-family='Verdana'" +
        " style='fill:rgba(100,100,100,0.9)'" +
        " text-anchor='middle' transform='translate(" +
        (mp[0] + xoff) +
        ',' +
        (mp[1] + yoff) +
        ') rotate(' +
        adeg +
        ")'>" +
        pla[1] +
        '</text>'
    }

    return canv
  }

  pagroof (xoff, yoff, args = {}) {
    const {
      hei = 20,
      wid = 120,
      per = 4,
      cor = 10,
      sid = 4,
      wei = 3
    } = args

    const ptlist = []
    const polist = [[0, -hei]]
    let canv = ''

    for (let i = 0; i < sid; i++) {
      const fx = wid * ((i * 1.0) / (sid - 1) - 0.5)
      const fy = per * (1 - Math.abs((i * 1.0) / (sid - 1) - 0.5) * 2)
      const fxx = (wid + cor) * ((i * 1.0) / (sid - 1) - 0.5)
      if (i > 0) {
        ptlist.push([ptlist[ptlist.length - 1][2], [fxx, fy]])
      }
      ptlist.push([[0, -hei], [fx * 0.5, (-hei + fy) * 0.5], [fxx, fy]])
      polist.push([fxx, fy])
    }

    canv += poly(polist, { xof: xoff, yof: yoff, str: 'none', fil: 'white' })
    for (let i = 0; i < ptlist.length; i++) {
      canv += stroke(
        div(ptlist[i], 5).map((x) => [x[0] + xoff, x[1] + yoff]),
        {
          col: 'rgba(100,100,100,0.4)',
          noi: 1,
          wid: wei,
          fun: (_) => 1
        }, this.Noise)
    }

    return canv
  }

  arch01 (xoff, yoff, seed = 0, args = {}) {
    const {
      hei = 70,
      wid = 180,
      per = 5
    } = args

    const p = 0.4 + Math.random() * 0.2
    const h0 = hei * p
    const h1 = hei * (1 - p)

    let canv = ''
    canv += this.hut(xoff, yoff - hei, { hei: h0, wid })
    canv += this.box(xoff, yoff, {
      hei: h1,
      wid: (wid * 2) / 3,
      per,
      bot: false
    })

    canv += this.rail(xoff, yoff, seed, {
      tra: true,
      fro: false,
      hei: 10,
      wid,
      per: per * 2,
      seg: (3 + Math.random() * 3) | 0
    })

    const mcnt = randChoice([0, 1, 1, 2])
    if (mcnt === 1) {
      canv += this.Man.man(xoff + normRand(-wid / 3, wid / 3), yoff, {
        fli: randChoice([true, false]),
        sca: 0.42
      })
    } else if (mcnt === 2) {
      canv += this.Man.man(xoff + normRand(-wid / 4, -wid / 5), yoff, {
        fli: false,
        sca: 0.42
      })
      canv += this.Man.man(xoff + normRand(wid / 5, wid / 4), yoff, {
        fli: true,
        sca: 0.42
      })
    }
    canv += this.rail(xoff, yoff, seed, {
      tra: false,
      fro: true,
      hei: 10,
      wid,
      per: per * 2,
      seg: (3 + Math.random() * 3) | 0
    })

    return canv
  }

  arch02 (xoff, yoff, seed = 0, args = {}) {
    const {
      hei = 10,
      wid = 50,
      rot = 0.3,
      per = 5,
      sto = 3,
      sty = 1,
      rai = false
    } = args

    let canv = ''

    let hoff = 0
    for (let i = 0; i < sto; i++) {
      canv += this.box(xoff, yoff - hoff, {
        tra: false,
        hei,
        wid: wid * Math.pow(0.85, i),
        rot,
        wei: 1.5,
        per,
        dec: (arg) => this.deco(
          sty,
          Object.assign({}, arg, {
            hsp: [[], [1, 5], [1, 5], [1, 4]][sty],
            vsp: [[], [1, 2], [1, 2], [1, 3]][sty]
          })
        )
      })
      canv += rai
        ? this.rail(xoff, yoff - hoff, i * 0.2, {
          wid: wid * Math.pow(0.85, i) * 1.1,
          hei: hei / 2,
          per,
          rot,
          wei: 0.5,
          tra: false
        })
        : ''
      const pla = undefined
      canv += this.roof(xoff, yoff - hoff - hei, {
        hei,
        wid: wid * Math.pow(0.9, i),
        rot,
        wei: 1.5,
        per,
        pla
      })

      hoff += hei * 1.5
    }

    return canv
  }

  arch03 (xoff, yoff, seed = 0, args = {}) {
    const {
      hei = 10,
      wid = 50,
      rot = 0.7,
      per = 5,
      sto = 7
    } = args

    let canv = ''

    let hoff = 0
    for (let i = 0; i < sto; i++) {
      canv += this.box(xoff, yoff - hoff, {
        tra: false,
        hei,
        wid: wid * Math.pow(0.85, i),
        rot,
        wei: 1.5,
        per: per / 2,
        dec: (arg) =>
          this.deco(1, Object.assign({}, arg, { hsp: [1, 4], vsp: [1, 2] }))
      })
      canv += this.rail(xoff, yoff - hoff, i * 0.2, {
        seg: 5,
        wid: wid * Math.pow(0.85, i) * 1.1,
        hei: hei / 2,
        per: per / 2,
        rot,
        wei: 0.5,
        tra: false
      })
      canv += this.pagroof(xoff, yoff - hoff - hei, {
        hei: hei * 1.5,
        wid: wid * Math.pow(0.9, i),
        rot,
        wei: 1.5,
        per
      })
      hoff += hei * 1.5
    }

    return canv
  }

  arch04 (xoff, yoff, seed = 0, args = {}) {
    const {
      hei = 15,
      wid = 30,
      rot = 0.7,
      per = 5,
      sto = 2
    } = args

    let canv = ''

    let hoff = 0
    for (let i = 0; i < sto; i++) {
      canv += this.box(xoff, yoff - hoff, {
        tra: true,
        hei,
        wid: wid * Math.pow(0.85, i),
        rot,
        wei: 1.5,
        per: per / 2,
        dec: (_) => []
      })
      canv += this.rail(xoff, yoff - hoff, i * 0.2, {
        seg: 3,
        wid: wid * Math.pow(0.85, i) * 1.2,
        hei: hei / 3,
        per: per / 2,
        rot,
        wei: 0.5,
        tra: true
      })
      canv += this.pagroof(xoff, yoff - hoff - hei, {
        hei: hei * 1,
        wid: wid * Math.pow(0.9, i),
        rot,
        wei: 1.5,
        per
      })
      hoff += hei * 1.2
    }

    return canv
  }

  boat01 (xoff, yoff, seed, args = {}) {
    const {
      len = 120,
      sca = 1,
      fli = false
    } = args
    let canv = ''

    const dir = fli ? -1 : 1
    canv += this.Man.man(xoff + 20 * sca * dir, yoff, {
      ite: (p1, p2, arg) => this.Man.stick01(p1, p2, arg),
      hat: (p1, p2, arg) => this.Man.hat02(p1, p2, arg),
      sca: 0.5 * sca,
      fli: !fli,
      len: [0, 30, 20, 30, 10, 30, 30, 30, 30]
    })

    const plist1 = []
    const plist2 = []
    const fun1 = (x) => Math.pow(Math.sin(x * Math.PI), 0.5) * 7 * sca
    const fun2 = (x) => Math.pow(Math.sin(x * Math.PI), 0.5) * 10 * sca
    for (let i = 0; i < len * sca; i += 5 * sca) {
      plist1.push([i * dir, fun1(i / len)])
      plist2.push([i * dir, fun2(i / len)])
    }
    const plist = plist1.concat(plist2.reverse())
    canv += poly(plist, { xof: xoff, yof: yoff, fil: 'white' })
    canv += stroke(plist.map(v => [xoff + v[0], yoff + v[1]]), {
      wid: 1,
      fun: (x) => Math.sin(x * Math.PI * 2),
      col: 'rgba(100,100,100,0.4)'
    }, this.Noise)

    return canv
  }
}
