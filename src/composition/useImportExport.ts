import type { InputTable } from "@/core";
import type { Ref } from "vue";


export function useImportExport(table: Ref<InputTable>) {

  return {
    import: (files: File[] | null) => {
      if (!files) return

      const file = files[0]
      const reader = new FileReader()

      reader.onload = (e) => {
        const text = e.target?.result as string
        const lines = text.split('\n')

        if (lines.length < 5) return

        const names = lines[0].split(',')
        const criterias = lines[1].split(',')
        const order = lines[2].split(',')
        const weights = lines[3].split(',').map(Number)
        const values = lines.slice(4).map(line => line.split(',').map(Number))

        if (criterias.length != order.length ||
          criterias.length != weights.length ||
          criterias.length != values.length) return

        if (values.some(row => row.length != names.length)) return

        table.value = {
          names,
          criterias,
          weights,
          values,
          order: order.map(t => (t == 'asc') ? 'asc' : 'desc')
        }
      }

      reader.readAsText(file)
    },
    export: () => {
      const t = table.value
      const csv = t.names.join(',') + '\n'
        + t.criterias.join(',') + '\n'
        + t.order.join(',') + '\n'
        + t.weights.join(',') + '\n'
        + t.values.map(row => row.join(',')).join('\n')

      const blob = new Blob([csv], { type: 'text/csv' })
      const url = URL.createObjectURL(blob)

      const link = document.createElement('a')
      link.href = url
      link.download = 'table.csv'
      link.click()

      URL.revokeObjectURL(url)
    }
  }
}