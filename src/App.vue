<template>
  <div>
    <h1>Система поддержки принятия решений (СППР)</h1>

    <div ref="dropZoneRef" class="drop-zone" :class="isOverDropZone ? 'drop-enabled' : ''">
      <div :class="isOverDropZone ? 'opacity-0' : ''">
        <InputTableVue v-bind="table" @onExport="importExport.export" />
      </div>
    </div>

    <Collapsable name="Нормализированные веса">
      <ul>
        <li v-for="(weight, i) in normalizedWeights">
          <b>{{ table.names[i] }}</b> - {{ weight.toLocalFixed(2) }}
        </li>
      </ul>
    </Collapsable>

    <Collapsable name="Матрицы БО" header-variant="h2">
      <div class="bo-list">
        <BinaryRelationshipCard v-for="(item, i) in binaryRelationship" :BRMatrix="item" :title="table.criterias[i]" />
      </div>
    </Collapsable>


    <Collapsable name="Механизм доминирования" header-variant="h2">
      <DetailedInfo :names="table.names" :criterias="table.criterias" :result="dominateResult"
        :table-result="dominateTableResult" :normalized-weights="normalizedWeights" action-verb="доминирует">
        Сколько раз варианты доминируют по всем БО
      </DetailedInfo>
      <SubResultTable :table="calculateSubResultTable(dominateTableResult)" />
    </Collapsable>


    <Collapsable name="Механизм блокировки" header-variant="h2">
      <DetailedInfo :names="table.names" :criterias="table.criterias" :result="blockResult"
        :table-result="blockTableResult" :normalized-weights="normalizedWeights" action-verb="блокирует">
        Сколько раз варианты блокируются по всем БО
      </DetailedInfo>
      <SubResultTable :table="calculateSubResultTable(blockTableResult)" />
    </Collapsable>

    <Collapsable name="Турнирный механизм" header-variant="h2">
      <TournamentDetail :names="table.names" :criterias="table.criterias" :result="tournamentResult"
        :table-result="tournamentTableResult" :normalized-weights="normalizedWeights" />
      <SubResultTable :table="calculateSubResultTable(tournamentTableResult)" />
    </Collapsable>

    <Collapsable name="Механизм K-max" header-variant="h2">
      <Collapsable name="Подробнее">
        <div v-for="(criteria, i) in table.criterias">
          <h3>{{ criteria }}</h3>
          <SubResultTable class="hro-table" :table="{
            columnNames: ['', 'HRo+ER+NR', 'HRo+NR', 'HRo+ER', 'HRo', 'Sjp', 'Sjm'],
            rowNames: table.names,
            matrix: kmaxTableResult[i],
            hightlight: kmaxTableResult[i].map(v => v[5] != '-')
          }" />
        </div>
      </Collapsable>

      <div class="k-max-table">
        <SubResultTable :table="{
          columnNames: ['Вариант', 'Сумма sJp', 'Место'],
          rowNames: table.names,
          matrix: finalKmaxResult.map(v => [v.sJp.toLocalFixed(2), `${v.sJpPlace + 1}`]),
          hightlight: finalKmaxResult.map(v => v.sJpPlace == 0)
        }" />

        <SubResultTable :table="{
          columnNames: ['Вариант', 'Сумма sJm', 'Место'],
          rowNames: table.names,
          matrix: finalKmaxResult.map(v => [v.sJm.toLocalFixed(2), `${v.sJmPlace + 1}`]),
          hightlight: finalKmaxResult.map(v => v.sJmPlace == 0)
        }" />
      </div>

    </Collapsable>


    <h2>Итоговый результат</h2>
    Бальная таблица
    <SubResultTable class="hro-table" :table="{
      columnNames: ['Вариант', 'Дом', 'Блок', 'Тур', 'Sjp', 'Sjm', 'ИТОГО'],
      rowNames: table.names,
      matrix: finalResultTable,
      hightlight: finalBestResult
    }" />

    <h2>Отчёт</h2>
    <div class="export-section">
      <button @click="mdExport">Скачать в Markdown формате</button>
      <button @click="latexExport">Скачать в Latex формате</button>
    </div>
  </div>
