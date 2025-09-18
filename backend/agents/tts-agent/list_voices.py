from elevenlabs import ElevenLabs
import os
from dotenv import load_dotenv

load_dotenv(dotenv_path=".env")

client = ElevenLabs(api_key=os.getenv("ELEVENLABS_API_KEY"))

voices = client.voices.get_all()
for v in voices.voices:
    print(v.name, "→", v.voice_id)
