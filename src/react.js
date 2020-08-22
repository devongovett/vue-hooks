import {watch, reactive, toRefs, shallowRef, onUpdated, onMounted, onBeforeUnmount} from 'vue';

export function createContext() {
  return {}
}

export function forwardRef() {

}

let currentStore;
let index = 0;
let effects = [];
let layoutEffects = [];

function reset(store) {
  currentStore = store;
  index = 0;
  effects = [];
  layoutEffects = [];
}

export function wrap(fn) {
  return (...args) => {
    let store = shallowRef([]);
    reset(store);

    let runEffects = () => {
      layoutEffects.forEach((fn) => fn());
      requestAnimationFrame(() => {
        effects.forEach((fn) => fn());
      });
    };

    onMounted(runEffects);
    onUpdated(runEffects);

    let r = reactive(fn(...args));

    watch(store, () => {
      reset(store);

      let res = fn(...args);
      for (let key in res) {
        r[key] = res[key];
      }

      reset(null);
    });

    return toRefs(r);
  };
}

export function useReducer(reducer, initialArg, init) {
  if (!currentStore) {
    throw new Error('Hook called not in a component');
  }

  let s = currentStore;
  let store = currentStore.value;
  let i = index++;

  if (store.length <= i) {
    let initialValue = initialArg;
    if (typeof init === 'function') {
      initialValue = init(initialArg);
    }

    let dispatch = action => {
      let nextState = reducer(store[i][0], action);
      let newStore = [...store];
      newStore[i] = [nextState, dispatch];
      s.value = newStore;
    };

    store[i] = [initialValue, dispatch];
  }

  return store[i];
}

export function useState(initialValue) {
  return useReducer((cur, next) => {
    if (typeof next === 'function') {
      next = next(cur);
    }

    return next;
  }, initialValue);
}

export function useMemo(fn, deps) {
  if (!currentStore) {
    throw new Error('Hook called not in a component');
  }

  let store = currentStore.value;
  let i = index++;

  if (store[i] === undefined) {
    let val = fn();
    store[i] = [val, deps];
    return val;
  } else {
    let [prev, prevDeps] = store[i];
    if (!shallowEqualArrays(prevDeps, deps)) {
      let val = fn();
      store[i] = [val, deps];
      return val;
    } else {
      return prev;
    }
  }
}

function shallowEqualArrays(a, b) {
  if (a.length !== b.length) {
    return false;
  }

  return a.every((v, i) => b[i] === v);
}

function _useEffectWithQueue(fn, deps, queue) {
  if (!currentStore) {
    throw new Error('Hook called not in a component');
  }

  let store = currentStore.value;
  let i = index++;

  if (store[i] === undefined) {
    queue.push(() => {
      store[i][0] = fn();
    });
    store[i] = [null, deps];

    onBeforeUnmount(() => {
      if (store[i][0]) {
        store[i][0]();
      }
    });
  } else {
    let [prevFn, prevDeps] = store[i];
    if (!shallowEqualArrays(prevDeps, deps)) {
      if (prevFn) queue.push(prevFn);
      queue.push(() => {
        store[i][0] = fn();
      });
      store[i] = [null, deps];
    }
  }
}

export function useEffect(fn, deps) {
  _useEffectWithQueue(fn, deps, effects);
}

export function useLayoutEffect(fn, deps) {
  _useEffectWithQueue(fn, deps, layoutEffects);
}

export function useRef(initialValue) {
  let [v] = useState({current: initialValue});
  return v;
}

export function useContext(context) {
  // TODO
  context;
}

export function useCallback(cb, deps) {
  return useMemo(() => cb, deps);
}

export default {
  createContext,
  forwardRef
}
