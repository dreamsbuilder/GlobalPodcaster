# Feed Monitor Agent - Arquitectura Coral Compatible

## 📋 Resumen de la Migración

Se ha migrado el `feed-monitor-agent` de un modelo **HTTP/FastAPI** a un modelo **stdin/stdout** compatible con Coral Protocol, manteniendo toda la funcionalidad pero siguiendo el patrón arquitectónico estándar.

## 🏗️ Nueva Arquitectura

### **Antes (HTTP/FastAPI)**
```
┌─────────────────┐     HTTP    ┌──────────────────┐
│   React Client  │ ──────────► │ feed-monitor     │
│                 │             │ (FastAPI Server) │
└─────────────────┘             │   ∞ loop        │
                                └──────────────────┘
```

### **Después (Coral Compatible)**
```
┌─────────────────┐             ┌─────────────┐     stdin/stdout   ┌──────────────────┐
│   React Client  │ ──────────► │ Coral       │ ─────────────────► │ feed-monitor     │
│                 │             │ Server      │                    │ (stateless)      │
└─────────────────┘             └─────────────┘                    └──────────────────┘
                                                                              │
┌─────────────────┐                                                          │
│   Scheduler     │ ──────────────────────────────────────────────────────────┘
│ (30s interval)  │     Ejecuta CHECK_FEEDS cada 30 segundos
└─────────────────┘
```

## 🔧 Componentes de la Nueva Solución

### 1. **agent_coral_compatible.py**
**Ubicación**: `backend/agents/feed-monitor-agent/agent_coral_compatible.py`

- ✅ **Stateless**: No mantiene estado interno, responde a comandos específicos
- ✅ **stdin/stdout**: Sigue el protocolo Coral estándar
- ✅ **Comandos soportados**:
  - `CHECK_FEEDS`: Verifica todos los feeds configurados
  - `CHECK_FEED:url`: Verifica un feed específico
  - `GET_FEED_LIST`: Devuelve lista de feeds configurados
  - `PING`: Verificación de conectividad

**Ejemplo de uso**:
```bash
echo '{"sender":"client", "receiver":"feed-monitor-agent", "content":"CHECK_FEEDS"}' | python3 agent_coral_compatible.py
```

### 2. **feed_monitor_scheduler.sh**
**Ubicación**: `backend/agents/feed-monitor-agent/feed_monitor_scheduler.sh`

Scheduler externo que mantiene el monitoreo continuo:

```bash
# Iniciar monitoreo automático cada 30 segundos
./feed_monitor_scheduler.sh start

# Verificación manual única
./feed_monitor_scheduler.sh check

# Ver estado del scheduler
./feed_monitor_scheduler.sh status

# Parar el scheduler
./feed_monitor_scheduler.sh stop
```

### 3. **Coral Server Configuration**
**Archivo**: `backend/coral/application.yaml`

Configuración actualizada para el nuevo agente:
```yaml
feed-monitor-agent:
  options: []
  runtime:
    type: "executable"
    command: [ "python3", "../../agents/feed-monitor-agent/agent_coral_compatible.py" ]
    environment: []
```

**Nota**: No requiere variables de entorno ya que el agente lee comandos via stdin.

### 4. **React Client Actualizado**
**Archivo**: `backend/test/react-test/src/coral-client.ts`

Nuevos métodos para interactuar con el agente:
- `checkFeeds()`: Verificar todos los feeds
- `checkSpecificFeed(url)`: Verificar feed específico
- `getFeedList()`: Obtener lista de feeds
- `pingAgent()`: Verificar conectividad

## 🔄 Flujo de Funcionamiento

### **Flujo Automático (Scheduler)**
1. **Scheduler** ejecuta cada 30 segundos
2. Envía comando `CHECK_FEEDS` al agente
3. **Agente** verifica feeds y detecta nuevos episodios
4. Si hay nuevos episodios → **Notifica al Orchestrator**
5. **Orchestrator** inicia el pipeline completo

### **Flujo Manual (React Client)**
1. **Cliente** crea sesión con Coral Server
2. **Cliente** conecta via SSE para recibir respuestas
3. **Cliente** envía comandos específicos al agente
4. **Agente** procesa y responde via Coral Server
5. **Cliente** recibe respuestas en tiempo real

## 📁 Estructura de Archivos

```
backend/
├── agents/
│   └── feed-monitor-agent/
│       ├── agent.py                      # ❌ Versión HTTP antigua
│       ├── agent_coral_compatible.py     # ✅ Nueva versión Coral
│       └── feed_monitor_scheduler.sh     # ✅ Scheduler externo
├── coral/
│   └── application.yaml                  # ✅ Configuración actualizada
└── test/
    └── react-test/
        ├── .gitignore                    # ✅ Configuración Git
        ├── src/
        │   ├── coral-client.ts           # ✅ Cliente actualizado
        │   └── App.tsx                   # ✅ UI actualizada
        └── README.md                     # ✅ Documentación
```

