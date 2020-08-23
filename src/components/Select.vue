<script>
import {useSelectState} from '@react-stately/select';
import {useSelect} from '@react-aria/select';
import {useButton} from '@react-aria/button';
import {Item} from "@react-stately/collections";
import {useFocusRing} from "@react-aria/focus";
import {mergeProps} from "@react-aria/utils";
import {wrap, useRef, useLayoutEffect} from '../react';
import ListBox from './ListBox';
import {ref} from 'vue';

export default {
  props: {
    label: String,
    options: Array
  },
  components: {
    ListBox
  },
  setup: wrap(props => {
    let state = useSelectState({
      ...props,
      // HACK: create fake JSX elements. Ideally we'd pass a pre-built collection in here instead.
      items: props.options,
      children: (v) => ({type: Item, key: v.id, props: {children: v.name}})
    });

    let vueRef = ref(null);
    let reactRef = useRef();
    useLayoutEffect(() => reactRef.current = vueRef.value);

    let {labelProps, triggerProps, valueProps, menuProps} = useSelect(
      props,
      state,
      reactRef
    );

    let {buttonProps} = useButton(triggerProps, reactRef);
    buttonProps.onKeyDownCapture = triggerProps.onKeyDownCapture; // TODO: fix this
    let {focusProps, isFocusVisible} = useFocusRing();
    return {
      state,
      labelProps,
      buttonProps: mergeProps(focusProps, buttonProps),
      valueProps,
      menuProps,
      isFocusVisible,
      ref: vueRef
    };
  })
}
</script>

<template>
  <div class="space-y-1 w-48 relative">
    <div
      v-bind="labelProps"
      class="block text-sm leading-5 font-medium text-gray-700">
      {{ label }}
    </div>
    <button
      v-bind="buttonProps"
      class="cursor-default relative w-full rounded-md border pl-3 pr-10 py-2 text-left focus:outline-none transition ease-in-out duration-150 border-gray-400 bg-white"
      :class="{'shadow-outline': isFocusVisible, 'border-blue-400': isFocusVisible}"
      ref="ref">
      <span
        v-bind="valueProps"
        class="flex items-center space-x-3"
        :class="{'text-gray-500': !state.selectedItem, 'text-gray-800': state.selectedItem}">
        {{state.selectedItem ? state.selectedItem.rendered : 'Select an option'}}
      </span>
      <span
        aria-hidden="true"
        class="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
        <svg
          class="h-5 w-5 text-gray-500"
          viewBox="0 0 20 20"
          fill="none"
          stroke="currentColor">
          <path
            d="M7 7l3-3 3 3m0 6l-3 3-3-3"
            stroke-width="1.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </span>
    </button>
    <ListBox v-if="state.isOpen" :state="state" :domProps="menuProps">
      <template v-slot="{item}">
        <slot :item="item" />
      </template>
    </ListBox>
  </div>
</template>
