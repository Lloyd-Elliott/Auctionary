

import { createApp } from 'vue'
import App from './views/App.vue'
import './assets/styles.css'

import router from './router'

const app = createApp(App).use(router).mount('#app')