## 🚀 Guía de Uso

### **1. Ejecutar el Sistema Completo**

```bash
# Terminal 1: Iniciar Coral Server
cd backend/coral
./start-server.sh

# Terminal 2: Iniciar Scheduler (monitoreo automático)
cd backend/agents/feed-monitor-agent
./feed_monitor_scheduler.sh start

# Terminal 3: Ejecutar Cliente React (testing manual)
cd backend/test/react-test
npm install
npm run dev
```

### **2. Testing Manual via React**

1. Abrir `http://localhost:3000` (React App)
2. Crear sesión → Conectar SSE → Usar botones de comando
3. Observar logs en tiempo real

**Nota**: Coral Server debe estar ejecutándose en `http://localhost:5555`

### **3. Testing Manual via CLI**

```bash
cd backend/agents/feed-monitor-agent

# Verificar feeds
echo '{"sender":"cli", "receiver":"feed-monitor-agent", "content":"CHECK_FEEDS"}' | python3 agent_coral_compatible.py

# Ping al agente
echo '{"sender":"cli", "receiver":"feed-monitor-agent", "content":"PING"}' | python3 agent_coral_compatible.py
```

## ✅ Ventajas de la Nueva Arquitectura

### **Consistencia**
- ✅ Todos los agentes siguen el mismo patrón stdin/stdout
- ✅ Compatible nativamente con Coral Protocol
- ✅ Fácil composabilidad entre agentes

### **Mantenibilidad**
- ✅ Código más simple y predecible
- ✅ Fácil testing y debugging
- ✅ Separación clara de responsabilidades

### **Flexibilidad**
- ✅ Scheduler configurable independientemente
- ✅ Agente puede ser invocado manualmente o automáticamente
- ✅ Comandos específicos para diferentes necesidades

### **Escalabilidad**
- ✅ Stateless permite múltiples instancias
- ✅ Scheduler puede distribuirse
- ✅ Fácil integración con sistemas de orquestación

## 🔍 Debugging y Monitoreo

### **Logs del Scheduler**
```bash
# Ver logs en tiempo real
tail -f backend/agents/feed-monitor-agent/feed_monitor_scheduler.log

# Ver estado del scheduler
./feed_monitor_scheduler.sh status
```

### **Logs del Agente**
Los logs del agente van a stderr y se pueden ver en:
- Logs del scheduler
- Output del cliente React
- Terminal al ejecutar manualmente

### **Estado de Feeds**
El agente mantiene estado de episodios ya vistos en:
```
backend/agents/feed-monitor-agent/feed_monitor_state/
├── last_check_[feed_id].json
```

## 🔄 Migración de Versión Anterior

Si ya tenías la versión HTTP corriendo:

1. **Parar el servicio HTTP**: Detener cualquier instancia de `agent.py`
2. **Actualizar Coral**: La configuración en `application.yaml` ya está actualizada
3. **Usar nueva versión**: Ejecutar `agent_coral_compatible.py`
4. **Iniciar scheduler**: `./feed_monitor_scheduler.sh start`

Los datos de feeds y configuración se mantienen compatibles.

## ⚡ Arquitectura Híbrida (Actual)

El sistema implementa una **arquitectura híbrida** que combina:

### **Coral Protocol** (Cliente ↔ feed-monitor-agent)
```
Cliente React → Coral Server → feed-monitor-agent
```

### **Comunicación Directa** (feed-monitor ↔ pipeline)
```
feed-monitor → orchestrator → [rss-fetch, transcription, translation, tts]
```

**Justificación**: Esta arquitectura es **pragmática y eficiente** porque:
- ✅ **Cliente testing**: Usa Coral para observabilidad y debugging
- ✅ **Pipeline interno**: Comunicación directa para performance
- ✅ **Todos los agentes**: Ya están configurados en `application.yaml`
- ✅ **Flexibilidad**: Permite ambos modelos según la necesidad

## 📚 Referencias

- **Coral Protocol**: [Documentación oficial](https://github.com/Coral-Protocol)
- **Archivo de Feeds**: `backend/feeds.txt`
- **Configuración**: `backend/coral/application.yaml`
- **Código del Agente**: `backend/agents/feed-monitor-agent/agent_coral_compatible.py`
- **Scheduler**: `backend/agents/feed-monitor-agent/feed_monitor_scheduler.sh`