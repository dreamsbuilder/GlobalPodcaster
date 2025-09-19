#!/usr/bin/env python3
"""
Feed Monitor Agent - Compatible con Coral Protocol

Este agente es stateless y sigue el protocolo stdin/stdout de Coral.
Responde a comandos específicos para verificar feeds y detectar nuevos episodios.

Comandos soportados:
- CHECK_FEEDS: Verifica todos los feeds en feeds.txt
- CHECK_FEED: Verifica un feed específico (requiere URL en content)
- GET_FEED_LIST: Devuelve la lista de feeds configurados

Autor: GlobalPodcaster Team
"""

import sys
import os
import json
import subprocess
import hashlib
import time
from typing import List, Dict, Any
import feedparser

# Configuración
FEEDS_FILE = "feeds.txt"
STATE_DIR = "feed_monitor_state"
ORCHESTRATOR_SCRIPT = "../orchestrator/agent.py"

def log_error(message: str):
    """Envía mensajes de error a stderr para debugging."""
    print(f"[ERROR feed-monitor-agent] {message}", file=sys.stderr, flush=True)

def log_info(message: str):
    """Envía mensajes informativos a stderr para debugging."""
    print(f"[INFO feed-monitor-agent] {message}", file=sys.stderr, flush=True)

def get_feeds_file_path() -> str:
    """Obtiene la ruta absoluta del archivo de feeds."""
    script_dir = os.path.dirname(os.path.abspath(__file__))
    feeds_path = os.path.join(script_dir, "..", "..", FEEDS_FILE)
    return os.path.abspath(feeds_path)

def get_state_dir() -> str:
    """Obtiene el directorio para almacenar el estado del monitor."""
    script_dir = os.path.dirname(os.path.abspath(__file__))
    state_path = os.path.join(script_dir, STATE_DIR)
    os.makedirs(state_path, exist_ok=True)
    return state_path

def get_feeds() -> List[str]:
    """Lee los feeds desde el archivo feeds.txt."""
    feeds_path = get_feeds_file_path()
    if not os.path.exists(feeds_path):
        raise FileNotFoundError(f"Feeds file not found: {feeds_path}")
    
    feeds = []
    with open(feeds_path, 'r') as f:
        for line in f:
            line = line.strip()
            if line and not line.startswith('#'):
                feeds.append(line)
    
    log_info(f"Loaded {len(feeds)} feeds from {feeds_path}")
    return feeds

def get_feed_id(feed_url: str) -> str:
    """Genera un ID único para un feed basado en su URL."""
    return hashlib.md5(feed_url.encode()).hexdigest()[:12]

def get_last_check_file(feed_id: str) -> str:
    """Obtiene la ruta del archivo que almacena el último check de un feed."""
    state_dir = get_state_dir()
    return os.path.join(state_dir, f"last_check_{feed_id}.json")

def load_last_check(feed_id: str) -> Dict[str, Any]:
    """Carga información del último check de un feed."""
    last_check_file = get_last_check_file(feed_id)
    if os.path.exists(last_check_file):
        try:
            with open(last_check_file, 'r') as f:
                return json.load(f)
        except (json.JSONDecodeError, IOError) as e:
            log_error(f"Error loading last check for feed {feed_id}: {e}")
    
    return {"episodes": [], "last_check": 0}

def save_last_check(feed_id: str, episodes: List[str], timestamp: float):
    """Guarda información del último check de un feed."""
    last_check_file = get_last_check_file(feed_id)
    data = {
        "episodes": episodes,
        "last_check": timestamp
    }
    try:
        with open(last_check_file, 'w') as f:
            json.dump(data, f, indent=2)
    except IOError as e:
        log_error(f"Error saving last check for feed {feed_id}: {e}")

