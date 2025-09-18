import sys
import json

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


# --- NUEVO: Manejo de estado por feed ---
import hashlib

def get_state_file(feed_url):
    h = hashlib.sha256(feed_url.encode()).hexdigest()[:16]
    return f"seen_episodes_{h}.json"

def load_seen_episodes_for_feed(feed_url):
    state_file = get_state_file(feed_url)
    if os.path.exists(state_file):
        with open(state_file, "r") as f:
            return set(json.load(f))
    return set()

def save_seen_episodes_for_feed(feed_url, seen):
    state_file = get_state_file(feed_url)
    with open(state_file, "w") as f:
        json.dump(list(seen), f)

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
