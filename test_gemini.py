import urllib.request, json

prompt = "Respond with just the word OK"

data = json.dumps({"contents": [{"parts": [{"text": prompt}]}]}).encode()
req = urllib.request.Request(
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite:generateContent?key=AIzaSyASIsIOdnWkN69_mHmGhIxkeh-ZyrBbbKQ",
    data=data,
    headers={"Content-Type": "application/json"},
)
try:
    resp = urllib.request.urlopen(req)
    print("Status:", resp.status)
    print("Body:", resp.read().decode())
except Exception as e:
    print(f"Error: {e}")
