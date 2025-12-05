import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/Lanka-Expo-Calendar/', // GitHub Pages base path
});
