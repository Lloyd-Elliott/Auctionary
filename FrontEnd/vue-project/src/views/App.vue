
<template>
  <div>
    <nav>
      <div class="nav-left">
        <router-link to="/">Home</router-link> |
        <router-link to="/get-item">Get Item</router-link> |
        <router-link to="/create-item">Create Item</router-link> |
        <router-link to="/my-items">My Items</router-link> |
        <router-link to="/questions">Questions</router-link> |
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
    
    <div v-if="loginError" class="error-message" style="text-align: center; padding: 10px;">
      {{ loginError }} <router-link to="/register">Register here</router-link>
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
      userId: localStorage.getItem('user_id'),
      userName: localStorage.getItem('user_name') || 'User'
    }
  },
  computed: {
    isLoggedIn() {
      return !!localStorage.getItem('session_token');
    }
  },
  watch: {
    '$route'() {
      this.loginError = null;
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
        this.$router.go(0); // Reload the current page
      } catch (error) {
        this.loginError = "Invalid email or password. Please try again or ";
        this.email = '';
        this.password = '';
      }
    },
    async handleLogout() {
      try {
        await coreServices.userLogout();
        this.userId = null;
        this.$router.push('/');
        this.$router.go(0); // Reload the page
      } catch (error) {
        console.error('Logout error:', error);
      }
    }
  }
}
</script>

<style scoped>

</style>
