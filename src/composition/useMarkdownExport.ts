import type { InputTable, toPlacedTableFormat } from "@/core"
import type { Ref } from "vue"

import { markdownTable } from 'markdown-table'
import { generateReport } from "./generateReport"

export function useMarkdownExport(table: Ref<InputTable>) {
  return {
    export: () => {
      const blob = new Blob([createMarkdown(table.value)], { type: 'text/markdown' })
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

function createMarkdown(table: InputTable) {
  return generateReport(table, {
    h1, h2, h3, h4, b, code, list, generateTable: markdownTable
  })
}
