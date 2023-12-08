
<template>
  <div>
    <table class="input-table">
      <thead>
        <tr>
          <th>
            <button class="export" @click="exportClick">Экспортировать</button>
          </th>
          <th>Вес</th>
          <th v-for="(name, i) in props.names">
            <button class="remove prevent-select" @click="removeColumn(i)">+</button>
            <input type="text" :value="name" @input="e => changeName(i, e)" />
          </th>

          <button class="add prevent-select" @click="addColumn">+</button>
        </tr>
      </thead>

      <tbody>
        <tr v-for="(criteria, criteriaI) in props.criterias">
          <th>
            <button class="asc-desc-btn" @click="clickOrder(criteriaI)">{{ props.order[criteriaI] == 'asc' ? '↑' : '↓'
            }}</button>
            <input class="criteria" type="text" :value="criteria" @input="e => changeCriteria(criteriaI, e)" />
            <button class="remove prevent-select" @click="removeRow(criteriaI)">+</button>
          </th>
          <td>
            <input type="number" min="0" max="10" step="0.1" :value="props.weights[criteriaI]"
              @input="e => changeWeight(criteriaI, e)" />
          </td>
          <td v-for="(name, nameI) in props.names">
            <input type="number" :value="props.values[criteriaI][nameI]" @input="e => changeValue(criteriaI, nameI, e)" />
          </td>
        </tr>

        <button class="add add-row prevent-select" @click="addRow">+</button>
      </tbody>
    </table>

  </div>
</template>


<script setup lang="ts">
import { type Order } from '@/core';

const props = defineProps<{
  names: string[],
  criterias: string[],
  weights: number[],
  values: number[][],
  order: Order[]
}>()

const emit = defineEmits<{
  onExport: []
}>()

function exportClick() {
  emit('onExport')
}

function changeName(i: number, t: any) {
  props.names[i] = t.target.value
}

function changeCriteria(i: number, t: any) {
  props.criterias[i] = t.target.value
}

function changeWeight(i: number, t: any) {
  props.weights[i] = Number.parseFloat(t.target.value)
}

function changeValue(i: number, j: number, t: any) {
  props.values[i][j] = Number.parseFloat(t.target.value)
}

function clickOrder(i: number) {
  props.order[i] = (props.order[i] == 'asc') ? 'desc' : 'asc'
}

function addColumn() {
  props.names.push('')
  for (let i = 0; i < props.values.length; i++) {
    props.values[i].push(0)
  }
}

function removeColumn(i: number) {
  props.names.splice(i, 1)
  for (let j = 0; j < props.values.length; j++) {
    props.values[j].splice(i, 1)
  }
}

function addRow() {
  props.criterias.push('')
  props.weights.push(0)
  props.values.push(props.names.map(() => 0))
  props.order.push('asc')
}

function removeRow(i: number) {
  props.criterias.splice(i, 1)
  props.weights.splice(i, 1)
  props.values.splice(i, 1)
  props.order.splice(i, 1)
}


</script>
 

<style lang="scss">
@import '../../style/table.scss';
@import '../../style/shared';


.input-table {
  @include table($border-color, $border, $radius);
  @include table-oscillator();

  position: relative;

  thead {
    th {
      padding: 8px;
      position: relative;
      min-width: 113px;

      .remove {
        top: -25px;
        left: 50%;
      }
    }

    th:first-child {
      min-width: 243px;
      height: 42px;
    }
  }

  tbody {

    input.criteria {
      padding-left: 0;
      width: 200px;
      text-align: left;
    }

    tr {
      position: relative;

      th {
        display: flex;

        .remove {
          left: -25px;
          top: 50%;
          transform: translateY(-50%) rotate(45deg);
        }
      }


      .add {
        right: -30px;
        top: 50%;
        transform: translateY(-50%);
      }
    }
  }

  tr {

    td,
    th {
      padding: 0;

      input {
        font-family: inherit;
        font-weight: inherit;
        font-size: inherit;
        text-align: inherit;
        color: inherit;
        padding: 10px;
        border: none;
        background: none;
        width: 100px;
      }

      input[type="number"] {
        margin-left: 12px;
        padding: 10px 0;
      }
    }
  }


  .remove,
  .add {
    position: absolute;
    background: none;
    font-weight: 800;
    font-size: 20px;
    cursor: pointer;

    transition: 0.2s;
    margin-top: -3px;

    color: rgba(255, 255, 255, 0.1);

    @media (prefers-color-scheme: light) {
      color: rgba(0, 0, 0, 0.15);
    }
  }

  .remove {
    transform: translate(-50%) rotate(45deg);

    &:hover {
      color: rgb(255, 0, 0);
    }
  }

  .add {
    &:hover {
      color: rgb(50, 236, 50);
    }
  }

  .add-row {
    bottom: -25px;
    left: 100;
    transform: translate(-50%);
  }

  tr:nth-last-child(2) th:first-child {
    border-bottom-left-radius: $radius;
  }

  tr:nth-last-child(2) td:last-child {
    border-bottom-right-radius: $radius;
  }

  tr:first-child th:nth-last-child(2) {
    border-top-right-radius: $radius;
  }

  .export {
    color: inherit;
    padding: 3px 7px;
    border-radius: 5px;
  }

  margin-top: 20px;
  margin-bottom: 30px;
  margin-left: 20px;
}

.asc-desc-btn {
  font-weight: 500;
  margin: 5px;
  margin: 3px;
  background: none;
  transition: 0.1s;

  &:hover {
    background: none;
    color: var(--hover-color);
  }
}
</style>
