import { calculatePlace } from "."


export function tournament(boMatrix: number[][][]) {
  const nameCount = boMatrix[0].length
  const criteriaCount = boMatrix.length

  const tournamentMatrix = Array.from({ length: nameCount })
    .map(() => Array.from<{ less: number[], equal: number[] }>({ length: boMatrix.length }))

  for (let i = 0; i < criteriaCount; i++) {
    const sums = boMatrix[i].map(v => v.reduce((a, b) => a + b, 0))
    const indexedSums = sums.map((s, i) => ([s, i]) as [val: number, index: number])

    for (let j = 0; j < nameCount; j++) {
      const less = indexedSums
        .filter(v => v[0] < sums[j])
        .map(v => v[1])

      const equal = indexedSums
        .filter(v => v[0] == sums[j] && v[1] != j)
        .map(v => v[1])

      tournamentMatrix[j][i] = { less, equal }
    }
  }

  return tournamentMatrix
}

export function tournamentBallsCalculator(precalculate: ReturnType<typeof tournament>, weights: number[]) {
  const nameCount = precalculate.length
  const criteriaCount = precalculate[0].length

  const balls = Array.from<number>({ length: nameCount })

  for (let j = 0; j < nameCount; j++) {
    let sum = 0

    for (let i = 0; i < criteriaCount; i++) {
      const { less, equal } = precalculate[j][i]
      sum += less.length * weights[i]
      if (equal.length > 0) sum += weights[i] / (equal.length + 1)
    }

    balls[j] = sum
  }

  const temp = balls.map((v, i) => [v, i] as [val: number, index: number])
  const sortedBalls = calculatePlace(temp, t => t[0], (a, b) => b - a)

  return {
    sum: balls,
    place: balls.map((_, i) => sortedBalls.find(t => t.item[1] == i)!.place)
  }
}

export function toPlacedTableFromat(precalculate: ReturnType<typeof tournament>, names: string[], weights: number[]) {
  const balls = tournamentBallsCalculator(precalculate, weights)

  return balls.sum.map((sum, i) => ({
    name: names[i],
    sum: sum,
    place: balls.place[i]
  }))
}