import { randChoice } from './utils.js'
import { water } from './water.js'
import { rand } from './rand.js'

export class Update {
  constructor (MEM, mountPlanner, mount, Noise, arch) {
    this.MEM = MEM
    this.mountPlanner = mountPlanner
    this.mount = mount
    this.Noise = Noise
    this.arch = arch
  }

  add (nch) {
    if (nch.canv.includes('NaN')) {
      nch.canv = nch.canv.replace(/NaN/g, -1000)
    }
    if (this.MEM.chunks.length === 0) {
      this.MEM.chunks.push(nch)
    } else {
      if (nch.y <= this.MEM.chunks[0].y) {
        this.MEM.chunks.unshift(nch)
      } else if (nch.y >= this.MEM.chunks[this.MEM.chunks.length - 1].y) {
        this.MEM.chunks.push(nch)
      } else {
        for (let j = 0; j < this.MEM.chunks.length - 1; j++) {
          if (this.MEM.chunks[j].y <= nch.y && nch.y <= this.MEM.chunks[j + 1].y) {
            this.MEM.chunks.splice(j + 1, 0, nch)
            return
          }
        }
      }
    }
  }

  chunkloader (xmin, xmax) {
    while (xmax > this.MEM.xmax - this.MEM.cwid || xmin < this.MEM.xmin + this.MEM.cwid) {
      let plan
      if (xmax > this.MEM.xmax - this.MEM.cwid) {
        plan = this.mountPlanner.mountplanner(this.MEM.xmax, this.MEM.xmax + this.MEM.cwid)
        this.MEM.xmax = this.MEM.xmax + this.MEM.cwid
      } else {
        plan = this.mountPlanner.mountplanner(this.MEM.xmin - this.MEM.cwid, this.MEM.xmin)
        this.MEM.xmin = this.MEM.xmin - this.MEM.cwid
      }

      for (let i = 0; i < plan.length; i++) {
        if (plan[i].tag === 'mount') {
          this.add({
            tag: plan[i].tag,
            x: plan[i].x,
            y: plan[i].y,
            canv: this.mount.mountain(plan[i].x, plan[i].y, i * 2 * rand())
          })
          this.add({
            tag: plan[i].tag,
            x: plan[i].x,
            y: plan[i].y - 10000,
            canv: water(plan[i].x, plan[i].y, i * 2, this.Noise)
          })
        } else if (plan[i].tag === 'flatmount') {
          this.add({
            tag: plan[i].tag,
            x: plan[i].x,
            y: plan[i].y,
            canv: this.mount.flatMount(
              plan[i].x,
              plan[i].y,
              2 * rand() * Math.PI,
              {
                wid: 600 + rand() * 400,
                hei: 100,
                cho: 0.5 + rand() * 0.2
              }
            )
          })
        } else if (plan[i].tag === 'distmount') {
          this.add({
            tag: plan[i].tag,
            x: plan[i].x,
            y: plan[i].y,
            canv: this.mount.distMount(plan[i].x, plan[i].y, rand() * 100, {
              hei: 150,
              len: randChoice([500, 1000, 1500])
            })
          })
        } else if (plan[i].tag === 'boat') {
          this.add({
            tag: plan[i].tag,
            x: plan[i].x,
            y: plan[i].y,
            canv: this.arch.boat01(plan[i].x, plan[i].y, rand(), {
              sca: plan[i].y / 800,
              fli: randChoice([true, false])
            })
          })
        } else if (plan[i].tag === 'redcirc') {
          this.add({
            tag: plan[i].tag,
            x: plan[i].x,
            y: plan[i].y,
            canv:
                            "<circle cx='" +
                            plan[i].x +
                            "' cy='" +
                            plan[i].y +
                            "' r='20' stroke='black' fill='red' />"
          })
        } else if (plan[i].tag === 'greencirc') {
          this.add({
            tag: plan[i].tag,
            x: plan[i].x,
            y: plan[i].y,
            canv:
                            "<circle cx='" +
                            plan[i].x +
                            "' cy='" +
                            plan[i].y +
                            "' r='20' stroke='black' fill='green' />"
          })
        }
      }
    }
  }

  chunkrender (xmin, xmax) {
    this.MEM.canv = ''

    for (let i = 0; i < this.MEM.chunks.length; i++) {
      if (
        xmin - this.MEM.cwid < this.MEM.chunks[i].x &&
                this.MEM.chunks[i].x < xmax + this.MEM.cwid
      ) {
        this.MEM.canv += this.MEM.chunks[i].canv
      }
    }
  }

  calcViewBox () {
    const zoom = 1.142
    return '' + this.MEM.cursx + ' 0 ' + this.MEM.windx / zoom + ' ' + this.MEM.windy / zoom
  }

  update () {
    this.chunkloader(this.MEM.cursx, this.MEM.cursx + this.MEM.windx)
    this.chunkrender(this.MEM.cursx, this.MEM.cursx + this.MEM.windx)

    const theSvg =
            "<svg id='SVG' xmlns='http://www.w3.org/2000/svg' width='" +
            this.MEM.windx +
            "' height='" +
            this.MEM.windy +
            "' style='mix-blend-mode:multiply;'" +
            " viewBox = '" +
            this.calcViewBox() +
            "'" +
            "><g id='G' transform='translate(" +
            0 +
            ",0)'>" +
            this.MEM.canv +
            '</g></svg>'

    return theSvg
  }
}
