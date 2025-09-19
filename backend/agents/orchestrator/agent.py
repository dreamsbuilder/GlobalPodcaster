import sys
import os
import json
import subprocess


def run_agent(agent_path, msg):
    """Ejecuta un agente y devuelve su salida procesada."""
    proc = subprocess.Popen(
        [sys.executable, agent_path],
        stdin=subprocess.PIPE,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        text=True
    )
    stdout, stderr = proc.communicate(input=json.dumps(msg) + "\n")
    
    if proc.returncode != 0:
        raise RuntimeError(f"Agent at {agent_path} failed with error: {stderr}")
    
    try:
        response = json.loads(stdout)
    except json.JSONDecodeError:
        raise ValueError(f"Invalid JSON response from agent at {agent_path}: {stdout}")
    
    return response


def call_rss_monitor_agent(feed_url):
    proc = subprocess.Popen(
        [sys.executable, "../../agents/rss-monitor-agent/agent.py"],
        stdin=subprocess.PIPE,
        stdout=subprocess.PIPE,
        text=True
    )
    coral_msg = {
        "sender": "orchestrator",
        "receiver": "rss-monitor-agent",
        "content": feed_url
    }
    stdout, _ = proc.communicate(input=json.dumps(coral_msg) + "\n")
    response = json.loads(stdout)
    return response.get("content", [])

def call_transcription_agent(audio_url):
    proc = subprocess.Popen(
        [sys.executable, "../../agents/transcription-agent/agent.py"],
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
    try:
        response = json.loads(stdout)
    except json.JSONDecodeError as e:
        print(f"Error al decodificar JSON: {e}")
        print(f"Contenido de stdout: {stdout}")
        return None
    return response.get("content", "")

def call_translation_agent(text, target_lang="es"):
    proc = subprocess.Popen(
        [sys.executable, "../../agents/translation-agent/agent.py"],
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

def call_tts_agent(text, voice_id=None):
    msg = {"sender": "orchestrator", "receiver": "tts-agent", "content": text}
    if voice_id:
        msg["voice_id"] = voice_id
    return run_agent("../../agents/tts-agent/agent.py", msg)  # assuming run_agent returns parsed content


def log_with_spacing(message):
    print(message, file=sys.stderr)


if __name__ == "__main__":
    for line in sys.stdin:
        try:
            msg = json.loads(line)
            feed_url = msg.get("content")
            new_episodes = call_rss_monitor_agent(feed_url)
            print("DEBUG NEW EPISODES:", new_episodes, file=sys.stderr)
            if not isinstance(new_episodes, list) or not new_episodes:
                response = {
                    "sender": "orchestrator",
                    "receiver": msg["sender"],
                    "content": "No hay episodios nuevos."
                }
                print(json.dumps(response), flush=True)
                continue
            # Procesar cada episodio nuevo
            results = []
            target_lang = msg.get("target_lang", "es")
            for ep in new_episodes:
                audio_url = ep.get("audio_url")
                if not audio_url:
                    continue
                print(f"DEBUG: Procesando audio_url: {audio_url}", file=sys.stderr)
                transcript = call_transcription_agent(audio_url)
                log_with_spacing(f"DEBUG: Transcript obtenido: {transcript[:25]}...")
                translation = call_translation_agent(transcript, target_lang)
                log_with_spacing(f"DEBUG: Traducción obtenida: {translation[:25]}...")
                
                # Truncar la traducción para ahorrar créditos TTS (máximo 500 caracteres)
                translation_truncated = translation[:500] + "..." if len(translation) > 500 else translation
                
                # Llamar al agente TTS para generar el audio
                tts_result = call_tts_agent(translation_truncated, voice_id=os.getenv("TTS_DEFAULT_VOICE_ID"))
                log_with_spacing(f"DEBUG: TTS result: {tts_result}")
                
                # Extraer la URL del audio generado
                tts_audio_url = None
                if tts_result and isinstance(tts_result, dict):
                    tts_content = tts_result.get("content", {})
                    if isinstance(tts_content, dict):
                        tts_audio_url = tts_content.get("audio_url")
                
                log_with_spacing(f"DEBUG: TTS audio URL generada: {tts_audio_url}")
                
                # Agregar el audio_url generado al resultado
                results.append({
                    "title": ep.get("title"),
                    "audio_url": audio_url,  # URL original del podcast
                    "transcript": transcript,
                    "translation": translation,
                    "tts_audio_url": tts_audio_url  # Nuevo campo para el audio generado
                })
            response = {
                "sender": "orchestrator",
                "receiver": msg["sender"],
                "content": results
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