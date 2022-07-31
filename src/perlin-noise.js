// https://raw.githubusercontent.com/processing/p5.js/master/src/math/noise.js
export class PerlinNoise {
  constructor (rng) {
    this.rng = rng
    this.PERLIN_YWRAPB = 4
    this.PERLIN_YWRAP = 1 << this.PERLIN_YWRAPB
    this.PERLIN_ZWRAPB = 8
    this.PERLIN_ZWRAP = 1 << this.PERLIN_ZWRAPB
    // 4095
    this.PERLIN_SIZE = (1 << 12) - 1
    this.perlin_octaves = 4
    this.perlin_amp_falloff = 0.5
    this.perlin = InitializePerlinArray(this.PERLIN_SIZE, () => this.rng.random())
  }

  // Returns a cosine with:
  // - frequency: 1/2
  // - phase offset: pi
  // - rescaled to [0,1]
  scaled_cosine (i) {
    return 0.5 * (1 - Math.cos(i * Math.PI))
  }

  // Returns a random valued between [0,1]
  noise (x, y = 0, z = 0) {
    if (x < 0) {
      x = -x
    }
    if (y < 0) {
      y = -y
    }
    if (z < 0) {
      z = -z
    }
    let xi = Math.floor(x)
    let yi = Math.floor(y)
    let zi = Math.floor(z)
    let xf = x - xi
    let yf = y - yi
    let zf = z - zi
    let rxf, ryf
    let r = 0
    let ampl = 0.5
    let n1, n2, n3
    for (let o = 0; o < this.perlin_octaves; o++) {
      let of = xi + (yi << this.PERLIN_YWRAPB) + (zi << this.PERLIN_ZWRAPB)
      rxf = this.scaled_cosine(xf)
      ryf = this.scaled_cosine(yf)
      n1 = this.perlin[of & this.PERLIN_SIZE]
      n1 += rxf * (this.perlin[(of + 1) & this.PERLIN_SIZE] - n1)
      n2 = this.perlin[(of + this.PERLIN_YWRAP) & this.PERLIN_SIZE]
      n2 += rxf * (this.perlin[(of + this.PERLIN_YWRAP + 1) & this.PERLIN_SIZE] - n2)
      n1 += ryf * (n2 - n1)
      of += this.PERLIN_ZWRAP
      n2 = this.perlin[of & this.PERLIN_SIZE]
      n2 += rxf * (this.perlin[(of + 1) & this.PERLIN_SIZE] - n2)
      n3 = this.perlin[(of + this.PERLIN_YWRAP) & this.PERLIN_SIZE]
      n3 += rxf * (this.perlin[(of + this.PERLIN_YWRAP + 1) & this.PERLIN_SIZE] - n3)
      n2 += ryf * (n3 - n2)
      n1 += this.scaled_cosine(zf) * (n2 - n1)
      r += n1 * ampl
      ampl *= this.perlin_amp_falloff
      xi <<= 1
      xf *= 2
      yi <<= 1
      yf *= 2
      zi <<= 1
      zf *= 2
      if (xf >= 1.0) {
        xi++
        xf--
      }
      if (yf >= 1.0) {
        yi++
        yf--
      }
      if (zf >= 1.0) {
        zi++
        zf--
      }
    }
    return r
  }

  noiseDetail (lod, falloff) {
    if (lod > 0) {
      this.perlin_octaves = lod
    }
    if (falloff > 0) {
      this.perlin_amp_falloff = falloff
    }
  }

  noiseSeed (seed) {
    const lcg = new LinearCongruentialGenerator(this.rng, seed)
    this.perlin = InitializePerlinArray(this.PERLIN_SIZE, () => lcg.rand())
  }
}

function InitializePerlinArray (size, rng) {
  const perlin = new Array(size + 1)
  for (let i = 0; i < size + 1; i++) {
    perlin[i] = rng()
  }
  return perlin
}

// https://en.wikipedia.org/wiki/Linear_congruential_generator
class LinearCongruentialGenerator {
  constructor (rng, seedVal) {
    const seed = (seedVal || rng.next() * this.m) >>> 0
    this.seed = seed
    this.z = seed
    this.m = 4294967296
    this.a = 1664525
    this.c = 1013904223
  }

  // Returns a value from [0,1]
  rand () {
    this.z = (this.a * this.z + this.c) % this.m
    return this.z / this.m
  }
}
