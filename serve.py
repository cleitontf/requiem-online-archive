#!/usr/bin/env python3
"""
Local server for requiem.isnet.ru archive.
Usage:
  python3 serve.py    (starts server, opens browser automatically)
"""
import http.server, os, json, urllib.parse, webbrowser, threading

PORT = 8000
ROOT = os.path.dirname(os.path.abspath(__file__))

EMPTY_JSON = json.dumps({"code": 0})
EMPTY_BUILDS = json.dumps({"builds": [], "pagination": ""})
EMPTY_BUNS = json.dumps({"buns": []})


class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=ROOT, **kwargs)

    def do_POST(self):
        path = self.path.split('?')[0]
        length = int(self.headers.get('Content-Length', 0))
        self.rfile.read(length)  # consume body

        if path == '/ajax/calculator/builds':
            self._json(EMPTY_BUILDS)
        elif path == '/ajax/buns/load':
            self._json(EMPTY_BUNS)
        else:
            self._json(EMPTY_JSON)

    def _json(self, data):
        b = data.encode()
        self.send_response(200)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Content-Length', str(len(b)))
        self.end_headers()
        self.wfile.write(b)

    def end_headers(self):
        self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
        self.send_header('Pragma', 'no-cache')
        self.send_header('Expires', '0')
        super().end_headers()

    def translate_path(self, path):
        path = path.split('?')[0].split('#')[0]
        # Pages use <base href="/requiem-online-archive/"> for GitHub Pages
        # subpath hosting; mirror that prefix locally so relative URLs resolve.
        prefix = '/requiem-online-archive'
        if path == prefix:
            path = '/'
        elif path.startswith(prefix + '/'):
            path = path[len(prefix):]
        result = super().translate_path(path)
        if os.path.exists(result):
            return result
        index = os.path.join(result, 'index.html')
        if os.path.exists(index):
            return index
        return result

    def log_message(self, fmt, *args):
        if args and len(args) >= 2 and str(args[1]).startswith(('4', '5')):
            super().log_message(fmt, *args)


def open_browser():
    import time; time.sleep(0.6)
    webbrowser.open(f'http://localhost:{PORT}')


if __name__ == '__main__':
    os.chdir(ROOT)
    jquery = os.path.join(ROOT, 'template', 'js', 'jquery-1.11.1.min.js')
    if not os.path.exists(jquery):
        print("⚠  jQuery not found. Run: python3 download_jquery.py")
    print(f"✓  Serving at http://localhost:{PORT}  — Ctrl+C to stop\n")
    threading.Thread(target=open_browser, daemon=True).start()
    try:
        with http.server.HTTPServer(('', PORT), Handler) as s:
            s.serve_forever()
    except KeyboardInterrupt:
        print("\nStopped.")
