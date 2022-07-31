import { InitializeGlobalVariables } from './global-variables'
import { UniformRNG } from './uniform-rng'
import { PerlinNoise } from './perlin-noise'
import { PolyTools } from './poly-tools'
import { Tree } from './tree'
import { Arch } from './arch'
import { Mount } from './mount'
import { Man } from './man'
import { MountPlanner } from './mount-planner'
import { Memory } from './memory'
import { Update } from './update'
import { UI } from './ui'

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
const ui = new UI(memory, update)

// We add global variables at the end to ensure that we don't inadvertidly depend on them
InitializeGlobalVariables(rng, seed, perlin, polyTools, tree, mount, arch, man, mountPlanner, memory, update, ui)
