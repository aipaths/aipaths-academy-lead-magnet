# Regenera la voz en off con OpenAI TTS (opcional: el pack ya trae las 4 tomas).
# Necesita OPENAI_API_KEY en el entorno. Cuesta centavos; es lo único pago del ejemplo.
# Uso: python3 scripts/generar-voz.py marin   -> escribe assets/vo/openai/vo-1..4.wav
import json, os, sys, urllib.request

key = os.environ["OPENAI_API_KEY"]
voice = sys.argv[1] if len(sys.argv) > 1 else "marin"
lines = [l.strip() for l in open("assets/vo/guion.txt", encoding="utf-8") if l.strip()]
instr = ("Hablá en español rioplatense (Argentina), con voseo natural. Tono de presentador de un canal "
         "de tecnología: claro, seguro, con energía contenida, sin exagerar. Ritmo rápido y dinámico, "
         "como un reel de redes: frases de corrido, sin pausas largas, sin alargar las vocales. "
         "Pronunciá en inglés los términos técnicos: 'frame' como 'freim', 'Claude' como 'clod', "
         "'HTML' letra por letra en español (hache te eme ele), 'FFmpeg' como 'efe efe em peg'.")

os.makedirs("assets/vo/openai", exist_ok=True)
for i, text in enumerate(lines, 1):
    body = json.dumps({"model": "gpt-4o-mini-tts", "voice": voice, "input": text,
                       "instructions": instr, "response_format": "wav"}).encode()
    req = urllib.request.Request("https://api.openai.com/v1/audio/speech", data=body,
          headers={"Authorization": f"Bearer {key}", "Content-Type": "application/json"})
    data = urllib.request.urlopen(req, timeout=120).read()
    open(f"assets/vo/openai/vo-{i}.wav", "wb").write(data)
    print(f"vo-{i}.wav ok")
