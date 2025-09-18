from dotenv import load_dotenv
import os
import sys
import json
import requests

# Cargar las variables de entorno desde el archivo .env
load_dotenv("/workspaces/GlobalPodcaster/devcontainer/.env")

MISTRAL_API_KEY = os.getenv("MISTRAL_API_KEY")
MISTRAL_API_URL = os.getenv("MISTRAL_API_URL", "https://api.mistral.ai/v1/chat/completions")

if not MISTRAL_API_KEY:
    raise ValueError("MISTRAL_API_KEY no está configurada. Asegúrate de que esté definida en el archivo .env o en las variables de entorno.")

HEADERS = {
    "Authorization": f"Bearer {MISTRAL_API_KEY}",
    "Content-Type": "application/json"
}

def mistral_translate(text, target_lang):
    # Prompt para traducción usando LLM
    prompt = f"Translate the following text to {target_lang}:\n{text}"
    data = {
        "model": "mistral-tiny",  # Modelo gratuito por defecto
        "messages": [
            {"role": "user", "content": prompt}
        ],
        "max_tokens": 1024,
        "temperature": 0.2
    }
    response = requests.post(MISTRAL_API_URL, headers=HEADERS, json=data)
    response.raise_for_status()
    result = response.json()
    return result["choices"][0]["message"]["content"].strip()

def log_with_spacing(message):
    print("\n" + message, file=sys.stderr)

if __name__ == "__main__":
    for line in sys.stdin:
        try:
            msg = json.loads(line)
            text = msg.get("content")
            target_lang = msg.get("target_lang", "es")  # Default: Spanish
            translated = mistral_translate(text, target_lang)
            response = {
                "sender": msg["receiver"],
                "receiver": msg["sender"],
                "content": translated
            }
            print(json.dumps(response), flush=True)
        except Exception as e:
            import traceback
            traceback.print_exc()
            error_response = {
                "sender": "translation-agent",
                "receiver": msg.get("sender", "unknown"),
                "content": f"Error: {str(e)}"
            }
            print(json.dumps(error_response), flush=True)
