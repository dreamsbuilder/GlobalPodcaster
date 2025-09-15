import sys
import json

import feedparser

def fetch_rss_feed(url):
    feed = feedparser.parse(url)
    entries = []
    for entry in feed.entries:
            audio_url = None
            # Revisar si hay enclosure (audio)
            if hasattr(entry, 'enclosures') and entry.enclosures:
                audio_url = entry.enclosures[0].get('href')
            elif hasattr(entry, 'enclosure') and entry.enclosure:
                audio_url = entry.enclosure.get('href')
            entries.append({
                'title': getattr(entry, 'title', None),
                'link': getattr(entry, 'link', None),
                'published': getattr(entry, 'published', None),
                'summary': getattr(entry, 'summary', None),
                'audio_url': audio_url
            })
    return entries

if __name__ == "__main__":
    for line in sys.stdin:
        try:
            msg = json.loads(line)
            feed_url = msg.get("content")
            entries = fetch_rss_feed(feed_url)
            response = {
                "sender": msg["receiver"],
                "receiver": msg["sender"],
                "content": entries
            }
            print(json.dumps(response), flush=True)
        except Exception as e:
            error_response = {
                "sender": "rss-fetch-agent",
                "receiver": msg.get("sender", "unknown"),
                "content": f"Error: {str(e)}"
            }
            print(json.dumps(error_response), flush=True)
