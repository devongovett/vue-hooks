<template>
  <div id="app">
    <img alt="Vue logo" src="./assets/logo.png">
    <HelloWorld msg="Vue + Tailwind + React Aria"/>
    <Button @press="count++">Count = {{count}}</Button>
    <Select label="Favorite color" :options="items" v-slot="{item}">
      {{item.name}}
    </Select>
  </div>
</template>

<script>
import HelloWorld from './components/HelloWorld.vue'
import Button from './components/Button.vue'
import Select from './components/Select.vue'

export default {
  name: 'App',
  components: {
    HelloWorld,
    Button,
    Select
  },
  data() {
    return {
      count: 0,
      items: ['Red', 'Orange', 'Yellow', 'Green', 'Blue', 'Purple'].map(v => ({id: v.toLowerCase(), name: v}))
    };
  }
}
</script>

<style>
#app {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}
</style>
