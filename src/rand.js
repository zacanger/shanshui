import { UniformRNG } from './uniform-rng.js'
const rng = new UniformRNG()
const seed = Date.now().toString()
rng.seed(seed)
export const rand = () => rng.random()
