# 🧪 GlobalPodcaster - Testing Suite

Scripts y herramientas de diagnóstico para el pipeline de GlobalPodcaster.

## 📁 Contenido

### 🌐 **Web Test App** (`react-test/`)
- **Interfaz principal**: `http://localhost:3000/test.html`
- **Funciones**: Crear sesiones Coral, conectar SSE, monitorear pipeline
- **Inicio**: `cd react-test && npm run dev`

### 🐍 **Script de Diagnóstico** (`test_monitor.py`)
- **Función**: Testing directo del feed monitor (bypass Coral)
- **Uso**: `python test_monitor.py`
- **Útil para**: Verificar detección de episodios sin SSE
- **Agente objetivo**: `feed-monitor-agent`
- **Funcionalidad**: Permite crear sesiones, conectar via SSE y monitorear el pipeline en tiempo real

#### Uso rápido
```bash
cd backend/test/react-test
npm install
npm run dev
```

📖 **Documentación completa**: Ver [react-test/README.md](./react-test/README.md) para:
- Guía detallada de instalación
- API del cliente Coral
- Flujos de testing
- Troubleshooting y debugging

## Estructura General

```
backend/
├── agents/              # Agentes del sistema
├── coral/              # Configuración de Coral Server
├── test/               # 📍 Estás aquí - Pruebas del backend
│   └── react-test/     # Cliente React para testing
└── ...
```

## Otros Tests (futuros)

Esta carpeta puede expandirse para incluir:
- Tests unitarios de agentes individuales
- Tests de integración entre agentes
- Scripts de carga para performance testing
- Validación de pipelines completos