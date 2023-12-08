import type { InputTable } from ".";

function compare(a: number, b: number, order: 'asc' | 'desc') {
  return order == 'asc' ? a >= b : a <= b
}

export function createBinaryRelationshipMatrix(table: InputTable) {
  const order = table.order

  const SIZE = table.names.length

  let matrix = new Array(table.criterias.length).fill(0).map(() => new Array(SIZE).fill(0).map(() => new Array<number>(SIZE).fill(0)))

  for (let i = 0; i < table.criterias.length; i++) {
    for (let j = 0; j < SIZE; j++) {
      for (let k = 0; k < SIZE; k++) {
        matrix[i][j][k] = compare(table.values[i][j], table.values[i][k], order[i]) ? 1 : 0
      }
    }
  }

  return matrix
}