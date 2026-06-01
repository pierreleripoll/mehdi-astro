import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import { router } from './router.js'
import { useChartStore } from './stores/chart.js'
import './style.css'

const app = createApp(App)
app.use(createPinia())
app.use(router)

// Seed state from the last snapshot and start listening for cross-tab updates.
useChartStore().init()

app.mount('#app')
