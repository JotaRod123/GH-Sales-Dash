import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const isPreview = process.env.VITE_PREVIEW === 'true';

export default defineConfig({
  plugins: [react()],
  base: isPreview ? '/GH-Sales-Dash/v2/' : '/GH-Sales-Dash/',
});
