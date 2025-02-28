import { sveltekit } from '@sveltejs/kit/vite';
import tailwindcss from '@tailwindcss/vite';
import fs from 'fs';
import { defineConfig } from 'vite';

export default defineConfig({
    plugins: [sveltekit(), tailwindcss()],
    server: {
        https: {
            key: fs.readFileSync(`./certs/server.key`),
            cert: fs.readFileSync(`./certs/server.cert`)
        }
    }
});
