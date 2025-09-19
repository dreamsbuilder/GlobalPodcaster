import { defineConfig } from 'vite'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [],
  root: '.',
  publicDir: false,
  server: {
    host: '0.0.0.0',
    port: 3000,
    strictPort: false,
    proxy: {
      // Proxy para el servidor Coral
      '/api/coral': {
        target: 'http://localhost:5555',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/coral/, '')
      },
      // Proxy para ejecutar el agente directamente
      '/api/trigger-pipeline': {
        target: 'http://localhost:8080',  // Placeholder - crearemos un endpoint simple
        changeOrigin: true,
        configure: (proxy, options) => {
          // Si no hay servidor en 8080, devolvemos un mock response
          proxy.on('error', (err, req, res) => {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ 
              status: 'pipeline_triggered',
              message: 'Feed monitor pipeline started',
              timestamp: new Date().toISOString()
            }));
          });
        }
      }
    }
  },
  preview: {
    host: '0.0.0.0',
    port: 3000
  }
})