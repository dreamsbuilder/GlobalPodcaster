import { defineConfig } from 'vite'
import { exec } from 'child_process'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [{
    name: 'pipeline-executor',
    configureServer(server) {
      server.middlewares.use('/api/execute-real-pipeline', (req, res, next) => {
        if (req.method === 'POST') {
          console.log('🚀 Ejecutando pipeline real...')
          
          const command = 'cd /workspaces/GlobalPodcaster/backend/agents/feed-monitor-agent && echo \'{"sender":"test", "receiver":"feed-monitor-agent", "content":"CHECK_FEEDS"}\' | python3 agent_coral_compatible.py'
          
          exec(command, (error, stdout, stderr) => {
            res.setHeader('Content-Type', 'application/json')
            
            if (error) {
              console.error('❌ Error:', error)
              res.statusCode = 500
              res.end(JSON.stringify({
                status: 'error',
                message: error.message,
                stderr: stderr
              }))
            } else {
              console.log('✅ Pipeline ejecutado exitosamente')
              try {
                const result = JSON.parse(stdout)
                res.end(JSON.stringify({
                  status: 'success',
                  result: result,
                  raw_output: stdout
                }))
              } catch (parseError) {
                res.end(JSON.stringify({
                  status: 'success',
                  message: 'Pipeline ejecutado',
                  raw_output: stdout
                }))
              }
            }
          })
        } else {
          next()
        }
      })
    }
  }],
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
      // Endpoint para ejecutar el pipeline directamente (servidor real en puerto 8080)
      '/api/execute-pipeline': {
        target: 'http://localhost:8080',
        changeOrigin: true
      }
    }
  },
  preview: {
    host: '0.0.0.0',
    port: 3000
  }
})