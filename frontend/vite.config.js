import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    allowedHosts: ['.trycloudflare.com', 'lakes-situations-theme-volvo.trycloudflare.com']
  }
});
