
export type Order = 'asc' | 'desc'

export type InputTable = {
  names: string[],
  criterias: string[],
  weights: number[],
  values: number[][],
  order: Order[]
}

export function calculatePlace<T>(value: T[], getValue: (item: T) => number, compare: (a: number, b: number) => number = (a, b) => a - b) {
  const sorted = [...new Set(value.map(getValue))].sort(compare)
  return value.map(item => ({
    item,
    place: sorted.indexOf(getValue(item))
  }))
}

export function toPlacedTableFormat(matrix: boolean[][], names: string[], weights: number[]) {
  const balls = names.map((name, i) => {
    const sum = matrix[i].reduce((a, value, i) => a + (value ? weights[i] : 0), 0)
    return { name, sum }
  })

  const sortedBalls = calculatePlace(balls, t => t.sum, (a, b) => b - a)

  return balls.map(ball => ({
    ...ball,
    place: sortedBalls.find(t => t.item == ball)!.place
  }))
}