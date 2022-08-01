export class UniformRNG {
  constructor () {
    this.s = 1234
    this.p = 999979
    this.q = 999983
    this.m = this.p * this.q
  }

  hash (x) {
    const y = btoa(JSON.stringify(x))
    let z = 0
    for (let i = 0; i < y.length; i++) {
      z += y.charCodeAt(i) * Math.pow(128, i)
    }
    return z
  }

  seed (x) {
    if (!x) {
      x = Date.now()
    }
    let y = 0
    const z = 0
    while (y % this.p === 0 || y % this.q === 0 || y === 0 || y === 1) {
      y = (this.hash(x) + z) % this.m
    }
    this.s = y
    for (let i = 0; i < 10; i++) {
      this.next()
    }
  }

  random () {
    return this.next()
  }

  next () {
    this.s = (this.s * this.s) % this.m
    return this.s / this.m
  }
}
