export function AssertPoint (value) {
  if (value.length !== 2) {
    throw new Error('Not valid point!')
  }
}

export function AssertTriangle (value) {
  if (value.length !== 3) {
    throw new Error('Not valid triangle!')
  }
}

export function AssertPointList (value) {
  if (value.filter(p => p.length !== 2).length === 0) {
    throw new Error('Not valid list of points!')
  }
}

export function AssertSlopeIntercept (value) {
  if (value.length !== 2) {
    throw new Error('Not valid slope intercept')
  }
}

export function AssertLineSegment (value) {
  if (value.length !== 2) {
    throw new Error('Not valid line segment')
  }
}
