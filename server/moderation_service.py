#!/usr/bin/env python3
"""
server/moderation_service.py

Lightweight Python microservice for open-source Detoxify text moderation.
Listens on port 5001.
Accepts POST /moderate with JSON: {"text": "..."}
Returns JSON: {"flagged": bool, "toxicity": float, "categories": {...}}

Run with:
    pip install -r requirements-moderation.txt
    python3 moderation_service.py
"""

import json
import sys
from http.server import HTTPServer, BaseHTTPRequestHandler

detoxify_model = None

try:
    from detoxify import Detoxify
    print("[Detoxify Service] Loading Detoxify model into memory...")
    detoxify_model = Detoxify('original')
    print("[Detoxify Service] Model loaded successfully.")
except ImportError:
    print("[Detoxify Service] Notice: 'detoxify' package not installed. Running in heuristic mode.")
    print("                 To install: pip install detoxify torch")

TOXICITY_THRESHOLD = 0.70

class ModerationHandler(BaseHTTPRequestHandler):
    def do_POST(self):
        if self.path != '/moderate':
            self.send_response(404)
            self.end_headers()
            return

        content_length = int(self.headers.get('Content-Length', 0))
        post_data = self.rfile.read(content_length)

        try:
            payload = json.loads(post_data.decode('utf-8'))
            text = payload.get('text', '')

            flagged = False
            toxicity_score = 0.0
            results = {}

            if detoxify_model and text:
                scores = detoxify_model.predict(text)
                results = {k: float(v) for k, v in scores.items()}
                toxicity_score = results.get('toxicity', 0.0)
                severe_toxicity = results.get('severe_toxicity', 0.0)
                threat = results.get('threat', 0.0)
                identity_attack = results.get('identity_attack', 0.0)

                if (toxicity_score > TOXICITY_THRESHOLD or 
                    severe_toxicity > 0.50 or 
                    threat > 0.50 or 
                    identity_attack > 0.50):
                    flagged = True
            elif text:
                # Basic fallback heuristic when detoxify is not installed
                flagged = False
                toxicity_score = 0.0

            response = {
                "flagged": flagged,
                "toxicity": toxicity_score,
                "scores": results,
                "engine": "detoxify" if detoxify_model else "heuristic_fallback"
            }

            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps(response).encode('utf-8'))

        except Exception as e:
            self.send_response(500)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({"error": str(e)}).encode('utf-8'))

    def do_GET(self):
        if self.path == '/health':
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({
                "status": "healthy",
                "detoxify_loaded": detoxify_model is not None
            }).encode('utf-8'))
        else:
            self.send_response(404)
            self.end_headers()

    def log_message(self, format, *args):
        # Silence default request logging to keep console clean
        return

def run_server(port=5001):
    server_address = ('127.0.0.1', port)
    httpd = HTTPServer(server_address, ModerationHandler)
    print(f"[Detoxify Service] Listening on http://127.0.0.1:{port}/moderate")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\n[Detoxify Service] Shutting down.")
        httpd.server_close()

if __name__ == '__main__':
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 5001
    run_server(port)

