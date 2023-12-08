
// Весь стобик == 1
export function dominate(boMatrix: number[][][]) {
  const nameCount = boMatrix[0].length
  const criteriaCount = boMatrix.length

  let dominateMatrix = new Array(nameCount).fill(0).map(() => Array.from<boolean>({ length: criteriaCount }))

  for (let i = 0; i < criteriaCount; i++) {
    for (let j = 0; j < nameCount; j++) {
      dominateMatrix[j][i] = boMatrix[i][j].every(v => v == 1)
    }
  }

  return dominateMatrix
}