def fetch_feed_episodes(feed_url: str) -> List[Dict[str, Any]]:
    """Obtiene los episodios de un feed RSS."""
    try:
        log_info(f"Fetching feed: {feed_url}")
        feed = feedparser.parse(feed_url)
        
        if feed.bozo and feed.bozo_exception:
            log_error(f"Feed parsing warning for {feed_url}: {feed.bozo_exception}")
        
        episodes = []
        for entry in feed.entries:
            # Buscar URL de audio
            audio_url = None
            if hasattr(entry, 'enclosures') and entry.enclosures:
                for enclosure in entry.enclosures:
                    if enclosure.get('type', '').startswith('audio/'):
                        audio_url = enclosure.get('href')
                        break
            
            episode = {
                'title': getattr(entry, 'title', ''),
                'link': getattr(entry, 'link', ''),
                'published': getattr(entry, 'published', ''),
                'summary': getattr(entry, 'summary', ''),
                'audio_url': audio_url,
                'guid': getattr(entry, 'id', entry.get('link', ''))
            }
            episodes.append(episode)
        
        log_info(f"Found {len(episodes)} episodes in feed {feed_url}")
        return episodes
        
    except Exception as e:
        log_error(f"Error fetching feed {feed_url}: {e}")
        return []

def check_feed_for_new_episodes(feed_url: str) -> List[Dict[str, Any]]:
    """Verifica un feed específico en busca de nuevos episodios."""
    feed_id = get_feed_id(feed_url)
    last_check = load_last_check(feed_id)
    
    current_episodes = fetch_feed_episodes(feed_url)
    if not current_episodes:
        return []
    
    # Obtener GUIDs de episodios actuales y anteriores
    current_guids = {ep['guid'] for ep in current_episodes if ep['guid']}
    previous_guids = set(last_check.get('episodes', []))
    
    # Encontrar nuevos episodios
    new_guids = current_guids - previous_guids
    new_episodes = [ep for ep in current_episodes if ep['guid'] in new_guids]
    
    # Guardar el estado actual
    current_time = time.time()
    save_last_check(feed_id, list(current_guids), current_time)
    
    if new_episodes:
        log_info(f"Found {len(new_episodes)} new episodes in feed {feed_url}")
        # Agregar metadata del feed
        for episode in new_episodes:
            episode['feed_url'] = feed_url
            episode['feed_id'] = feed_id
    else:
        log_info(f"No new episodes found in feed {feed_url}")
    
    return new_episodes

def notify_orchestrator(new_episodes: List[Dict[str, Any]]) -> Dict[str, Any]:
    """Notifica al orquestador sobre nuevos episodios encontrados."""
    if not new_episodes:
        return {"status": "no_new_episodes", "count": 0}
    
    try:
        orchestrator_path = os.path.join(os.path.dirname(__file__), ORCHESTRATOR_SCRIPT)
        
        # Agrupar episodios por feed para enviar en lote al orchestrator
        results = []
        
        # El orchestrator actual espera un feed_url y maneja todo internamente
        # Necesitamos adaptar para trabajar con la lógica existente
        feeds_processed = set()
        
        for episode in new_episodes:
            feed_url = episode.get('feed_url')
            if not feed_url or feed_url in feeds_processed:
                continue
                
            feeds_processed.add(feed_url)
            
            # El orchestrator espera el feed_url como content
            coral_msg = {
                "sender": "feed-monitor-agent",
                "receiver": "orchestrator", 
                "content": feed_url
            }
            
            log_info(f"Sending feed URL to orchestrator: {feed_url}")
            
            proc = subprocess.Popen(
                [sys.executable, orchestrator_path],
                stdin=subprocess.PIPE,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                text=True
            )
            
            stdout, stderr = proc.communicate(input=json.dumps(coral_msg) + "\n")
            
            if proc.returncode == 0:
                # Filtrar solo las líneas que son JSON válidas (sin DEBUG)
                lines = stdout.strip().split('\n')
                json_lines = [line for line in lines if not line.startswith('DEBUG')]
                
                if json_lines:
                    try:
                        # Tomar la última línea JSON válida
                        result_line = json_lines[-1]
                        result = json.loads(result_line)
                        results.append(result)
                        log_info(f"Orchestrator processed feed: {feed_url}")
                    except json.JSONDecodeError as e:
                        log_error(f"Invalid JSON response from orchestrator: {result_line}")
                        log_error(f"Full stdout: {stdout}")
            else:
                log_error(f"Orchestrator error for feed {feed_url}: {stderr}")
        
        return {
            "status": "episodes_processed",
            "count": len(new_episodes),
            "feeds_processed": len(feeds_processed),
            "results": results
        }
        
    except Exception as e:
        log_error(f"Error notifying orchestrator: {e}")
        return {"status": "error", "error": str(e)}

