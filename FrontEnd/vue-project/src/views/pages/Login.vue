<template>
  <div class="container">
    <h1>Login</h1>
    <form @submit.prevent="handleSubmit">
        <div>
          <label for="email">Email:</label><br />
          <input type="text" id="email" name="email" v-model="email"/>
          <div v-show="submitted && !email" class="error-text">Email is required</div>
        </div>

        <br />

        <div>
          <label for="password">Password:</label><br />
          <input type="password" id="password" name="password" v-model="password"/>
          <div v-show="submitted && !password" class="error-text">Password is required</div>
        </div>

        <br />

        <button type="submit">Login</button>
    </form>

    <div v-if="error" class="error-message">
        <strong>Error:</strong> {{ error }}
    </div>
  </div>
</template>

<script>
import * as EmailValidator from 'email-validator';
import { coreServices } from '../../services/core.services';
  export default{
    data(){
      return{
        email: "",
        password: "",
        submitted: false,
        error: ""
      }
    },

    methods:{
      handleSubmit(e){
        this.submitted = true
        this.error = ""
        const{email, password} = this
        if(!(email && password)){
          return;
        }

        if(!(EmailValidator.validate(email))){
          this.error = "Email must be a valid email"
          return;
        }

        const password_pattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9])(?=^\S+$).{8,30}$/;
        if (!(password_pattern.test(password))){
          this.error = "Password Not Strong Enough"
          return;
        }

        coreServices.userLogin(email, password)
          .then((response) => {
            this.$router.push('/');
            alert("Login Successful!");
          })
          .catch((error) => {
            this.error = error || "Invalid email or password";
          });
      }
    }
  }
</script>

<style scoped>

</style>
