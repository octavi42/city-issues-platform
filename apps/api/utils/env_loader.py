"""
Load environment variables from a .env file at the project root.
"""
import os
from pathlib import Path

__all__ = ["load_dotenv"]

def load_dotenv(env_file: Path = None) -> None:
    """
    Load environment variables from a .env file.

    Reads lines of the form KEY=VALUE, ignores comments and blank lines,
    and sets each variable in os.environ if not already present.

    :param env_file: Path to the .env file. If None, defaults to the file
                     named '.env' in the project root (one directory above utils/).
    """
    if env_file is None:
        # project root is two levels up from this file: utils/env_loader.py -> utils/ -> project root
        env_file = Path(__file__).resolve().parent.parent / '.env'
    if not env_file.is_file():
        return
    text = env_file.read_text()
    for raw_line in text.splitlines():
        line = raw_line.strip()
        if not line or line.startswith('#') or '=' not in line:
            continue
        key, val = line.split('=', 1)
        key = key.strip()
        val = val.strip().strip('"').strip("'")
        os.environ.setdefault(key, val)