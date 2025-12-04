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
  export default{
    data(){
      return{
        email: "",
        password: "",
        submitted: false
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


        console.log("HERE")
        console.log(EmailValidator.validate(email))
        console.log(!(EmailValidator.validate(email)))

        if(!(EmailValidator.validate(email))){
          console.log("Im in here")
          this.error = "Email must be a valid email"
          return;
        }

        const password_pattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9])(?=^\S+$).{8,30}$/;
        if (!(password_pattern.test(password))){
          this.error = "Password Not Strong Enough"
        }
        alert("Button Clicked")
      }
    }
  }
    


  

</script>

<style scoped>

</style>
