import type { InputTable, toPlacedTableFormat } from "@/core"
import { sppr } from "@/core/sppr"
import type { tournament } from "@/core/tournament"


type List = (string | List)[]

export function generateReport(table: InputTable, style: {
  h1: (strings: TemplateStringsArray, ...values: any[]) => string,
  h2: (strings: TemplateStringsArray, ...values: any[]) => string,
  h3: (strings: TemplateStringsArray, ...values: any[]) => string,
  h4: (strings: TemplateStringsArray, ...values: any[]) => string,
  generateTable: (data: any[][], options?: {
    align?: ('l' | 'c' | 'r' | string)[],
    caption?: string,
    center?: boolean,
    notBoldHeader?: boolean
  }) => string,
  b: (strings: TemplateStringsArray, ...values: any[]) => string,
  code: (strings: TemplateStringsArray, ...values: any[]) => string,
  list: (items: List, options?: { skipFirstStep?: boolean }) => string,
  intermediateResult?: boolean,
  intermediateCalculation?: boolean,
  matrixBR?: boolean,
  description?: boolean,
  reportVatiant?: 'markdown' | 'latex',
}) {
  const {
    normalizedWeights,
    binaryRelationship,
    dominateResult,
    blockResult,
    tournamentResult,
    finalKmaxResult,
    dominateTableResult,
    blockTableResult,
    tournamentTableResult,
    kmaxTableResult,
    finalResult: finalResultTable,
    finalBestResult
  } = sppr(table)

  const { intermediateResult, intermediateCalculation, matrixBR, description } = style
  const { h1, h2, h3, h4, generateTable, b, code, list } = style
  const showIntermediateSteps = intermediateCalculation || intermediateResult

  let res = ''
  const l = (strings: TemplateStringsArray, ...values: any[]) => res += `${String.raw({ raw: strings }, ...values)}\n\n`


  function domBlockInfo(names: string[],
    criterias: string[],
    normalizedWeights: number[],
    result: boolean[][],
    tableResult: ReturnType<typeof toPlacedTableFormat>,
    actionVerb: string) {
    const getSumString = (dom: boolean[]) => {
      return dom
        .map((v, i) => [v, normalizedWeights[i]] as [boolean, number])
        .filter(t => t[0])
        .map(t => t[1].toLocalFixed(2))
        .join(' + ')
    }

    return list(
      result.map((dom, i) => {
        if (dom.filter(Boolean).length != 0) {
          return `${b`${names[i]}`} ${actionVerb} в категориях: ` +
            `${b`${criterias.filter((_, j) => dom[j]).join(', ')}`} ` +
            (dom.filter(Boolean).length == 1 ?
              code`=> ` + b`${code`${tableResult[i].sum.toLocalFixed(2)}`}` :
              code`=> ${getSumString(dom)} = ` + b`${code`${tableResult[i].sum.toLocalFixed(2)}`}`)
        } else {
          return `${b`${names[i]}`} не блокирует ни в одной категории ${b`${code`=> 0`}`}`
        }
      })
    )
  }

  function calculateSubResultTable(data: {
    place: number;
    name: string;
    sum: number
  }[]) {
    return [
      ['Вариант', 'Баллы', 'Место'],
      ...data.map(v => [b`${v.name}`, v.sum.toLocalFixed(2), (v.place + 1).toString()])
    ]
  }

  function tournamentBlockInfo(names: string[],
    criterias: string[],
    normalizedWeights: number[],
    result: ReturnType<typeof tournament>) {

    return list(
      result.flatMap((res, i) => {
        const name = b`${names[i]}` + ` - в категории:`

        const sub = res
          .map((item, j) => {
            let res = b`${criterias[j]}` + ` – `

            if (item.less.length) {
              res += `опережает ${b`${item.less.map(i => names[i]).join(', ')}`} `

              const sum = item.less.map(_ => normalizedWeights[j].toLocalFixed(2)).join(' + ')
              res += item.less.length != 1 ?
                code`=> ${sum} = ` + b`${code`${(normalizedWeights[j] * item.less.length).toLocalFixed(2)}`}` :
                code`=> ` + b`${code`${normalizedWeights[j].toLocalFixed(2)}`}`
            }

            if (item.equal.length) {
              res += (style.reportVatiant == 'latex' ? '\\\\' : `;`) + `Симметрично c ${b`${item.equal.map(i => names[i]).join(', ')}`} `
              res += code`=> ${normalizedWeights[j].toLocalFixed(2)} / ${item.equal.length + 1} = ` + b`${code`${(normalizedWeights[j] / (item.equal.length + 1)).toLocalFixed(2)}`}`
            }

            return res
          })
          .filter((_, j) => res[j].equal.length || res[j].less.length)

        return [name, sub]
      })
    )

  }



  l`${h1`Система поддержки принятия решений`}`
  l`${h2`Исходные данные`}`

  l`${generateTable(
    [
      ['', 'Вес', ...table.names],
      ...table.criterias.map((criteria, i) => ([
        b`${table.order[i] == 'asc' ? '↑' : '↓'} ${criteria}`,
        table.weights[i].toLocalFixed(2),
        ...table.values[i].map(v => v.toString())
      ]))
    ],
    { align: ['l', 'c', ...table.names.map(() => 'c')], caption: 'Исходные данные', center: true }
  )}`

  if (table.weights.some((t, i) => t !== normalizedWeights[i])) {
    l`${h3`Нормализованные веса`}`
    l`Для корректной работы алгоритма веса критериев были нормализованы.`

    l`${list(table.criterias.map((criteria, i) =>
      `${b`${criteria}`} - ${normalizedWeights[i].toLocalFixed(2)}`))}`
  }


  if (description || matrixBR || showIntermediateSteps)
    l`${h2`Ход решения`}`

  if (description) {
    l`Для определения оптимального варианта были построены матрицы бинарных отношений (БО),
  после чего к ним были применены следующие механизмы:`
    l`${list([
      'Механизмы доминирования',
      'Механизмы блокирования',
      'Турнирный механизм',
      'Механизм K-max',
    ], { skipFirstStep: true })}`
    l`По каждому механизму был выбран лучший вариант, после чего была составлена сводная таблица с результатами`

  }

  if (matrixBR) {
    l`${h3`Матрицы бинарных отношений`}`
    binaryRelationship.forEach((matrix, i) => {
      if (style.reportVatiant != 'latex')
        l`${h4`${table.criterias[i]}`}`

      l`${generateTable(
        [
          ['', ...table.names.map((_, i) => b`${i + 1}`)],
          ...matrix.map((row, i) => ([
            b`${i + 1}`,
            ...row.map(v => v.toString())
          ]))
        ],
        { align: ['l', ...table.names.map(() => 'c')], caption: `Матрица БО для категории ${table.criterias[i]}`, center: true }
      )}`
    })
  }

  if (showIntermediateSteps) {

    l`${h3`Механизм доминирования`}`
    l`Сколько раз варианты доминируют по всем БО. В матричном виде выбираются варианты, у которых в строках все значения равны 1.`

    if (intermediateCalculation)
      l`${domBlockInfo(table.names, table.criterias, normalizedWeights, dominateResult, dominateTableResult, 'доминируют')}`
    if (intermediateResult)
      l`${generateTable(calculateSubResultTable(dominateTableResult), {
        align: ['l', 'c', 'c'],
        caption: 'Сводная таблица результатов механизма доминирования',
        center: true
      })}`

    l`${h3`Механизм блокирования`}`
    l`Сколько раз варианты блокируют по всем БО. В матричном виде выбираются варианты, у которых в столбцах все значения равны 1.`

    if (intermediateCalculation)
      l`${domBlockInfo(table.names, table.criterias, normalizedWeights, blockResult, blockTableResult, 'блокируют')}`
    if (intermediateResult)
      l`${generateTable(calculateSubResultTable(blockTableResult), {
        align: ['l', 'c', 'c'],
        caption: 'Сводная таблица результатов механизма блокирования',
        center: true
      })}`


    l`${h3`Турнирный механизм`}`
    l`Сколько раз варианты предпочтительнее`

    if (intermediateCalculation)
      l`${tournamentBlockInfo(table.names, table.criterias, normalizedWeights, tournamentResult)}`
    if (intermediateResult)
      l`${generateTable(calculateSubResultTable(tournamentTableResult), {
        align: ['l', 'c', 'c'],
        caption: 'Сводная таблица результатов турнирного механизма',
        center: true
      })}`

    l`${h3`Механизм K-max`}`

    if (intermediateCalculation)
      table.criterias.forEach((criteria, i) => {
        if (style.reportVatiant != 'latex') l`${h4`${criteria}`}`
        l`${generateTable(
          [
            style.reportVatiant == 'latex' ?
              ['', 'HRo+\\\\ER+\\\\NR', 'HRo+\\\\NR', 'HRo+\\\\ER', 'HRo', 'Sjp', 'Sjm'] :
              ['', 'HRo+ER+NR', 'HRo+NR', 'HRo+ER', 'HRo', 'Sjp', 'Sjm'],
            ...table.names.map((name, j) => ([
              b`${name}`,
              ...kmaxTableResult[i][j]
            ]))
          ], {
          caption: `Таблица результатов механизма K-max для категории ${criteria}`,
          notBoldHeader: true,
        }
        )}`
      })


    if (intermediateResult)
      if (style.reportVatiant != 'latex') {
        l`${h4`Итого`}`

        l`${generateTable([
          ['Вариант', 'Сумма sJp', 'Место'],
          ...finalKmaxResult.map((v, i) => [b`${table.names[i]}`, v.sJp.toLocalFixed(2), (v.sJpPlace + 1).toString()])
        ], {
          caption: 'Сводная таблица результатов механизма K-max для sJp',
          center: true
        })}`

        l`${generateTable([
          ['Вариант', 'Сумма sJm', 'Место'],
          ...finalKmaxResult.map((v, i) => [b`${table.names[i]}`, v.sJm.toLocalFixed(2), (v.sJmPlace + 1).toString()])
        ], {
          caption: 'Сводная таблица результатов механизма K-max для sJm',
          center: true
        })}`

      } else {

        l`${generateTable([
          ['Вариант', 'Сумма sJp', 'Место sJp', 'Сумма sJm', 'Место sJm'],
          ...finalKmaxResult.map((v, i) => [
            b`${table.names[i]}`,
            v.sJp.toLocalFixed(2),
            (v.sJpPlace + 1).toString(),
            v.sJm.toLocalFixed(2),
            (v.sJmPlace + 1).toString()
          ])
        ], {
          caption: 'Сводная таблица результатов механизма K-max',
          center: true
        })}`
      }
  }


  l`${h2`Результат`}`
  l`По результатам всех механизмов, в зависимости от полученного места были начислены баллы каждому варианту`

  l`${generateTable([
    ['Вариант', 'Дом', 'Блок', 'Тур', 'Sjp', 'Sjm', 'ИТОГО', 'Место'],
    ...finalResultTable.map((row, i) => ([
      b`${table.names[i]}`,
      ...row.map(v => v.toLocalFixed(2))
    ]))
  ], {
    caption: 'Итоговая таблица результатов',
    center: true
  })}`


  l`${h3`Итоговый вариант`}`
  const bestIndex = finalBestResult.indexOf(true)
  l`Максимальную сумму баллов набрал вариант ${b`${table.names[bestIndex]}`} с суммой ${b`${finalResultTable[bestIndex][5].toLocalFixed(2)}`} баллов`

  return res
}
