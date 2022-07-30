import { blob } from './blob'
import { div } from './div'
import { Distance } from './geometry-utils'
import { stroke } from './stroke'
import { texture } from './texture'
import {
  bezmh,
  loopNoise,
  mapval,
  normRand,
  poly,
  randChoice,
  randGaussian,
  unNan,
  wtrand
} from './utils'
import { water } from './water'

export function InitializeGlobalVariables (
  rng,
  seed,
  perlin,
  polyTools,
  tree,
  mount,
  arch,
  man,
  mountPlanner,
  memory,
  update,
  ui
) {
  Math.random = () => rng.random()
  window.SEED = seed
  window.Noise = perlin
  window.PolyTools = polyTools
  window.unNan = (plist) => unNan(plist)
  window.distance = (p0, p1) => Distance(p0, p1)
  window.mapval = (value, istart, istop, ostart, ostop) =>
    mapval(value, istart, istop, ostart, ostop)
  window.loopNoise = (noiseList) => loopNoise(noiseList)
  window.randChoice = (arr) => randChoice(arr)
  window.normRand = (m, M) => normRand(m, M)
  window.wtrand = (weightFunction) => wtrand(weightFunction)
  window.randGaussian = () => randGaussian()
  window.bezmh = (P, w) => bezmh(polyTools, P, w)
  window.poly = (plist, args) => poly(plist, args)
  window.stroke = (plist, args) => stroke(plist, args, perlin)
  window.blob = (x, y, args) => blob(x, y, args, perlin)
  window.div = (plist, reso) => div(plist, reso)
  window.texture = (ptlist, args) => texture(ptlist, args, perlin)
  window.Tree = tree
  window.Mount = mount
  window.Arch = arch
  window.Man = man
  window.water = (xoff, yoff, seed, args) => water(xoff, yoff, seed, args, perlin)
  window.mountplanner = (xmin, xmax) => mountPlanner.mountplanner(xmin, xmax)
  window.MEM = memory
  window.viewupdate = () => update.viewupdate()
  window.needupdate = () => update.needupdate()
  window.update = () => update.update()
  window.UI = ui
}
