<template>
  <button v-bind="buttonProps" v-bind:class="{pressed: isPressed}">
    <slot></slot>
    {{count}}
  </button>
</template>

<script>
import {ref} from 'vue';
import {useButton as _useButton} from '@react-aria/button';
import {wrap} from '../react';

const useButton = wrap(_useButton);

export default {
  name: 'Button',
  setup() {
    let count = ref(0);
    let {buttonProps, isPressed} = useButton({
      onPress() {
        count.value++;
      }
    });

    return {count, buttonProps, isPressed}
  }
}
</script>

<style scoped>
button {
  background: green;
  border: none;
  color: white;
  padding: 8px;
  font-size: 16px
}

button.pressed {
  background: darkgreen;
}
</style>
