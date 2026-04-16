import sys
import os

# Ensure the backend root is on the path so `from app.xxx import yyy` works
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from mangum import Mangum
from app.main import app

handler = Mangum(app, lifespan="off")
