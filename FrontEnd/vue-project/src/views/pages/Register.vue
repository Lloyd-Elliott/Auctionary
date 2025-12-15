<template>
    <div class="container">
        <h1>Create Account</h1>
        
        <form @submit.prevent="handleRegister">
            <div>
                <label for="first_name">First Name:</label><br />
                <input type="text" id="first_name" v-model="formData.first_name" required />
            </div>

            <br />

            <div>
                <label for="last_name">Last Name:</label><br />
                <input type="text" id="last_name" v-model="formData.last_name" required />
            </div>

            <br />

            <div>
                <label for="email">Email:</label><br />
                <input type="email" id="email" v-model="formData.email" required />
            </div>

            <br />

            <div>
                <label for="password">Password:</label><br />
                <input type="password" id="password" v-model="formData.password" required />
                <br />
                <small>8-30 characters, must include uppercase, lowercase, digit, and special character</small>
            </div>

            <br />

            <button type="submit">Create Account</button>
        </form>

        <div v-if="error" style="color: red; margin-top: 20px;">
            <strong>Error:</strong> {{ error }}
        </div>

        <div v-if="success" style="color: #42b983; margin-top: 20px;">
            <strong>Success!</strong> Account created. <router-link to="/login">Login here</router-link>
        </div>
    </div>
</template>

<script>
import { coreServices } from '../../services/core.services.js';

export default {
    data() {
        return {
            formData: {
                first_name: '',
                last_name: '',
                email: '',
                password: ''
            },
            error: null,
            success: false
        }
    },
    methods: {
        async handleRegister() {
            this.error = null;
            this.success = false;

            try {
                const response = await coreServices.createUser(this.formData);
                console.log('User created:', response);
                this.success = true;
                // Reset form
                this.formData = {
                    first_name: '',
                    last_name: '',
                    email: '',
                    password: ''
                };
            } catch (error) {
                console.error('Registration error:', error);
                this.error = error;
            }
        }
    }
}
</script>

<style scoped>

</style>
