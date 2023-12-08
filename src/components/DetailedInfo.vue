<template>
  <Collapsable name="Подробнее">
    <slot></slot>
    <ul>
      <li v-for="(dom, i) in result">
        <template v-if="dom.filter(Boolean).length != 0">
          <b>
            {{ names[i] }}
          </b>
          {{ actionVerb }} в категориях:
          <b>
            {{ criterias.filter((v, i) => dom[i]).join(', ') }}
          </b>

          <span v-if="dom.filter(Boolean).length != 1">
            <code> => {{ getSumString(dom) }} = </code>
            <b>
              <code> {{ tableResult[i].sum.toLocalFixed(2) }}</code>
            </b>
          </span>
          <span v-else><code> => <b>{{ tableResult[i].sum.toLocalFixed(2) }}</b></code></span>
        </template>
        <template v-else>
          <b>{{ names[i] }}</b> не {{ actionVerb }} ни в одной категории <code> => <b>0</b></code>
        </template>
      </li>
    </ul>
  </Collapsable>
</template>

<script setup lang="ts">
import { toPlacedTableFormat, type InputTable } from '@/core';
import Collapsable from './Collapsable.vue';

const props = defineProps<{
  names: string[],
  criterias: string[],
  normalizedWeights: number[],
  result: boolean[][],
  tableResult: ReturnType<typeof toPlacedTableFormat>,
  actionVerb: string
}>()

function getSumString(dom: boolean[]) {
  return dom
    .map((v, i) => [v, props.normalizedWeights[i]] as [boolean, number])
    .filter(t => t[0])
    .map(t => t[1].toLocalFixed(2))
    .join(' + ')
}

</script>