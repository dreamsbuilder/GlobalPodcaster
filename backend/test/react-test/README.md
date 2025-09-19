# Coral Feed Monitor Test

Este es un proyecto React de prueba para interactuar con el sistema de agentes de Coral Server, específicamente con el `feed-monitor-agent` que monitoriza feeds RSS y desencadena el pipeline de procesamiento de podcasts.

## 🚀 Inicio Rápido

```bash
cd /workspaces/GlobalPodcaster/backend/test/react-test
npm run dev
```

Abrir: `http://localhost:3000/test.html`

## 📁 Estructura Limpia

```
react-test/
├── package.json          # Configuración mínima (solo Vite)
├── vite.config.ts        # Servidor con proxy a Coral
├── public/
│   └── test.html        # 🌟 Interfaz completa de testing
└── README.md            # Esta documentación
```

## Funcionalidades

### 1. Cliente Coral (`coral-client.ts`)
- **Crear Sesión**: Establece una sesión con el agente `feed-monitor-agent`
- **Conexión SSE**: Conecta via Server-Sent Events para recibir mensajes en tiempo real
- **Envío de Comandos**: Envía comandos para iniciar/controlar el monitoreo
- **Manejo de Logs**: Sistema de logging integrado para debug y monitoreo

### 2. Interfaz de Usuario (`App.tsx`)
- **Estado de Conexión**: Indicador visual del estado de la conexión
- **Controles**: Botones para crear sesión, conectar SSE, iniciar monitoreo
- **Logs en Tiempo Real**: Visualización de logs del sistema y mensajes del pipeline
- **Información del Agente**: Detalles de la sesión activa

## Prerrequisitos

1. **Coral Server** debe estar ejecutándose en el puerto 5555
2. **Node.js** y **npm** instalados
3. Los agentes del backend deben estar configurados correctamente

## Instalación y Ejecución

### 1. Instalar dependencias
```bash
cd /workspaces/GlobalPodcaster/backend/test/react-test
npm install
```

### 2. Ejecutar el proyecto
```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:3000`

### 3. Iniciar Coral Server (en paralelo)
```bash
cd /workspaces/GlobalPodcaster/backend/coral
./start-server.sh
```

## Flujo de Uso

### Paso 1: Crear Sesión
- Haz clic en "Crear Sesión"
- Se creará una sesión con el agente `feed-monitor-agent`
- La aplicación mostrará el ID de sesión

### Paso 2: Conectar SSE
- Haz clic en "Conectar SSE" 
- Se establecerá una conexión Server-Sent Events
- Ahora puedes recibir mensajes en tiempo real

### Paso 3: Iniciar Monitoreo
- Haz clic en "Iniciar Monitoreo de Feeds"
- El agente comenzará a monitorizar feeds cada 30 segundos
- Los logs mostrarán la actividad del pipeline

## Configuración del Agente

El `feed-monitor-agent` se configura con:
- **FEEDS_FILE**: `feeds.txt` (archivo con las URLs de los feeds)
- **POLL_INTERVAL**: 30 segundos (intervalo de monitoreo)
- **ORCHESTRATOR_URL**: URL del orquestador que coordina el pipeline

## Pipeline de Agentes

Cuando el `feed-monitor-agent` detecta nuevos episodios, desencadena:

1. **RSS Fetch Agent** → Obtiene el contenido del feed
2. **Orchestrator** → Coordina el flujo entre agentes  
3. **Transcription Agent** → Transcribe el audio
4. **Translation Agent** → Traduce el contenido
5. **TTS Agent** → Genera audio sintético

## Debugging

### Logs del Sistema
Los logs se muestran en tiempo real e incluyen:
- **Sistema** (azul): Estados de conexión y operaciones internas
- **Info** (verde): Mensajes exitosos y comunicación entre agentes
- **Warning** (amarillo): Advertencias y situaciones de atención
- **Error** (rojo): Errores y fallos del sistema

### Mensajes del Pipeline
Se muestran por separado los mensajes intercambiados entre agentes del pipeline, incluyendo sender, receiver y contenido.

## Troubleshooting

### Error de Conexión
- Verifica que Coral Server esté ejecutándose en el puerto 5555
- Revisa los logs del servidor Coral
- Asegúrate de que el agente `feed-monitor-agent` esté configurado en `application.yaml`

### No se Reciben Mensajes
- Confirma que la conexión SSE esté establecida (indicador verde)
- Verifica que haya feeds configurados en `backend/feeds.txt`
- Revisa que los otros agentes del pipeline estén funcionando

### Problemas de CORS
- El proxy de Vite está configurado para redirigir `/api/*` a `localhost:5555`
- Si cambias la configuración del servidor, actualiza `vite.config.ts`

## API de Coral Server

### Endpoints Utilizados

```bash
# Crear sesión
POST /sessions
{
  "applicationId": "app",
  "agentId": "feed-monitor-agent",
  "options": { ... }
}

# Conectar SSE
GET /sessions/{sessionId}/events

# Enviar mensaje
POST /sessions/{sessionId}/messages
{
  "sender": "client",
  "receiver": "feed-monitor-agent", 
  "content": "START_MONITORING",
  "type": "command"
}

# Información de sesión
GET /sessions/{sessionId}
```

## Desarrollo

### Scripts Disponibles
- `npm run dev` - Servidor de desarrollo
- `npm run build` - Build de producción
- `npm run preview` - Vista previa del build
- `npm run lint` - Linter

### Arquitectura
- **React 18** con hooks para manejo de estado
- **TypeScript** para type safety
- **Vite** como build tool y dev server
- **EventSource API** para conexiones SSE
- **Fetch API** para comunicación HTTP

## Notas Importantes

1. **Monitoreo Continuo**: El `feed-monitor-agent` es un servicio que ejecuta en background, no una tarea que se completa
2. **Pipeline Reactivo**: Los agentes se activan automáticamente cuando se detectan nuevos episodios
3. **Tiempo Real**: La interfaz muestra la actividad del sistema en tiempo real vía SSE
4. **Estado Persistente**: La sesión se mantiene hasta que se desconecte explícitamente

Este enfoque permite probar el sistema completo de monitoreo y procesamiento de feeds de manera interactiva y visual.