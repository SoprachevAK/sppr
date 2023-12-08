import type { InputTable } from "@/core"
import type { Ref } from "vue"
import { generateReport } from "./generateReport"


export function useLatexExport(table: Ref<InputTable>) {
  return {
    export: () => {
      const blob = new Blob([createLatex(table.value)], { type: 'text/latex' })
      const url = URL.createObjectURL(blob)

      const link = document.createElement('a')
      link.href = url
      link.download = 'report.tex'
      link.click()

      URL.revokeObjectURL(url)
    }
  }
}



function getString(strings: TemplateStringsArray, values: any[]) {
  return String.raw({ raw: strings }, ...values.map(v => v.toString().replace(/(?<!\\)_/g, '\\_')))
}

type List = (string | List)[]
function list(lines: List, options?: { skipFirstStep?: boolean }) {
  let res = ''

  if (options?.skipFirstStep) res += `\\setlist{nolistsep}\n`

  const addList = (lines: List, level: number) => {
    const indent = '  '.repeat(level)
    if (level != 0) res += indent + `\\setlist{nolistsep}\n`
    res += indent + `\\begin{itemize}\n`
    res += indent + `\\itemsep0em\n`
    for (const line of lines) {
      if (typeof line === 'string') {
        res += `${'  '.repeat(level + 1)}\\item ${line}\n`
      } else {
        addList(line, level + 1)
      }
    }
    res += `${'  '.repeat(level)}\\end{itemize}\n`
    if (level != 0) res += indent + `\\setlist{noitemsep}\n`
  }

  addList(lines, 0)


  if (options?.skipFirstStep) res += `\\setlist{}`

  return res
}

function h1(strings: TemplateStringsArray, ...values: any[]) {
  return `\\section{${getString(strings, values)}}`
}

function h2(strings: TemplateStringsArray, ...values: any[]) {
  return `\\subsection{${getString(strings, values)}}`
}

function h3(strings: TemplateStringsArray, ...values: any[]) {
  return `\\subsubsection{${getString(strings, values)}}`
}

function h4(strings: TemplateStringsArray, ...values: any[]) {
  return `\\paragraph{${getString(strings, values)}}`
}

function b(strings: TemplateStringsArray, ...values: any[]) {
  return `\\textbf{${getString(strings, values)}}`
}

function code(strings: TemplateStringsArray, ...values: any[]) {
  return `\\texttt{${getString(strings, values)}}`
}

function generateTable(data: string[][], options?: { caption?: string, align?: string[], center?: boolean, notBoldHeader?: boolean }) {
  let res = ''

  const align = (options?.align ?? new Array(data[0].length).fill('c')).join(' | ')

  res += `\\begin{table}[H]\n`
  if (options?.center) res += `  \\centering\n`
  res += `  \\begin{tabular}{|${align}|}\n`
  res += `    \\hline\n`

  data.forEach((row, i) => {
    res += `    ` + row
      .map(r => options?.notBoldHeader || i != 0 ? r.replace(/(?<!\\)_/g, '\\_') : b`${r}`)
      .join(' & ') + `\\\\\n`
    res += `    \\hline\n`
  })

  res += `  \\end{tabular}\n`
  if (options?.caption) res += `\\caption{${options.caption}}\n`
  res += `\\end{table}\n`

  return res
}

function createLatex(table: InputTable) {
  const report = `
\\documentclass[a4paper,12pt]{article}
\\usepackage[left=2.0cm, right=2.0cm, top=2.5cm, bottom=2.5cm]{geometry}

\\usepackage{float}
\\usepackage[utf8]{inputenc}
\\usepackage{enumitem}

\\usepackage[T2A]{fontenc}
\\usepackage[english,russian]{babel}


\\begin{document}
  ${generateReport(table, {
    h1, h2, h3, h4, b, code, list, generateTable, reportVatiant: 'latex'
  })}
\\end{document}
`
  return report
}
