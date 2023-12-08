
<template>
  <div class="callapsable">
    <div class="header" @click="onClick">
      <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 28 28" :class="isShow ? 'open' : ''">
        <path d="M3 3 L3 25 L23 14 z" />
      </svg>
      <slot name="header" v-if="!props.name"></slot>
      <component :is="props.headerVariant || 'h4'" v-else>{{ props.name }}</component>
    </div>
    <Transition name="fade">
      <div class="content" v-show="isShow">
        <slot></slot>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const props = defineProps<{
  name?: string,
  headerVariant?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
}>()

const isShow = ref(false)

function onClick() {
  isShow.value = !isShow.value
}

</script>

<style lang="scss" scoped>
.callapsable {
  margin: 10px 0;
}

.header {
  display: flex;
  align-items: center;
  cursor: pointer;
  user-select: none;

  svg {
    margin-right: 10px;
    fill: var(--primary-color);
    transition: transform 0.2s ease;


    &.open {
      transform: rotate(90deg);
    }
  }

  h1,
  h2,
  h3,
  h4,
  h5,
  h6 {
    margin: 0;
  }
}

.content {
  padding-left: 25px;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>