#!/usr/bin/env python3
"""
Script simple para probar el monitoring de feeds sin servidor web
"""
import sys
import os
import json
import hashlib
import time
from datetime import datetime
import feedparser
import requests

# Configuración
FEEDS_FILE = "../../feeds.txt"
STATE_DIR = "feed_monitor_state"

def get_feeds():
    """Lee los feeds desde el archivo feeds.txt."""
    feeds_file_path = os.path.abspath(os.path.join(os.path.dirname(__file__), FEEDS_FILE))
    if not os.path.exists(feeds_file_path):
        raise FileNotFoundError(f"Feeds file not found: {feeds_file_path}")
    with open(feeds_file_path) as f:
        return [line.strip() for line in f if line.strip() and not line.startswith('#')]

def get_feed_hash(feed_url):
    """Genera un hash único para el feed."""
    return hashlib.md5(feed_url.encode()).hexdigest()[:12]

def load_state(feed_url):
    """Carga el estado guardado de un feed."""
    os.makedirs(STATE_DIR, exist_ok=True)
    feed_hash = get_feed_hash(feed_url)
    state_file = os.path.join(STATE_DIR, f"last_check_{feed_hash}.json")
    
    if os.path.exists(state_file):
        with open(state_file, 'r') as f:
            return json.load(f)
    return {"episodes": []}

def save_state(feed_url, episodes):
    """Guarda el estado de un feed."""
    os.makedirs(STATE_DIR, exist_ok=True)
    feed_hash = get_feed_hash(feed_url)
    state_file = os.path.join(STATE_DIR, f"last_check_{feed_hash}.json")
    
    state = {"episodes": episodes}
    with open(state_file, 'w') as f:
        json.dump(state, f, indent=2)

def check_feed(feed_url):
    """Revisa un feed y detecta episodios nuevos."""
    print(f"🔍 Checking feed: {feed_url}")
    
    try:
        # Cargar estado anterior
        state = load_state(feed_url)
        known_episodes = set(state.get("episodes", []))
        
        # Obtener feed RSS
        response = requests.get(feed_url, timeout=30)
        response.raise_for_status()
        
        feed = feedparser.parse(response.content)
        current_episodes = []
        new_episodes = []
        
        for entry in feed.entries:
            episode_id = entry.link if hasattr(entry, 'link') else entry.id
            current_episodes.append(episode_id)
            
            if episode_id not in known_episodes:
                new_episodes.append({
                    'title': entry.title if hasattr(entry, 'title') else 'Unknown',
                    'link': episode_id,
                    'published': entry.published if hasattr(entry, 'published') else 'Unknown'
                })
        
        # Mostrar resultado
        print(f"📊 Total episodes found: {len(current_episodes)}")
        print(f"🆕 New episodes: {len(new_episodes)}")
        
        if new_episodes:
            print("🎉 NEW EPISODES DETECTED:")
            for i, ep in enumerate(new_episodes[:3]):  # Mostrar max 3
                print(f"   {i+1}. {ep['title']}")
                print(f"      📅 {ep['published']}")
            if len(new_episodes) > 3:
                print(f"   ... and {len(new_episodes) - 3} more episodes")
        else:
            print("✅ No new episodes (all already processed)")
        
        # Guardar estado actualizado
        all_episodes = list(known_episodes.union(set(current_episodes)))
        save_state(feed_url, all_episodes)
        
        return new_episodes
        
    except Exception as e:
        print(f"❌ Error checking feed: {e}")
        return []

def main():
    """Función principal de monitoring."""
    print("🚀 Starting Feed Monitor Test")
    print(f"⏰ Time: {datetime.now().strftime('%H:%M:%S')}")
    
    try:
        feeds = get_feeds()
        print(f"📰 Found {len(feeds)} feeds to check")
        
        total_new = 0
        for i, feed_url in enumerate(feeds, 1):
            print(f"\n📡 ({i}/{len(feeds)}) Processing: {feed_url}")
            new_episodes = check_feed(feed_url)
            total_new += len(new_episodes)
            time.sleep(1)  # Pequeña pausa entre feeds
        
        print(f"\n🎯 SUMMARY:")
        print(f"   📊 Feeds processed: {len(feeds)}")
        print(f"   🆕 Total new episodes: {total_new}")
        
        if total_new > 0:
            print("🚀 New content detected! Pipeline would be triggered.")
        else:
            print("😴 No new content. Pipeline idle (normal behavior).")
            
    except Exception as e:
        print(f"💥 Error: {e}")

if __name__ == "__main__":
    main()