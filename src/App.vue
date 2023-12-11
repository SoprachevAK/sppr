<template>
  <div>
    <div class="main-header">
      <h1>Система поддержки принятия решений (СППР)</h1>
      <a target="_blank" href="https://github.com/SoprachevAK/sppr">
        <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24">
          <path
            d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
        </svg>
      </a>
    </div>

    Заполните таблицу вариантов и предпочтений или перетащите на неё CSV файл для импорта. Так же вы можете <a href=""
      @click.prevent="restore">восстановить</a> таблицу по умолчанию
    <div ref="dropZoneRef" class="drop-zone" :class="isOverDropZone ? 'drop-enabled' : ''">
      <div :class="isOverDropZone ? 'opacity-0' : ''">
        <InputTableVue v-bind="table" @onExport="importExport.export" />
      </div>
    </div>

    <template v-if="!isTableError">

      <Collapsable name="Нормализированные веса">
        <ul>
          <li v-for="(weight, i) in normalizedWeights">
            <b>{{ table.criterias[i] }}</b> - {{ weight.toLocalFixed(2) }}
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
        columnNames: ['Вариант', 'Дом', 'Блок', 'Тур', 'Sjp', 'Sjm', 'ИТОГО', 'Место'],
        rowNames: table.names,
        matrix: finalResultTable,
        hightlight: finalBestResult
      }" />

      <h2>Отчёт</h2>
      <div>
        <input type="checkbox" name="matrinxBR" id="matrinxBR" v-model="matrixBR">
        <label for="matrinxBR">Вывод матриц БО</label>
      </div>

      <div>
        <input type="checkbox" name="description" id="description" v-model="description">
        <label for="description">Вывод описания хода работы</label>
      </div>

      <div>
        <input type="checkbox" name="intermediate-calculation" id="intermediate-calculation"
          v-model="intermediateCalculation">
        <label for="intermediate-calculation">Вывод промежуточных вычислений</label>
      </div>

      <div>
        <input type="checkbox" name="intermediate-result" id="intermediate-result" v-model="intermediateResult">
        <label for="intermediate-result">Вывод промежуточных результатов</label>
      </div>

      <h3>Markdown</h3>
      <button class="report-export" @click="mdExport">Скачать в Markdown формате</button>

      <h3>LaTeX</h3>
      <div class="settings">
        <div>
          <input type="checkbox" name="compact-list" id="compact-list" v-model="latexCompactList">
          <label for="compact-list">Компактные списки</label>
        </div>
        <div>
          <input type="checkbox" name="export-preambula" id="export-preambula" v-model="latexExportPreamble">
          <label for="export-preambula">Экспортировать преамбулу документа</label>
        </div>
      </div>
      <button class="report-export" @click="latexExport">Скачать в Latex формате</button>
      <p v-if="!latexExportPreamble">Для включения в основной документ используйте <code>\input(report.tex)</code>
        <span>, для работы таблиц нужен <code>\usepackage{makecell}</code></span>
        <span v-if="latexCompactList">, для работы компактных списков нужен <code>\usepackage{enumitem}</code></span>
      </p>


    </template>

    <template v-else>
      <i>{{ isTableError }}</i>
    </template>

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

import { type InputTable, validateInputTable } from './core';
import { sppr } from './core/sppr';

const defaulTable: InputTable = {
  names: ['Lada_1', 'Lada_2', 'Lada_3'],
  criterias: ['Стоимость', 'Год выпуска', 'Пробег'],
  weights: [0.3, 0.3, 0.4],
  values: [
    [143000, 150000, 148000],
    [2008, 2009, 2009],
    [170000, 140000, 150000],
  ],
  order: ['desc', 'asc', 'desc']
}

const spprReactive = reactify(sppr)

const dropZoneRef = ref<HTMLDivElement>()

const table = useLocalStorage<InputTable>("table", structuredClone(defaulTable))

const importExport = useImportExport(table)
const { isOverDropZone } = useDropZone(dropZoneRef, { onDrop: importExport.import })

const matrixBR = useLocalStorage('matrixBR', true)
const description = useLocalStorage('description', true)
const intermediateCalculation = useLocalStorage('intermediateCalculation', true)
const intermediateResult = useLocalStorage('intermediateResult', true)

const latexCompactList = useLocalStorage('latexCompactList', true)
const latexExportPreamble = useLocalStorage('latexExportPreambula', true)

const { export: mdExport } = useMarkdownExport(table, { intermediateCalculation, intermediateResult, matrixBR, description })
const { export: latexExport } = useLatexExport(table, { intermediateCalculation, intermediateResult, matrixBR, description, compactLists: latexCompactList, exportPreamble: latexExportPreamble })

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

function restore() {
  table.value = structuredClone(defaulTable)
}

const isTableError = computed(() => {
  const validate = validateInputTable(table.value)
  // if (validateInputTableSize(table.value) !== true) return 'Заполните таблицу вариантов и предпочтений'
  if (validate !== true) {
    console.log(validate);
    return 'Заполните таблицу вариантов и предпочтений'
  }
  return false
})


</script>

<style lang="scss">
.main-header {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 20px;

  svg {
    fill: var(--primary-color);
    min-width: 30px;
    min-height: 30px;
    cursor: pointer;
  }
}

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
      th:not(:first-child) {
        min-width: 90px;
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

.settings {
  margin: 10px 0;
}

.report-export {
  padding: 10px;
  border-radius: 10px;
}
</style>



