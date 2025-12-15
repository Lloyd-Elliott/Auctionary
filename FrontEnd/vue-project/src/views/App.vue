
<template>
  <div>
    <nav>
      <div class="nav-left">
        <router-link to="/">Home</router-link> |
        <router-link to="/get-item">Get Item</router-link> |
        <router-link to="/create-item">Create Item</router-link> |
        <router-link to="/register">Register</router-link>
      </div>
      
      <div class="nav-right">
        <div v-if="!isLoggedIn" class="login-form">
          <input v-model="email" type="email" placeholder="Email" @keyup.enter="handleLogin" />
          <input v-model="password" type="password" placeholder="Password" @keyup.enter="handleLogin" />
          <button @click="handleLogin">Login</button>
        </div>
        <div v-else class="user-info">
          Welcome, User {{ userId }} | 
          <button @click="handleLogout" class="logout-btn">Logout</button>
        </div>
      </div>
    </nav>
    
    <div v-if="loginError" style="color: red; text-align: center; padding: 10px;">
      {{ loginError }}
    </div>
    
    <router-view />
  </div>
</template>

<script>
import { coreServices } from '../services/core.services';

export default {
  data() {
    return {
      email: '',
      password: '',
      loginError: null,
      userId: localStorage.getItem('user_id')
    }
  },
  computed: {
    isLoggedIn() {
      return !!localStorage.getItem('session_token');
    }
  },
  methods: {
    async handleLogin() {
      this.loginError = null;
      
      if (!this.email || !this.password) {
        this.loginError = "Please enter email and password";
        return;
      }

      try {
        const response = await coreServices.userLogin(this.email, this.password);
        this.userId = response.user_id;
        this.email = '';
        this.password = '';
        this.$forceUpdate(); // Force re-render to update isLoggedIn
      } catch (error) {
        this.loginError = error || "Login failed";
      }
    },
    async handleLogout() {
      try {
        await coreServices.userLogout();
        this.userId = null;
        this.$forceUpdate(); // Force re-render
        this.$router.push('/');
      } catch (error) {
        console.error('Logout error:', error);
      }
    }
  }
}
</script>

<style scoped>

</style>
