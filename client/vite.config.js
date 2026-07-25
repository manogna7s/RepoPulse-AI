import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Vite plugins keep build concerns centralized: React handles JSX and
// Tailwind generates only the utility CSS used by the application.
export default defineConfig({
  plugins: [react(), tailwindcss()],
})
