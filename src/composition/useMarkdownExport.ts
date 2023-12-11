import type { InputTable } from "@/core"
import type { Ref } from "vue"

export function useMarkdownExport(table: Ref<InputTable>, options: {
  intermediateCalculation: Ref<boolean>,
  intermediateResult: Ref<boolean>,
  description: Ref<boolean>
  matrixBR: Ref<boolean>
}) {
  return {
    export: async () => {
      const mdText = await createMarkdown(table.value, {
        intermediateCalculation: options.intermediateCalculation.value,
        intermediateResult: options.intermediateResult.value,
        description: options.description.value
      })
      const blob = new Blob([mdText], { type: 'text/markdown' })
      const url = URL.createObjectURL(blob)

      const link = document.createElement('a')
      link.href = url
      link.download = 'report.md'
      link.click()

      URL.revokeObjectURL(url)
    }
  }
}


function getString(strings: TemplateStringsArray, values: any[]) {
  return String.raw({ raw: strings }, ...values)
}

type List = (string | List)[]
function list(lines: List) {
  let res = ''

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
  return `# ${getString(strings, values)}`
}

function h2(strings: TemplateStringsArray, ...values: any[]) {
  return `## ${getString(strings, values)}`
}

function h3(strings: TemplateStringsArray, ...values: any[]) {
  return `### ${getString(strings, values)}`
}

function h4(strings: TemplateStringsArray, ...values: any[]) {
  return `#### ${getString(strings, values)}`
}

function b(strings: TemplateStringsArray, ...values: any[]) {
  return `**${getString(strings, values)}**`
}

function code(strings: TemplateStringsArray, ...values: any[]) {
  return `\`${getString(strings, values)}\``
}

async function createMarkdown(table: InputTable, options?: { intermediateCalculation?: boolean, intermediateResult?: boolean, description?: boolean }) {
  const { markdownTable } = await import('markdown-table')
  const { generateReport } = await import('./generateReport')

  return generateReport(table, {
    h1, h2, h3, h4, b, code, list, generateTable: markdownTable,
    intermediateCalculation: options?.intermediateCalculation,
    intermediateResult: options?.intermediateResult,
    description: options?.description
  })
}
