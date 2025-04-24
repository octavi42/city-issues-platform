"""
OpenAI API request helpers.
"""
import os
try:
    import openai
except ImportError:
    openai = None

class OpenAIClient:
    """
    Wrapper around the OpenAI Python SDK for making API requests.
    """
    def __init__(self, api_key: str = None, organization: str = None):
        self.api_key = api_key or os.getenv("OPENAI_API_KEY")
        if not self.api_key:
            raise ValueError(
                "OpenAI API key must be provided or set via OPENAI_API_KEY environment variable."
            )
        if openai is None:
            raise ImportError("openai package is required for OpenAIClient")
        openai.api_key = self.api_key
        self.organization = organization or os.getenv("OPENAI_ORGANIZATION")
        if self.organization:
            openai.organization = self.organization

    def create_completion(self, model: str, prompt, **kwargs) -> dict:
        """
        Create a text completion.

        :param model: Model name (e.g., 'text-davinci-003').
        :param prompt: Prompt text or list of prompts.
        :param kwargs: Additional parameters for Completion.create.
        :return: API response dict.
        """
        return openai.Completion.create(model=model, prompt=prompt, **kwargs)

    def create_chat_completion(self, model: str, messages: list, **kwargs) -> dict:
        """
        Create a chat completion (chat-based models).

        :param model: Model name (e.g., 'gpt-4').
        :param messages: List of message dicts as per Chat API.
        :param kwargs: Additional parameters for ChatCompletion.create.
        :return: API response dict.
        """
        return openai.ChatCompletion.create(model=model, messages=messages, **kwargs)

    def create_embedding(self, model: str, input, **kwargs) -> dict:
        """
        Create an embedding for given input.

        :param model: Embedding model name.
        :param input: String or list of strings to embed.
        :param kwargs: Additional parameters for Embedding.create.
        :return: API response dict.
        """
        return openai.Embedding.create(model=model, input=input, **kwargs)