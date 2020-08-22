import {ref, watch, reactive, toRefs} from 'vue';

export function createContext() {
  return {}
}

export function forwardRef() {

}

let currentStore;
let index = 0;

export function wrap(fn) {
  return (...args) => {
    let store = ref([]);
    // eslint-disable-next-line vue/no-ref-as-operand
    currentStore = store;
    index = 0;

    let r = reactive(fn(...args));

    watch(store, () => {
      // eslint-disable-next-line vue/no-ref-as-operand
      currentStore = store;
      index = 0;

      let res = fn(...args);
      for (let key in res) {
        r[key] = res[key];
      }

      // eslint-disable-next-line vue/no-ref-as-operand
      currentStore = null;
      index = 0;
    });

    return toRefs(r);
  };
}

export function useState(initialValue) {
  let store = currentStore;
  let i = index++;

  if (store.length <= i) {
    if (typeof initialValue === 'function') {
      initialValue = initialValue();
    }
    store.value[index] = initialValue;
  }

  let setValue = v => {
    let nextState = v;
    if (typeof nextState === 'function') {
      nextState = nextState(store.value[index]);
    }

    let val = [...store.value];
    val[i] = nextState;
    store.value = val;
  };

  return [store.value[i], setValue];
}

export function useMemo(fn, deps) {
  deps;
  return fn();
}

export function useEffect(fn, deps) {
  fn;
  deps;
}

export function useLayoutEffect(fn, deps) {
  fn;
  deps;
}

export function useRef(initialValue) {
  let r = ref({current: initialValue});
  return r.value;
}

export function useContext(context) {
  context;
}

export function useCallback(cb, deps) {
  return useMemo(() => cb, deps);
}

export default {
  createContext,
  forwardRef
}