def handle_check_feeds() -> Dict[str, Any]:
    """Maneja el comando CHECK_FEEDS - verifica todos los feeds configurados."""
    try:
        feeds = get_feeds()
        all_new_episodes = []
        
        for feed_url in feeds:
            new_episodes = check_feed_for_new_episodes(feed_url)
            all_new_episodes.extend(new_episodes)
        
        # Notificar al orquestador si hay nuevos episodios
        orchestrator_result = notify_orchestrator(all_new_episodes)
        
        return {
            "feeds_checked": len(feeds),
            "new_episodes_found": len(all_new_episodes),
            "episodes": all_new_episodes,
            "orchestrator_result": orchestrator_result
        }
        
    except Exception as e:
        log_error(f"Error in handle_check_feeds: {e}")
        return {"error": str(e)}

def handle_check_feed(feed_url: str) -> Dict[str, Any]:
    """Maneja el comando CHECK_FEED - verifica un feed específico."""
    try:
        new_episodes = check_feed_for_new_episodes(feed_url)
        orchestrator_result = notify_orchestrator(new_episodes)
        
        return {
            "feed_url": feed_url,
            "new_episodes_found": len(new_episodes),
            "episodes": new_episodes,
            "orchestrator_result": orchestrator_result
        }
        
    except Exception as e:
        log_error(f"Error checking feed {feed_url}: {e}")
        return {"error": str(e), "feed_url": feed_url}

def handle_get_feed_list() -> Dict[str, Any]:
    """Maneja el comando GET_FEED_LIST - devuelve la lista de feeds configurados."""
    try:
        feeds = get_feeds()
        return {
            "feeds": feeds,
            "count": len(feeds)
        }
    except Exception as e:
        log_error(f"Error getting feed list: {e}")
        return {"error": str(e)}

def process_message(msg: Dict[str, Any]) -> Dict[str, Any]:
    """Procesa un mensaje entrante y devuelve la respuesta."""
    command = msg.get("content", "").upper()
    sender = msg.get("sender", "unknown")
    
    log_info(f"Processing command '{command}' from {sender}")
    
    if command == "CHECK_FEEDS":
        result = handle_check_feeds()
    elif command.startswith("CHECK_FEED:"):
        # Formato: "CHECK_FEED:https://example.com/rss"
        feed_url = command.split(":", 1)[1] if ":" in command else ""
        if feed_url:
            result = handle_check_feed(feed_url)
        else:
            result = {"error": "No feed URL provided"}
    elif command == "GET_FEED_LIST":
        result = handle_get_feed_list()
    elif command == "PING":
        result = {"status": "alive", "agent": "feed-monitor-agent"}
    else:
        result = {
            "error": f"Unknown command: {command}",
            "supported_commands": ["CHECK_FEEDS", "CHECK_FEED:url", "GET_FEED_LIST", "PING"]
        }
    
    # Preparar respuesta en formato Coral
    response = {
        "sender": "feed-monitor-agent",
        "receiver": sender,
        "content": result
    }
    
    return response

def main():
    """Función principal - lee stdin y procesa mensajes."""
    log_info("Feed Monitor Agent started - waiting for commands via stdin")
    
    try:
        for line in sys.stdin:
            line = line.strip()
            if not line:
                continue
                
            try:
                msg = json.loads(line)
                response = process_message(msg)
                print(json.dumps(response), flush=True)
                
            except json.JSONDecodeError as e:
                error_response = {
                    "sender": "feed-monitor-agent",
                    "receiver": "unknown",
                    "content": {"error": f"Invalid JSON: {e}"}
                }
                print(json.dumps(error_response), flush=True)
                
            except Exception as e:
                log_error(f"Unexpected error processing message: {e}")
                error_response = {
                    "sender": "feed-monitor-agent", 
                    "receiver": "unknown",
                    "content": {"error": f"Internal error: {e}"}
                }
                print(json.dumps(error_response), flush=True)
                
    except KeyboardInterrupt:
        log_info("Feed Monitor Agent stopped by user")
    except Exception as e:
        log_error(f"Fatal error in main loop: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()