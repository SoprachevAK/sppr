
<template>
  <div class="sub-result-table">
    <table>
      <thead>
        <tr>
          <th v-for="name in props.table.columnNames">{{ name }}</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(row, i) in props.table.matrix" :class="props.table.hightlight?.[i] ? 'highlight' : ''">
          <th>{{ props.table.rowNames[i] }} </th>
          <td v-for="value in row" :data-content="value">{{ value }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">

const props = defineProps<{
  table: {
    columnNames: string[]
    rowNames: string[]
    matrix: number[][] | string[][]
    hightlight?: boolean[]
  }
}>()

</script>

<style lang="scss">
@import '../style/table.scss';
@import '../style/shared';

.sub-result-table {
  margin-top: 20px;
  margin-bottom: 20px;

  table {
    @include table($border-color, $border, $radius);

    td {
      padding: 4px;
      margin: 0;
    }

    thead {
      th {
        padding: 8px;
        min-width: 150px;
      }
    }

    tbody {
      tr.highlight {
        background-color: #393939;
      }

      th {
        padding: 0 8px;
      }
    }
  }
}
</style>