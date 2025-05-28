// Importing Vite's configuration function
import { defineConfig } from 'vite';
// Importing the React plugin for Vite
import react from '@vitejs/plugin-react';

// Exporting the Vite configuration
export default defineConfig({
  // Adding React plugin to the Vite configuration
  plugins: [react()],
  // Setting the base path for assets
  base: './', // Ensures relative paths for assets
  build: {
    // Specifying the output directory for the build
    outDir: 'dist',
    // Specifying the directory for assets
    assetsDir: 'assets',
    rollupOptions: {
      output: {
        // Customizing the naming convention for asset files
        assetFileNames: 'assets/[name].[hash].[ext]',
        // Customizing the naming convention for chunk files
        chunkFileNames: 'assets/[name].[hash].js',
        // Customizing the naming convention for entry files
        entryFileNames: 'assets/[name].[hash].js',
      },
    },
  },
});
