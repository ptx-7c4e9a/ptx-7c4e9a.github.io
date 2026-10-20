import {defineConfig} from 'vite';
import {fileURLToPath} from 'node:url';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
 plugins:[react(),tailwindcss()],
 resolve:{alias:{'@typography':fileURLToPath(new URL('./src/typography',import.meta.url))}},
 base:'/',
 build:{chunkSizeWarningLimit:1600},
 server:{host:'127.0.0.1',port:4173,strictPort:true},
});
