from deepgram import Deepgram
import os
import sys
import json
import asyncio
from dotenv import load_dotenv

load_dotenv()
DEEPGRAM_API_KEY = os.getenv("DEEPGRAM_API_KEY")
dg_client = Deepgram(DEEPGRAM_API_KEY)

async def transcribe(audio_url):
    response = await dg_client.transcription.prerecorded(
        {"url": audio_url},
        {"punctuate": True, "language": "en"}
    )
    return response["results"]["channels"][0]["alternatives"][0]["transcript"]

if __name__ == "__main__":
    for line in sys.stdin:
        try:
            msg = json.loads(line)
            audio_url = msg.get("content")
            transcript = asyncio.run(transcribe(audio_url))
            response = {
                "sender": msg["receiver"],
                "receiver": msg["sender"],
                "content": transcript
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