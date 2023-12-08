
// Весь столбик == 0 кроме себя
export function block(boMatrix: number[][][]) {
  const nameCount = boMatrix[0].length
  const criteriaCount = boMatrix.length

  let dominateMatrix = Array.from({ length: nameCount }).map(() => Array.from<boolean>({ length: criteriaCount }))

  for (let i = 0; i < criteriaCount; i++) {
    for (let j = 0; j < nameCount; j++) {
      dominateMatrix[j][i] = Array.from({ length: nameCount })
        .map((_, k) => j == k || boMatrix[i][k][j] == 0)
        .every(Boolean)
    }
  }

  return dominateMatrix
}