</template>

<script setup lang="ts">


import { computed, ref } from 'vue';
import { useLocalStorage, useDropZone, reactify, toRefs } from '@vueuse/core'

import InputTableVue from './components/InputTable/Index.vue'
import SubResultTable from './components/SubResultTable.vue';
import BinaryRelationshipCard from './components/BinaryRelationshipCard.vue';
import Collapsable from './components/Collapsable.vue';
import TournamentDetail from './components/TournamentDetail.vue';
import DetailedInfo from './components/DetailedInfo.vue';

import { useImportExport } from './composition/useImportExport';
import { useMarkdownExport } from './composition/useMarkdownExport';
import { useLatexExport } from './composition/useLatexExport';

import { type InputTable } from './core';
import { sppr } from './core/sppr';


const spprReactive = reactify(sppr)

const dropZoneRef = ref<HTMLDivElement>()

const table = useLocalStorage<InputTable>("table3", {
  names: ['Lada', 'Volvo', 'Mers'],
  criterias: ['K1', 'L2', 'K3'],
  weights: [0.4, 0.3, 0.2],
  values: [
    [1, 2, 3],
    [4, 5, 6],
    [7, 8, 9],
  ],
  order: ['asc', 'asc', 'asc']
})

const importExport = useImportExport(table)
const { isOverDropZone } = useDropZone(dropZoneRef, { onDrop: importExport.import })

const { export: mdExport } = useMarkdownExport(table)
const { export: latexExport } = useLatexExport(table)

const spprRes = spprReactive(table)

const {
  normalizedWeights,
  binaryRelationship,
  dominateResult,
  blockResult,
  tournamentResult,
  finalKmaxResult,
  dominateTableResult,
  blockTableResult,
  tournamentTableResult,
  kmaxTableResult,
  finalResult: finalResultTable,
  finalBestResult
} = toRefs(spprRes)

function calculateSubResultTable(data: {
  place: number;
  name: string;
  sum: number
}[]) {
  return {
    columnNames: ['Вариант', 'Баллы', 'Место'],
    rowNames: data.map(v => v.name),
    matrix: data.map(v => [v.sum.toLocalFixed(2), (v.place + 1).toString()]),
    hightlight: data.map(v => v.place == 0)
  }
}

</script>

<style lang="scss">
.drop-zone {

  .download {
    padding: 5px;
    border-radius: 5px;

    &:hover {
      background-color: #595959;
    }
  }

  &.drop-enabled {
    border: 4px dashed #ccc;
    padding: -4px;
    border-radius: 30px;
    position: relative;

    &::before {
      content: 'Перетащите CSV файл конфига сюда';
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      font-size: 30px;
      font-weight: 600;
      color: #ccc;
    }
  }

  .opacity-0 {
    opacity: 0;
  }
}

.bo-list {
  display: flex;
  flex-wrap: wrap;
  justify-content: left;
  gap: 20px;
}

h4 {
  margin: 0;
}


ul {
  margin-left: 0;
  padding-left: 20px;
}

.tournament {
  &>li {
    margin-bottom: 15px;
  }
}

.hro-table {
  table {
    thead {
      th:not(:first-child):not(:last-child) {
        min-width: 100px;
      }
    }

    td[data-content='0'] {
      color: var(--zero-color);
    }
  }
}

.k-max-table {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  margin: 20px 0;

  thead {
    th:not(:first-child) {
      min-width: 100px;
    }
  }

  .sub-result-table {
    margin: 0;
  }
}

.export-section {
  display: flex;
  gap: 20px;

  button {
    padding: 10px;
    border-radius: 10px;
  }
}

code {
  // font-size: 15px;
  // font-family: inherit;
}
</style>



