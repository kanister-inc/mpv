import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev
export default defineConfig({
  plugins: [react()],
  base: '/mpv/', // <-- ДОБАВЬТЕ ЭТУ СТРОКУ (имя вашего репозитория со слэшами)
})
