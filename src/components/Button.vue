<template>
  <button
    v-bind="buttonProps"
    class="text-white font-bold py-2 px-4 rounded cursor-default focus:outline-none transition ease-in-out duration-150"
    v-bind:class="{'bg-blue-700': isPressed, 'bg-blue-500': !isPressed, 'shadow-outline': isFocusVisible}">
    <slot></slot>
  </button>
</template>

<script>
import {useButton} from '@react-aria/button';
import {wrap} from '../react';
import {mergeProps} from '@react-aria/utils';
import {useFocusRing} from '@react-aria/focus';

export default {
  name: 'Button',
  props: {
    onPress: Function
  },
  setup: wrap((props) => {
    let {buttonProps, isPressed} = useButton(props);
    let {focusProps, isFocusVisible} = useFocusRing();

    return {
      buttonProps: mergeProps(buttonProps, focusProps),
      isPressed,
      isFocusVisible
    }
  })
}
</script>
