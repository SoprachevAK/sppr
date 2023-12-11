import type { InputTable } from "@/core"
import type { Ref } from "vue"


export function useLatexExport(table: Ref<InputTable>, options: {
  intermediateCalculation: Ref<boolean>
  intermediateResult: Ref<boolean>
  matrixBR: Ref<boolean>
  compactLists: Ref<boolean>
  description: Ref<boolean>
  exportPreamble: Ref<boolean>
}) {
  return {
    export: async () => {

      const latexText = await createLatex(table.value, {
        intermediateCalculation: options.intermediateCalculation.value,
        intermediateResult: options.intermediateResult.value,
        matrixBR: options.matrixBR.value,
        compactLists: options.compactLists.value,
        exportPreamble: options.exportPreamble.value,
        description: options.description.value
      })

      const blob = new Blob([latexText], { type: 'text/latex' })
      const url = URL.createObjectURL(blob)

      const link = document.createElement('a')
      link.href = url
      link.download = 'report.tex'
      link.click()

      URL.revokeObjectURL(url)
    }
  }
}

function escapeLatex(str: string) {
  return str
    .replace(/(?<!\\)_/g, '\\_')
    .replace(/(?<!\\)#/g, '\\#')
}

function getString(strings: TemplateStringsArray, values: any[]) {
  return String.raw({ raw: strings }, ...values.map(v => escapeLatex(v.toString())))
}

type List = (string | List)[]
function list(lines: List, options?: { skipFirstStep?: boolean, compact?: boolean }) {
  let res = ''

  if (options?.skipFirstStep || options?.compact) res += `\\setlist{nolistsep}\n`

  const addList = (lines: List, level: number) => {
    const indent = '  '.repeat(level)
    const noListSep = options?.compact && level != 0

    if (noListSep) res += indent + `\\setlist{nolistsep}\n`
    res += indent + `\\begin{itemize}\n`

    if (options?.compact) res += indent + `\\itemsep0em\n`

    for (const line of lines) {
      if (typeof line === 'string') {
        res += `${'  '.repeat(level + 1)}\\item ${line}\n`
      } else {
        addList(line, level + 1)
      }
    }
    res += `${'  '.repeat(level)}\\end{itemize}\n`
    if (noListSep) res += indent + `\\setlist{}\n`
  }

  addList(lines, 0)


  if (options?.skipFirstStep || options?.compact) res += `\\setlist{}`

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
      .map(r => {
        if (i == 0 && r.includes('\\\\')) {
          if (options?.notBoldHeader) return `\\makecell[l]{${r}}`
          return `\\makecell[l]{${r.split('\\\\').map(s => b`${s}`).join('\\\\')}}`
        }
        return options?.notBoldHeader || i != 0 ? escapeLatex(r) : b`${r}`
      })
      .join(' & ') + `\\\\\n`
    res += `    \\hline\n`
  })

  res += `  \\end{tabular}\n`
  if (options?.caption) res += `\\caption{${options.caption}}\n`
  res += `\\end{table}\n`

  return res
}

async function createLatex(table: InputTable, options: {
  intermediateCalculation: boolean
  intermediateResult: boolean
  matrixBR: boolean
  compactLists: boolean
  exportPreamble: boolean,
  description?: boolean
}) {
  const { generateReport } = await import('./generateReport')

  const preamble = `
\\documentclass[a4paper,12pt]{article}
\\usepackage[left=2.0cm, right=2.0cm, top=2.5cm, bottom=2.5cm]{geometry}

\\usepackage{float}
\\usepackage[utf8]{inputenc}
\\usepackage{enumitem}
\\usepackage{makecell}

\\usepackage[T2A]{fontenc}
\\usepackage[english,russian]{babel}


\\begin{document}
  
`

  const report = (options.exportPreamble ? preamble : '') +
    generateReport(table, {
      h1, h2, h3, h4, b, code, generateTable,
      list: (lines: List, opt?: { skipFirstStep?: boolean }) => list(lines, { ...opt, compact: options.compactLists }),
      reportVatiant: 'latex',
      intermediateCalculation: options.intermediateCalculation,
      intermediateResult: options.intermediateResult,
      matrixBR: options.matrixBR,
      description: options.description
    }) +
    (options.exportPreamble ? '\n\\end{document}' : '')

  return report
}
