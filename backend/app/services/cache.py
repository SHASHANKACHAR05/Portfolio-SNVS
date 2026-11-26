import threading
import time
from typing import Any, Optional

_lock = threading.Lock()
_cache_value: Optional[Any] = None
_cache_expires_at: float = 0.0
DEFAULT_TTL_SECONDS = 60.0


def get_portfolio_cache() -> Optional[Any]:
    with _lock:
        if _cache_value is not None and time.monotonic() < _cache_expires_at:
            return _cache_value
        return None


def set_portfolio_cache(value: Any, ttl_seconds: float = DEFAULT_TTL_SECONDS) -> None:
    global _cache_value, _cache_expires_at
    with _lock:
        _cache_value = value
        _cache_expires_at = time.monotonic() + ttl_seconds


def invalidate_portfolio_cache() -> None:
    global _cache_value, _cache_expires_at
    with _lock:
        _cache_value = None
        _cache_expires_at = 0.0

