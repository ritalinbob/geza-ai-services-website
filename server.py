#!/usr/bin/env python3
"""
Lightweight Static Web Server & n8n Reverse Proxy for Geza AI Services Website
Serves static assets locally or on a VPS and proxies:
 - POST /api/services-chat   -> Mac mini n8n /webhook/services-chat
 - POST /api/example-chat    -> Mac mini n8n /webhook/example-demo-chat
 - POST /api/services-contact -> Mac mini n8n /webhook/services-contact
"""

import http.server
import urllib.request
import urllib.error
import sys
import os

PORT = int(os.environ.get("PORT", 3040))

N8N_BASES = [
    os.environ.get("MAC_MINI_N8N_BASE", "http://Gezas-Mac-mini.local:5678"),
    "https://gezas-mac-mini.taild096ba.ts.net",
    "http://192.168.1.128:5678",
    "http://192.168.1.248:5678",
    "http://localhost:5678",
]

ROUTE_WEBHOOK_MAP = {
    "/api/services-chat": "/webhook/services-chat",
    "/api/example-chat": "/webhook/example-demo-chat",
    "/api/services-contact": "/webhook/services-contact",
}


class ServicesProxyHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        serve_dir = os.path.dirname(os.path.abspath(__file__))
        super().__init__(*args, directory=serve_dir, **kwargs)

    def do_OPTIONS(self):
        if self.path in ROUTE_WEBHOOK_MAP:
            self.send_response(204)
            self.send_header("Access-Control-Allow-Origin", "*")
            self.send_header("Access-Control-Allow-Methods", "POST, OPTIONS")
            self.send_header("Access-Control-Allow-Headers", "Content-Type, Accept")
            self.end_headers()
        else:
            super().do_OPTIONS()

    def do_POST(self):
        webhook_suffix = ROUTE_WEBHOOK_MAP.get(self.path)
        if not webhook_suffix:
            self.send_response(404)
            self.end_headers()
            return

        content_length = int(self.headers.get("Content-Length", 0))
        post_body = self.rfile.read(content_length)

        for base in N8N_BASES:
            endpoint = base.rstrip("/") + webhook_suffix
            try:
                req = urllib.request.Request(
                    endpoint,
                    data=post_body,
                    headers={
                        "Content-Type": "application/json",
                        "Accept": "application/json",
                    },
                    method="POST",
                )
                with urllib.request.urlopen(req, timeout=35) as response:
                    res_data = response.read()
                    self.send_response(200)
                    self.send_header("Content-Type", "application/json")
                    self.send_header("Access-Control-Allow-Origin", "*")
                    self.end_headers()
                    self.wfile.write(res_data)
                    return
            except Exception as exc:
                print(f"[Proxy] Error contacting {endpoint}: {exc}", file=sys.stderr)
                continue

        self.send_response(502)
        self.send_header("Content-Type", "application/json")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.end_headers()
        self.wfile.write(
            b'{"status":"error","message":"Mac mini n8n backend currently unreachable"}'
        )


if __name__ == "__main__":
    server_address = ("", PORT)
    httpd = http.server.ThreadingHTTPServer(server_address, ServicesProxyHandler)
    print(
        f"🚀 Geza AI Services Website running at http://localhost:{PORT}/ "
        f"(proxying {', '.join(ROUTE_WEBHOOK_MAP.keys())} to Mac mini n8n)"
    )
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nShutting down server.")
        sys.exit(0)
