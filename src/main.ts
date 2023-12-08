import { createApp } from 'vue'
import './style/style.scss'
import App from './App.vue'
import { } from './utils/index'

const app = createApp(App)

app
  .config
  .errorHandler = (err, vm, info) => {
    console.error(err, vm, info)

    localStorage.clear()
    window.location.reload()
  }

app.mount('#app')