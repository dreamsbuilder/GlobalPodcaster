import sys
import json
import subprocess

def call_rss_fetch_agent(feed_url):
    proc = subprocess.Popen(
        [sys.executable, "agents/rss-fetch-agent/agent.py"],
        stdin=subprocess.PIPE,
        stdout=subprocess.PIPE,
        text=True
    )
    coral_msg = {
        "sender": "orchestrator",
        "receiver": "rss-fetch-agent",
        "content": feed_url
    }
    stdout, _ = proc.communicate(input=json.dumps(coral_msg) + "\n")
    response = json.loads(stdout)
    return response.get("content", [])

def call_transcription_agent(audio_url):
    proc = subprocess.Popen(
        [sys.executable, "agents/transcription-agent/agent.py"],
        stdin=subprocess.PIPE,
        stdout=subprocess.PIPE,
        text=True
    )
    coral_msg = {
        "sender": "orchestrator",
        "receiver": "transcription-agent",
        "content": audio_url
    }
    stdout, _ = proc.communicate(input=json.dumps(coral_msg) + "\n")
    response = json.loads(stdout)
    return response.get("content", "")

def call_translation_agent(text, target_lang="es"):
    proc = subprocess.Popen(
        [sys.executable, "agents/translation-agent/agent.py"],
        stdin=subprocess.PIPE,
        stdout=subprocess.PIPE,
        text=True
    )
    coral_msg = {
        "sender": "orchestrator",
        "receiver": "translation-agent",
        "content": text,
        "target_lang": target_lang
    }
    stdout, _ = proc.communicate(input=json.dumps(coral_msg) + "\n")
    response = json.loads(stdout)
    return response.get("content", "")

if __name__ == "__main__":
    for line in sys.stdin:
        try:
            msg = json.loads(line)
            feed_url = msg.get("content")
            entries = call_rss_fetch_agent(feed_url)
            print("DEBUG RSS ENTRIES:", entries, file=sys.stderr)
            if not isinstance(entries, list) or not entries or not entries[0].get("audio_url"):
                response = {
                    "sender": "orchestrator",
                    "receiver": msg["sender"],
                    "content": "No se encontro audio en el feed o hubo un error."
                }
                print(json.dumps(response), flush=True)
                continue
            audio_url = entries[0]["audio_url"]
            transcript = call_transcription_agent(audio_url)
            # Traducción al idioma destino (por defecto español)
            target_lang = msg.get("target_lang", "es")
            translation = call_translation_agent(transcript, target_lang)
            response = {
                "sender": "orchestrator",
                "receiver": msg["sender"],
                "content": translation
            }
            print(json.dumps(response), flush=True)
        except Exception as e:
            import traceback
            traceback.print_exc()
            error_response = {
                "sender": "transcription-agent",
                "receiver": msg.get("sender", "unknown"),
                "content": f"Error: {str(e)}"
            }
            print(json.dumps(error_response), flush=True)