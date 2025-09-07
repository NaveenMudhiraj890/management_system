import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': 'http://localhost:8800',
      '/add-user': 'http://localhost:8800',
      '/add-student': 'http://localhost:8800',
      '/add-product': 'http://localhost:8800',
      '/edit-user': 'http://localhost:8800',
      '/edit-student': 'http://localhost:8800',
      '/edit-product': 'http://localhost:8800',
      '/delete-user': 'http://localhost:8800',
      '/delete-student': 'http://localhost:8800',
      '/delete-product': 'http://localhost:8800',
      '/add-category': 'http://localhost:8800',
      '/edit-category': 'http://localhost:8800',
      '/delete-category': 'http://localhost:8800'
    }
  }
})
