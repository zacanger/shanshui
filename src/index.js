import { UniformRNG } from './uniform-rng.js'
import { PerlinNoise } from './perlin-noise.js'
import { PolyTools } from './poly-tools.js'
import { Tree } from './tree.js'
import { Arch } from './arch.js'
import { Mount } from './mount.js'
import { Man } from './man.js'
import { MountPlanner } from './mount-planner.js'
import { Memory } from './memory.js'
import { Update } from './update.js'

const rng = new UniformRNG()
const seed = Date.now().toString()
rng.seed(seed)

const perlin = new PerlinNoise(rng)
const polyTools = new PolyTools()
const memory = new Memory()
const tree = new Tree(perlin, polyTools)
const man = new Man(perlin, polyTools)
const arch = new Arch(perlin, polyTools, man)
const mount = new Mount(perlin, tree, arch, polyTools)
const mountPlanner = new MountPlanner(perlin, memory)
const update = new Update(memory, mountPlanner, mount, perlin, arch)

Math.random = () => rng.random()
window.MEM = memory
window.update = () => update.update()
