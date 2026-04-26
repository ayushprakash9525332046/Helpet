import sys
import os

# Ensure the backend root is on the path so `from app.xxx import yyy` works
_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, _root)

# Run pending migrations on cold start
try:
    from alembic.config import Config
    from alembic import command as alembic_command
    _cfg = Config(os.path.join(_root, "alembic.ini"))
    alembic_command.upgrade(_cfg, "head")
except Exception as _e:
    print(f"Migration warning: {_e}")

from mangum import Mangum
from app.main import app

handler = Mangum(app, lifespan="off")
