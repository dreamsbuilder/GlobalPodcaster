import sys
import json
import time
import os

def load_seen_episodes():
    return set()  # Placeholder, la nueva función usará el feed_url

def save_seen_episodes(seen):
    pass  # Placeholder, la nueva función usará el feed_url

# Función principal del agente


# Llama al rss-fetch-agent y filtra solo los episodios nuevos
import subprocess
import os

def fetch_rss_entries(feed_url):
    proc = subprocess.Popen(
        [sys.executable, os.path.join(os.path.dirname(__file__), "../rss-fetch-agent/agent.py")],
        stdin=subprocess.PIPE,
        stdout=subprocess.PIPE,
        text=True
    )
    coral_msg = {
        "sender": "rss-monitor-agent",
        "receiver": "rss-fetch-agent",
        "content": feed_url
    }
    stdout, _ = proc.communicate(input=json.dumps(coral_msg) + "\n")
    response = json.loads(stdout)
    return response.get("content", [])

def filter_new_episodes(entries, seen):
    new_episodes = []
    for entry in entries:
        guid = entry.get("id") or entry.get("guid") or entry.get("link") or entry.get("audio_url")
        if guid and guid not in seen:
            new_episodes.append(entry)
            seen.add(guid)
    return new_episodes


# --- UNIFICADO: Usar el sistema feed_monitor_state ---
import hashlib

STATE_DIR = "feed_monitor_state"

def get_feed_id(feed_url):
    """Genera un ID único para el feed basado en la URL"""
    return hashlib.md5(feed_url.encode()).hexdigest()[:12]

def get_state_file(feed_url):
    """Ruta del archivo de estado usando el sistema unificado"""
    feed_id = get_feed_id(feed_url)
    return os.path.join(STATE_DIR, f"last_check_{feed_id}.json")

def load_seen_episodes_for_feed(feed_url):
    """Carga episodios vistos usando el formato feed_monitor_state"""
    state_file = get_state_file(feed_url)
    if os.path.exists(state_file):
        with open(state_file, "r") as f:
            data = json.load(f)
            # Convertir GUIDs a set para compatibilidad
            return set(data.get("episodes", []))
    return set()

def save_seen_episodes_for_feed(feed_url, seen):
    """Guarda episodios vistos usando el formato feed_monitor_state"""
    os.makedirs(STATE_DIR, exist_ok=True)
    state_file = get_state_file(feed_url)
    
    # Usar el formato estructurado del feed_monitor_state
    state_data = {
        "episodes": list(seen),
        "last_check": time.time()
    }
    
    with open(state_file, "w") as f:
        json.dump(state_data, f, indent=2)

def log_with_spacing(message):
    print("\n" + message, file=sys.stderr)

if __name__ == "__main__":
    for line in sys.stdin:
        msg = {}  # Inicializa msg para evitar NameError en except
        try:
            msg = json.loads(line)
            feed_url = msg.get("content")
            seen_episodes = load_seen_episodes_for_feed(feed_url)
            entries = fetch_rss_entries(feed_url)
            new_episodes = filter_new_episodes(entries, seen_episodes)
            save_seen_episodes_for_feed(feed_url, seen_episodes)
            response = {
                "sender": msg["receiver"],
                "receiver": msg["sender"],
                "content": new_episodes
            }
            print(json.dumps(response), flush=True)
        except Exception as e:
            import traceback
            traceback.print_exc()
            error_response = {
                "sender": "rss-monitor-agent",
                "receiver": msg.get("sender", "unknown"),
                "content": f"Error: {str(e)}"
            }
            print(json.dumps(error_response), flush=True)
