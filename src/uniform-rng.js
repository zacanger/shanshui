export class UniformRNG {
  #s = 1234
  #p = 999979
  #q = 999983
  #m = this.p * this.q

  hash (x) {
    const y = window.btoa(JSON.stringify(x))
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
    console.log(['int seed', this.s])
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

  test (sampleCount = 10000000, buckets = 10) {
    const t0 = Date.now()

    const chart = []
    for (let i = 0; i < buckets; i++) {
      chart.push(0)
    }
    for (let i = 0; i < sampleCount; i++) {
      chart[Math.floor(this.next() * buckets)] += 1
    }
    console.log(chart)
    console.log(`Finished in: ${Date.now() - t0}ms`)
    return chart
  }
}
