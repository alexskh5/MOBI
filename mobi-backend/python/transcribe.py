import sys
import json
import whisper

def main():
    if len(sys.argv) < 2:
        print(json.dumps({
            "transcript": "",
            "confidence": 0.0,
            "error": "No audio path provided"
        }))
        return

    audio_path = sys.argv[1]

    try:
        # Use "tiny" if your Mac is slow. Use "base" for better accuracy.
        model = whisper.load_model("base")
        result = model.transcribe(audio_path, fp16=False)

        transcript = result.get("text", "").strip()

        print(json.dumps({
            "transcript": transcript,
            "confidence": 0.85 if transcript else 0.3
        }))

    except Exception as e:
        print(json.dumps({
            "transcript": "",
            "confidence": 0.0,
            "error": str(e)
        }))

if __name__ == "__main__":
    main()
# import whisper

# model = whisper.load_model("base")
# print("Whisper loaded successfully")