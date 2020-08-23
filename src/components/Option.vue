<script>
import {useOption} from '@react-aria/listbox';
import {wrap, useRef, useLayoutEffect} from '../react';
import {ref} from 'vue';

export default {
  props: {
    state: Object,
    item: Object
  },
  setup: wrap(props => {
    let {state, item} = props;

    let vueRef = ref(null);
    let reactRef = useRef();
    useLayoutEffect(() => reactRef.current = vueRef.value);

    let isDisabled = state.disabledKeys.has(item.key);
    let isSelected = state.selectionManager.isSelected(item.key);
    let isFocused = state.selectionManager.focusedKey === item.key;
    let {optionProps} = useOption(
      {
        key: item.key,
        isDisabled,
        isSelected,
        shouldSelectOnPressUp: true,
        shouldFocusOnHover: true
      },
      state,
      reactRef
    );

    return {
      state,
      optionProps,
      item,
      isSelected,
      isFocused,
      ref: vueRef
    };
  })
}
</script>

<template>
  <li
    v-bind="optionProps"
    class="cursor-default select-none relative py-2 pl-3 pr-9 focus:outline-none"
    :class="{'text-white': isFocused, 'text-gray': !isFocused, 'bg-blue-600': isFocused, 'font-semibold': isSelected, 'font-normal': !isSelected}"
    ref="ref">
    <div class="flex items-center space-x-3">
      <slot />
    </div>
    <span
      v-if="isSelected"
      aria-hidden="true"
      class="absolute inset-y-0 right-0 flex  items-center pr-4"
      :class="{'text-white': isFocused, 'text-gray-600': !isFocused}">
      <svg class="h-5 w-5 fill-current" viewBox="0 0 20 20">
        <path
          fill-rule="evenodd"
          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
          clip-rule="evenodd"
        />
      </svg>
    </span>
  </li>
</template>
