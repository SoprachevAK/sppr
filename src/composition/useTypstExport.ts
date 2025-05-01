import type { InputTable } from "@/core"
import type { Ref } from "vue"

export function useTypstExport(table: Ref<InputTable>, options: {
  intermediateCalculation: Ref<boolean>,
  intermediateResult: Ref<boolean>,
  description: Ref<boolean>
  matrixBR: Ref<boolean>
}) {
  return {
    export: async () => {
      const reportText = await createTypst(table.value, {
        intermediateCalculation: options.intermediateCalculation.value,
        intermediateResult: options.intermediateResult.value,
        description: options.description.value
      })
      const blob = new Blob([reportText], { type: 'text/markdown' })
      const url = URL.createObjectURL(blob)

      const link = document.createElement('a')
      link.href = url
      link.download = 'report.typ'
      link.click()

      URL.revokeObjectURL(url)
    }
  }
}

function escapeTypst(str: string) {
  return str
    .replace(/(?<!\\)_/g, '\\_')
    .replace(/(?<!\\)#/g, '\\#')
    .replace(/(?<!\\)\*/g, '\\*')
}

function getString(strings: TemplateStringsArray, values: any[]) {
  return String.raw({ raw: strings }, ...values.map(v => escapeTypst(v.toString())))
}

type List = (string | List)[]
function list(lines: List, options?: { compact?: boolean }) {
  let res = options?.compact ? '..\n' : ''

  const addList = (lines: List, level: number) => {
    for (const line of lines) {
      if (typeof line === 'string') {
        res += `${'  '.repeat(level)}- ${line}\n`
      } else {
        addList(line, level + 1)
      }
    }
  }

  addList(lines, 0)

  return res
}

function h1(strings: TemplateStringsArray, ...values: any[]) {
  return `= ${getString(strings, values)}`
}

function h2(strings: TemplateStringsArray, ...values: any[]) {
  return `== ${getString(strings, values)}`
}

function h3(strings: TemplateStringsArray, ...values: any[]) {
  return `=== ${getString(strings, values)}`
}

function h4(strings: TemplateStringsArray, ...values: any[]) {
  return `==== ${getString(strings, values)}`
}

function b(strings: TemplateStringsArray, ...values: any[]) {
  return `generatorBoldBegin${getString(strings, values)}generatorBoldEnd`
}

function code(strings: TemplateStringsArray, ...values: any[]) {
  return `\`${getString(strings, values)}\``
}

function nextLine(strings: TemplateStringsArray, ...values: any[]) {
  return `\\ ${getString(strings, values)}`
}

function postProcessor(text: string) {
  return text
    .replaceAll('generatorBoldBegin', '*')
    .replaceAll('generatorBoldEnd', '*')
}

function generateTable(data: string[][], options?: { caption?: string, align?: string[], center?: boolean, notBoldHeader?: boolean }) {
  let res = ''

  const alignToTypst = (a: string) => {
    switch (a) {
      case 'l': return 'left'
      case 'r': return 'right'
      case 'c': return 'horizon'
      default:
        return 'auto'
    }
  }

  res += `#figure(caption: [${options?.caption ?? 'Таблица'}])[\n`
  res += options?.notBoldHeader ? '' : `  #show table.cell.where(y: 0): set text(weight: "bold")\n`

  res += `  #table(\n`
  res += `    columns: (auto, ${new Array(data[0].length - 1).fill(options?.center ? 'auto' : '1fr').join(', ')}),\n`
  if (options?.align) res += `    align: (${options.align.map(a => alignToTypst(a)).join(', ')}),\n`
  else res += `    align: horizon,\n`

  res += `    table.header(${data[0].map(t => `[${escapeTypst(t)}]`).join(', ')}),\n`
  data.slice(1).forEach((row, i) => {
    res += `    ${row.map(t => `[${escapeTypst(t)}]`).join(', ')},\n`
  })
  res += `  )\n`
  res += `]\n`

  return res
}

async function createTypst(table: InputTable, options?: { intermediateCalculation?: boolean, intermediateResult?: boolean, description?: boolean, compactLists?: boolean }) {
  const { generateReport } = await import('./generateReport')

  return generateReport(table, {
    h1, h2, h3, h4, b, code, generateTable, nextLine,
    postProcessor,
    list: (lines: List, opt?: { skipFirstStep?: boolean }) => list(lines, { ...opt, compact: options?.compactLists ?? true }),
    reportVariant: 'typst',
    intermediateCalculation: options?.intermediateCalculation,
    intermediateResult: options?.intermediateResult,
    description: options?.description
  })
}
