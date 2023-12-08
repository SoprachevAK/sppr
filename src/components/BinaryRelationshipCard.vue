<template>
  <div class="card">
    <h3>{{ title || '---' }}</h3>
    <table>
      <tr>
        <th></th>
        <th v-for="(item, i) in BRMatrix" :key="i">{{ i + 1 }}</th>
      </tr>
      <tr v-for="(row, i) in BRMatrix" :key="i">
        <th>{{ i + 1 }}</th>
        <td v-for="(item, j) in row" :key="j" :class="item !== 1 ? 'gray' : ''">{{ item }}</td>
      </tr>
    </table>
  </div>
</template>

<script setup lang="ts">

const props = defineProps<{
  BRMatrix: number[][],
  title: string
}>()

</script>

<style lang="scss" scoped>
@import '../style/shared';

.card {
  border: $border;
  border-radius: $radius;
  padding: 10px;
  margin: 10px;
}

h3 {
  margin: 2px;
}

.gray {
  color: var(--zero-color);
}

table {
  margin-top: 15px;
  border-collapse: collapse;

  tr {

    th,
    td {
      text-align: center;
      width: 25px;
      height: 25px;
      color: inherit;
    }

    &:nth-child(1) {
      th {
        border-bottom: 1px solid #ccc;
      }
    }

    th:nth-child(1) {
      border-right: 1px solid #ccc;
    }
  }
}
</style>