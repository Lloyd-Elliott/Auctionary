<template>
    <div class="container">
        <h1>Logout</h1>
        
        <div v-if="!isLoggedIn">
            <p>You are not logged in.</p>
            <router-link to="/login">Login here</router-link>
        </div>

        <div v-else>
            <p>Are you sure you want to logout?</p>
            <button @click="handleLogout">Logout</button>
            <br /><br />
            <router-link to="/">Cancel</router-link>
        </div>

        <div v-if="error" style="color: red; margin-top: 20px;">
            <strong>Error:</strong> {{ error }}
        </div>
    </div>
</template>

<script>
import { coreServices } from '../../services/core.services.js';

export default {
    computed: {
        isLoggedIn() {
            return !!localStorage.getItem('session_token');
        }
    },
    data() {
        return {
            error: null
        }
    },
    methods: {
        async handleLogout() {
            this.error = null;
            
            try {
                await coreServices.userLogout();
                alert('Logged out successfully!');
                this.$router.push('/');
            } catch (error) {
                console.error('Logout error:', error);
                this.error = error;
            }
        }
    }
}
</script>

<style scoped>

</style>
