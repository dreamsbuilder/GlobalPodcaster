from fastapi import FastAPI, HTTPException
from contextlib import asynccontextmanager
import subprocess
import os
import time
import threading
import json
import sys
import logging

app = FastAPI(title="Feed Monitor Agent")

# Configurar el sistema de logging
logger = logging.getLogger("feed-monitor-agent")
logger.setLevel(logging.DEBUG)

# Crear manejadores para STDOUT y STDERR
stdout_handler = logging.StreamHandler(sys.stdout)
stderr_handler = logging.StreamHandler(sys.stderr)

# Configurar niveles para cada manejador
stderr_handler.setLevel(logging.DEBUG)  # Todos los niveles irán a STDERR
stdout_handler.setLevel(logging.CRITICAL)  # Evitar que se envíen logs a STDOUT

# Formato de los logs
formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
stdout_handler.setFormatter(formatter)
stderr_handler.setFormatter(formatter)

# Agregar manejadores al logger
logger.addHandler(stderr_handler)

FEEDS_FILE = "feeds.txt"
POLL_INTERVAL = 30  # segundos (2 minutos)
ORCHESTRATOR_SCRIPT = "../../agents/orchestrator/agent.py"  # Ruta al orquestador

def get_feeds():
    """Lee los feeds desde el archivo feeds.txt."""
    feeds_file_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "../..", FEEDS_FILE))
    if not os.path.exists(feeds_file_path):
        raise FileNotFoundError(f"Feeds file not found: {feeds_file_path}")
    with open(feeds_file_path) as f:
        return [line.strip() for line in f if line.strip() and not line.startswith('#')]

def run_orchestrator(feed_url):
    """Llama al orquestador para procesar un feed."""
    proc = subprocess.Popen(
        [os.sys.executable, ORCHESTRATOR_SCRIPT],
        stdin=subprocess.PIPE,
        stdout=subprocess.PIPE,
        text=True
    )
    coral_msg = {
        "sender": "feed-monitor-agent",
        "receiver": "orchestrator",
        "content": feed_url
    }
    stdout, _ = proc.communicate(input=json.dumps(coral_msg) + "\n")
    return stdout.strip()

def monitor_feeds():
    """Monitorea los feeds en feeds.txt y llama al orquestador."""
    logger.info(f"Monitoring feeds listed in {FEEDS_FILE} every {POLL_INTERVAL} seconds...")
    while True:
        try:
            feeds = get_feeds()
            logger.info(f"{len(feeds)} feeds pendientes de procesar en este ciclo.")
            for idx, feed_url in enumerate(feeds, 1):
                logger.info(f"({idx}/{len(feeds)}) Checking feed: {feed_url}")
                try:
                    result = run_orchestrator(feed_url)
                    #logger.debug(f"Orchestrator response for {feed_url}: {result}")
                except Exception as e:
                    logger.error(f"Error processing feed {feed_url}: {e}")
            logger.info(f"Sleeping {POLL_INTERVAL} seconds...")
            time.sleep(POLL_INTERVAL)
        except Exception as e:
            logger.error(f"Unexpected error: {e}")

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifespan event handler for startup and shutdown."""
    monitor_thread = threading.Thread(target=monitor_feeds, daemon=True)
    monitor_thread.start()
    logger.info("Monitoring thread started.")
    yield  # Application is running
    logger.info("Application shutdown. Monitoring thread will stop.")

app = FastAPI(title="Feed Monitor Agent", lifespan=lifespan)

@app.get("/")
def read_root():
    """Endpoint básico para verificar que el agente está funcionando."""
    return {"message": "Feed Monitor Agent is running"}

@app.post("/trigger")
def trigger_monitoring():
    """Endpoint para forzar un ciclo de monitoreo manual."""
    try:
        feeds = get_feeds()
        results = []
        for feed_url in feeds:
            result = run_orchestrator(feed_url)
            results.append({"feed_url": feed_url, "result": result})
        return {"message": "Manual feed monitoring completed", "results": results}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)  # Cambia el puerto si es necesario