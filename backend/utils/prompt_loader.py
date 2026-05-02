import os
from functools import lru_cache

PROMPTS_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'prompts')

@lru_cache(maxsize=10)
def load_prompt(filename: str) -> str:
    """
    Loads a prompt from the prompts directory.
    Results are cached in memory to avoid repetitive disk reads.
    """
    filepath = os.path.join(PROMPTS_DIR, filename)
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            return f.read()
    except FileNotFoundError:
        print(f"Warning: Prompt file {filename} not found at {filepath}")
        return ""
