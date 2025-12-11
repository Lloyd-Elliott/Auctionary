<template>
  <div>
    <h1>Login</h1>
    <form @submit.prevent="handleSubmit">
        <label for="email">Email: </label>
        <input type="text" name="email" v-model="email"/>
        <div v-show="submitted && !email"> Email is required</div>

        <br /><br />

        <label for="password">Password: </label>
        <input type="password" name="password" v-model="password"/>
        <div v-show="submitted && !password"> Password is required</div>

        <br /><br />
        <p>{{ email+" "+password }}</p>

        <button>Login</button>

    </form>

    <div v-if="error">
      {{ error }}
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

        // Call login API
        coreServices.userLogin(email, password)
          .then((response) => {
            // Redirect to home or dashboard
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
