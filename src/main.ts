import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { createPinia } from 'pinia'

import 'bootstrap/dist/css/bootstrap.min.css'
import '@/assets/main.css'
import 'bootstrap' // JS tarafı için gerekli

const app = createApp(App)

app.use(createPinia())
app.use(router)

// Router tamamen hazır olduğunda mount et → flash engellenir
router.isReady().then(() => {
  app.mount('#app')
})
