import { calculatePlace } from "."

export const enum SjmType {
  None,
  Max,
  StrictMax,
  Greatest,
  StrictGreatest,
}

export type KMax = {
  hr: number,
  er: number,
  nr: number,
  sjp: number,
  sjm?: {
    value: number,
    type: SjmType,
  }
}

export function kmax(boMatrix: number[][][]) {
  const nameCount = boMatrix[0].length
  const criteriaCount = boMatrix.length

  const resMatrix = Array.from({ length: criteriaCount }).map(() => Array.from<KMax>({ length: nameCount }))

  for (let i = 0; i < criteriaCount; i++) {
    for (let j = 0; j < nameCount; j++) {
      let hr0 = 0
      let er = 0
      let nr = 0

      for (let k = 0; k < nameCount; k++) {
        if (j == k) continue

        if (boMatrix[i][j][k] == 1) {
          if (boMatrix[i][k][j] == 0) {
            hr0 += 1
          } else if (boMatrix[i][k][j] == 1) {
            er += 1
          }
        }

        // TODO: nr для несравнимых, но у нас таких нет
      }

      resMatrix[i][j] = {
        hr: hr0,
        er,
        nr,
        sjp: (hr0 + er + nr) + (hr0 + nr) + (hr0 + er) + hr0
      }
    }

    const max = Math.max(...resMatrix[i].map(x => x.sjp))
    const maxCount = resMatrix[i].filter(x => x.sjp == max).length
    const maxIndex = resMatrix[i].findIndex(x => x.sjp == max)

    if (maxCount != 1) continue

    const target = resMatrix[i][maxIndex]

    resMatrix[i][maxIndex].sjm = {
      value: max,
      type: calculateType({
        ...target,
        nameCount,
      })
    }
  }

  return resMatrix
}

function calculateType({ hr: hr0, er, nr, nameCount }: { hr: number, er: number, nr: number, nameCount: number }) {
  switch (true) {
    case hr0 + er + nr == nameCount: return SjmType.Max
    case hr0 + nr == nameCount - 1 && nr > 0: return SjmType.StrictMax
    case hr0 + er == nameCount && er > 0: return SjmType.Greatest
    case hr0 == nameCount - 1 && er == 0 && nr == 0: return SjmType.StrictGreatest
    default: return SjmType.None
  }
}

export function toTable(kmax: KMax[][], weight: number[]) {
  const sjmLabels = {
    [SjmType.None]: 'Нет',
    [SjmType.Max]: 'Макс.',
    [SjmType.StrictMax]: 'Строго макс.',
    [SjmType.Greatest]: 'Наиб.',
    [SjmType.StrictGreatest]: 'Строго наиб.',
  }
  return kmax.map((t, i) => {
    return t.map(x => ([
      x.hr + x.er + x.nr,
      x.hr + x.nr,
      x.hr + x.er,
      x.hr,
      x.sjp == 0 ? '0' : `${x.sjp.toLocalFixed(2)} * ${weight[i].toLocalFixed(2)} = ${(x.sjp * weight[i]).toLocalFixed(2)}`,
      x.sjm ? `${(x.sjm.value * weight[i]).toLocalFixed(2)} (${sjmLabels[x.sjm.type]})` : `-`,
    ].map(x => typeof x == 'number' ? x.toLocalFixed(2) : x)))
  })
}

export function finalKmax(kmax: KMax[][], weight: number[]) {
  const res = Array.from({ length: kmax[0].length }).map(() => ({ sJp: 0, sJm: 0, sJpPlace: 0, sJmPlace: 0 }))
  const sjm = kmax.map((x, i) => x.map(t => (t.sjm?.value ?? 0) * weight[i]))

  for (let i = 0; i < kmax.length; i++) {
    for (let j = 0; j < kmax[i].length; j++) {
      res[j].sJp += kmax[i][j].sjp * weight[i]
      res[j].sJm += sjm[i][j]
    }
  }

  calculatePlace(res, t => t.sJm, (a, b) => b - a)
    .forEach(t => t.item.sJmPlace = t.place)

  calculatePlace(res, t => t.sJp, (a, b) => b - a)
    .forEach(t => t.item.sJpPlace = t.place)

  return res
}