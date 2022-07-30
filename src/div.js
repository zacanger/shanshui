export const div = (plist, reso) => {
  const tl = (plist.length - 1) * reso
  const rlist = []

  for (let i = 0; i < tl; i += 1) {
    const lastp = plist[Math.floor(i / reso)]
    const nextp = plist[Math.ceil(i / reso)]
    const p = (i % reso) / reso
    const nx = lastp[0] * (1 - p) + nextp[0] * p
    const ny = lastp[1] * (1 - p) + nextp[1] * p

    rlist.push([nx, ny])
  }

  if (plist.length > 0) {
    rlist.push(plist[plist.length - 1])
  }

  return rlist
}
