"""Patch webhook_server.py to add API key auth on sensitive endpoints."""
import os

SERVER_PATH = "/root/oracle/v3/webhook_server.py"

with open(SERVER_PATH) as f:
    c = f.read()

# Auth decorator code
auth = '''
from functools import wraps

ORACLE_API_KEY = os.getenv("ORACLE_API_KEY", "")

def require_api_key(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        if not ORACLE_API_KEY:
            return jsonify({"success": False, "error": "Server API key not configured"}), 500
        key = request.headers.get("X-Oracle-Key", "")
        if key != ORACLE_API_KEY:
            return jsonify({"success": False, "error": "Unauthorized"}), 401
        return f(*args, **kwargs)
    return decorated
'''

# Insert after DATA_DIR line
c = c.replace(
    'DATA_DIR = CONFIG["data_dir"]',
    'DATA_DIR = CONFIG["data_dir"]' + auth
)

# Protect close position
c = c.replace(
    '@app.route("/api/positions/<token_address>/close", methods=["POST"])\ndef api_close_position',
    '@app.route("/api/positions/<token_address>/close", methods=["POST"])\n@require_api_key\ndef api_close_position'
)

# Protect settings update
c = c.replace(
    '@app.route("/api/settings", methods=["POST"])\ndef api_update_settings',
    '@app.route("/api/settings", methods=["POST"])\n@require_api_key\ndef api_update_settings'
)

# Protect copy trade
c = c.replace(
    '@app.route("/api/trade/copy", methods=["POST"])\ndef api_copy_trade',
    '@app.route("/api/trade/copy", methods=["POST"])\n@require_api_key\ndef api_copy_trade'
)

with open(SERVER_PATH, "w") as f:
    f.write(c)

print("Auth patched successfully on 3 endpoints")
