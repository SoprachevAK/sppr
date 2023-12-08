<template>
  <Collapsable name="Подробнее">
    Сколько раз варианты предпочтительне
    <ul class="tournament">
      <li v-for="(res, i) in result">
        <b>{{ names[i] }}</b> - в категории:
        <ul>
          <li v-for="(item, j) in res" v-show="item.equal.length || item.less.length">
            <b>{{ criterias[j] }}</b> -
            <span v-if="item.less.length">
              опережает <b>{{ item.less.map(i => names[i]).join(', ') }}</b>
              <code
                v-if="item.less.length != 1"> => {{ item.less.map(_ => normalizedWeights[j].toLocalFixed(2)).join(' + ') }} = <b>{{ (normalizedWeights[j] * item.less.length).toLocalFixed(2) }}</b></code>
              <code v-else> => <b> {{ normalizedWeights[j].toLocalFixed(2) }}</b></code>

            </span>

            <br>

            <span v-if="item.equal.length">
              Симметрично c <b>{{ item.equal.map(i => names[i]).join(', ') }}</b>
              <code> => {{ normalizedWeights[j].toLocalFixed(2) }} / {{ item.equal.length + 1 }} = <b>{{ (normalizedWeights[j] / (item.equal.length + 1)).toLocalFixed(2) }}</b> </code>
            </span>

          </li>
        </ul>
        Итого: <code><b>{{ tableResult[i].sum.toLocalFixed(2) }}</b></code>
      </li>
    </ul>
  </Collapsable>
</template>

<script setup lang="ts">
import { toPlacedTableFormat, type InputTable } from '@/core';
import Collapsable from './Collapsable.vue';
import { tournament } from '@/core/tournament';

const props = defineProps<{
  names: string[],
  criterias: string[],
  normalizedWeights: number[],
  result: ReturnType<typeof tournament>,
  tableResult: ReturnType<typeof toPlacedTableFormat>
}>()

</script>