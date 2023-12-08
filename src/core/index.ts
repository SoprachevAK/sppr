
export type Order = 'asc' | 'desc'

export type InputTable = {
  names: string[],
  criterias: string[],
  weights: number[],
  values: number[][],
  order: Order[]
}

export function validateInputTableSize(table: InputTable) {
  if (table.criterias.length == 0) return false
  if (table.names.length == 0) return false

  return true
}

export function validateInputTable(table: InputTable) {
  if (!validateInputTableSize(table)) return 'Names or criterias length == 0'

  if (table.names.length != table.values[0].length) return 'Names length != values[0] length'
  if (table.criterias.length != table.values.length) return 'Criterias length != values length'
  if (table.weights.length != table.values.length) return 'Weights length != values length'
  if (table.order.length != table.values.length) return 'Order length != values length'

  return true
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