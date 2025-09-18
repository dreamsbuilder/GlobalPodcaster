# agents/tts-agent/agent.py
import os
import sys
import json
import uuid
import time
from dotenv import load_dotenv

# Official SDK
from elevenlabs import ElevenLabs  # client wrapper
# alternative direct helpers (some SDK versions also expose generate/save functions)

load_dotenv()

ELEVEN_API_KEY = os.getenv("ELEVENLABS_API_KEY")
DEFAULT_VOICE_ID = os.getenv("TTS_DEFAULT_VOICE_ID", None)
STORAGE_DIR = os.getenv("STORAGE_DIR", "storage")
STORAGE_BASE_URL = os.getenv("STORAGE_BASE_URL", "http://localhost:5001/media")

# Create storage dir
os.makedirs(STORAGE_DIR, exist_ok=True)

# Instantiate client
if not ELEVEN_API_KEY:
    print(json.dumps({
        "sender": "tts-agent", "receiver": "orchestrator",
        "content": "Error: Missing ELEVENLABS_API_KEY in environment."
    }), flush=True)
    sys.exit(1)

client = ElevenLabs(api_key=ELEVEN_API_KEY)

def make_filename(prefix="tts", ext="mp3"):
    ts = int(time.time())
    unique = uuid.uuid4().hex[:8]
    return f"{prefix}_{ts}_{unique}.{ext}"

def tts_to_file(text, voice_id):
    """
    Uses ElevenLabs SDK to synthesize speech and save an mp3 file.
    Returns the local path to the saved file.
    """
    out_name = make_filename("tts", "mp3")
    out_path = os.path.join(STORAGE_DIR, out_name)

    try:
        # This returns a generator of byte chunks
        audio_gen = client.text_to_speech.convert(
            voice_id=voice_id,
            text=text,
            model_id="eleven_multilingual_v2",
            output_format="mp3_44100_128"
        )

        # Combine all chunks into one bytes object
        audio_bytes = b"".join(audio_gen)

        with open(out_path, "wb") as f:
            f.write(audio_bytes)

        return out_path
    except Exception as e:
        raise

def log_with_spacing(message):
    print("\n" + message + "\n", file=sys.stderr)

if __name__ == "__main__":
    # read incoming JSON messages from stdin (one per line)
    for line in sys.stdin:
        try:
            msg = json.loads(line)
            text = msg.get("content", "")
            voice_id = msg.get("voice_id") or DEFAULT_VOICE_ID
            if not text:
                raise ValueError("No text provided in content.")
            if not voice_id:
                raise ValueError("No voice_id provided and no TTS_DEFAULT_VOICE_ID set.")

            # synthesize
            local_path = tts_to_file(text, voice_id)
            filename = os.path.basename(local_path)
            public_url = f"{STORAGE_BASE_URL}/{filename}"

            response = {
                "sender": msg.get("receiver", "tts-agent"),
                "receiver": msg.get("sender", "orchestrator"),
                "content": {
                    "local_path": local_path,
                    "audio_url": public_url
                }
            }
            print(json.dumps(response), flush=True)

        except Exception as e:
            # print full error to stderr for debugging
            import traceback, sys as _sys
            traceback.print_exc(file=_sys.stderr)
            err = {
                "sender": "tts-agent",
                "receiver": msg.get("sender", "unknown") if 'msg' in locals() else "unknown",
                "content": f"Error: {str(e)}"
            }
            print(json.dumps(err), flush=True)