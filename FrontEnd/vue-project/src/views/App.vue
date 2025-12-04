
<template>
  <div>
    <nav>
      <router-link to="/">Home</router-link> |
      <router-link to="/get-item">Get Item</router-link> |
      <router-link to="/login">Login</router-link>
    </nav>
    <router-view />
  </div>
  <div>
    <h1>{{welcome_message}}</h1>
    <p>incrementCounter: {{counter}}</p>
    <button v-on:click="incrementCounter">Increment Counter</button>
    <p v-if="counter >= 5">Big number!</p>
    <p v-else>Small number!</p>
    <Login />
  </div>
</template>

<script>
import Login from './pages/Login.vue';
  export default {
    data() {
      return {
        welcome_message: 'Hello World!',
        counter: 0
      }
    },
    methods: {
      incrementCounter() {
        this.counter ++;
      }
    },
    components: {
      Login
    }
    
  }

</script>

<style scoped>

</style>
