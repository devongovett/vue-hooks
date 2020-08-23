import {watch, reactive, toRefs, shallowRef, onUpdated, onMounted, onBeforeUnmount, isRef, isReactive} from 'vue';

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

    let _effects = effects;
    let _layoutEffects = layoutEffects;
    let runEffects = () => {
      _layoutEffects.forEach((fn) => fn());
      requestAnimationFrame(() => {
        _effects.forEach((fn) => fn());
      });
    };

    onMounted(runEffects);
    onUpdated(runEffects);

    let r = reactive(fn(...args));

    let update = () => {
      reset(store);
      _effects = effects;
      _layoutEffects = layoutEffects;

      let res = fn(...args);
      for (let key in res) {
        r[key] = res[key];
      }

      reset(null);
    };

    watch(store, update);
    let watchSources = args.filter(arg => isRef(arg) || isReactive(arg));
    if (watchSources.length > 0) {
      watch(watchSources, update);
    }

    return toRefs(r);
  };
}

export function useReducer(reducer, initialArg, init) {
  if (!currentStore) {
    throw new Error('Hook called not in a component');
  }

  let store = currentStore;
  let i = index++;

  if (store.value.length <= i) {
    let initialValue = initialArg;
    if (typeof init === 'function') {
      initialValue = init(initialArg);
    }

    let dispatch = action => {
      let prev = store.value[i][0];
      let nextState = reducer(prev, action);
      if (nextState === prev) {
        return;
      }

      let newStore = [...store.value];
      newStore[i] = [nextState, dispatch];
      store.value = newStore;
    };

    store.value[i] = [initialValue, dispatch];
  }

  return store.value[i];
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

  if (store.length <= i) {
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

  let store = currentStore;
  let i = index++;

  if (store.value.length <= i) {
    queue.push(() => {
      let res = fn();
      if (typeof res === 'function') {
        store.value[i][0] = res;
      }
    });
    store.value[i] = [null, deps];

    onBeforeUnmount(() => {
      if (store.value[i][0]) {
        store.value[i][0]();
      }
    });
  } else {
    let [prevFn, prevDeps] = store.value[i];
    if (!prevDeps || !deps || !shallowEqualArrays(prevDeps, deps)) {
      if (prevFn) queue.push(prevFn);
      queue.push(() => {
        let res = fn();
        if (typeof res === 'function') {
          store.value[i][0] = res;
        }
      });
      store.value[i] = [null, deps];
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
  forwardRef,
  isValidElement(v) { return !!v;},
  Children: {
    forEach(children, fn) {
      children.forEach(fn);
    }
  }
}
