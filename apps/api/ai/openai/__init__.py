"""
OpenAI subpackage.
"""
from .requests import OpenAIClient
from .function_calls import issue, maintained

__all__ = ["OpenAIClient", "issue", "maintained"]