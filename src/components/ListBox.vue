<script>
import {useListBox} from '@react-aria/listbox';
import {wrap, useRef, useLayoutEffect} from '../react';
import { mergeProps } from '@react-aria/utils';
import {useOverlay, useDismissButton} from '@react-aria/overlays';
import {useFocusScope} from '@react-aria/focus';
import Option from './Option';
import {ref} from 'vue';

export default {
  props: {
    state: Object,
    domProps: Object
  },
  components: {
    Option
  },
  setup: wrap(props => {
    let {state, domProps} = props;
    let vueRef = ref(null);
    let reactRef = useRef();
    useLayoutEffect(() => reactRef.current = vueRef.value);

    let {listBoxProps} = useListBox(
      {
        ...domProps,
        autoFocus: state.focusStrategy || true,
        disallowEmptySelection: true
      },
      state,
      reactRef
    );

    let vueOverlayRef = ref(null);
    let reactOverlayRef = useRef();
    useLayoutEffect(() => reactOverlayRef.current = vueOverlayRef.value);

    let {overlayProps} = useOverlay(
      {
        onClose: () => state.close(),
        shouldCloseOnBlur: true,
        isOpen: state.isOpen,
        isDismissable: true
      },
      reactOverlayRef
    );

    useFocusScope(reactOverlayRef, {restoreFocus: true});

    let {dismissButtonProps} = useDismissButton({onDismiss: state.close});

    return {
      state,
      overlayProps,
      listBoxProps: mergeProps(listBoxProps, domProps),
      dismissButtonProps,
      ref: vueRef,
      overlayRef: vueOverlayRef
    };
  })
}
</script>

<template>
  <div v-bind="overlayProps" class="absolute mt-1 w-full rounded-md bg-white shadow-lg z-50" ref="overlayRef">
    <button v-bind="dismissButtonProps" />
    <ul ref="ref" v-bind="listBoxProps" class="max-h-56 rounded-md py-1 text-base leading-6 shadow-xs overflow-auto focus:outline-none sm:text-sm sm:leading-5">
      <Option
        v-for="item in state.collection"
        :key="item.key"
        :item="item"
        :state="state">
        <slot :item="item.value" />
      </Option>
    </ul>
    <button v-bind="dismissButtonProps" />
  </div>
</template>
