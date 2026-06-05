from functools import wraps
from typing import Any, Callable, Optional
from cachetools import TTLCache


dashboard_cache = TTLCache(maxsize=100, ttl=300)  # 5 minutes
lookup_cache = TTLCache(maxsize=500, ttl=1800)  # 30 minutes
query_cache = TTLCache(maxsize=200, ttl=600)  # 10 minutes


def cached(cache_store: TTLCache):
    def decorator(func: Callable):
        @wraps(func)
        def wrapper(*args, **kwargs):
            key_parts = [func.__name__]
            key_parts.extend(str(a) for a in args)
            key_parts.extend(f"{k}={v}" for k, v in sorted(kwargs.items()))
            cache_key = ":".join(key_parts)

            if cache_key in cache_store:
                return cache_store[cache_key]

            result = func(*args, **kwargs)
            cache_store[cache_key] = result
            return result

        @wraps(func)
        async def async_wrapper(*args, **kwargs):
            key_parts = [func.__name__]
            key_parts.extend(str(a) for a in args)
            key_parts.extend(f"{k}={v}" for k, v in sorted(kwargs.items()))
            cache_key = ":".join(key_parts)

            if cache_key in cache_store:
                return cache_store[cache_key]

            result = await func(*args, **kwargs)
            cache_store[cache_key] = result
            return result

        import asyncio

        if asyncio.iscoroutinefunction(func):
            return async_wrapper
        return wrapper

    return decorator


def invalidate_cache(cache_store: TTLCache, prefix: Optional[str] = None):
    if prefix:
        keys_to_delete = [k for k in cache_store if k.startswith(prefix)]
        for k in keys_to_delete:
            del cache_store[k]
    else:
        cache_store.clear()


def clear_all_caches():
    dashboard_cache.clear()
    lookup_cache.clear()
    query_cache.clear()
