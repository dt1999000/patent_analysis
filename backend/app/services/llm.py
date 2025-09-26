from abc import ABC, abstractmethod
import json
from llama_index.llms.anthropic import Anthropic
from app.core.config import settings
from pydantic import BaseModel
from typing import Type, TypeVar

class LLMService(ABC):
    @abstractmethod
    def complete(self, prompt: str) -> str:
        pass

    @abstractmethod
    def generate_text_with_context(self, prompt: str, context: str) -> str:
        pass

class BaseLLMService(LLMService):
    def __init__(self, api_key: str=settings.ANTHROPIC_API_KEY):
        self.api_key = api_key
        self.llm = Anthropic(api_key=self.api_key, model="claude-sonnet-4-0", temperature=0.0, max_tokens=8192, tools=[
        {
            "type": "web_search_20250305",
            "name": "web_search",
            "max_uses": 5,  # Limit to 3 searches
        }
        ])

    def complete(self, prompt: str) -> str:
        return self.llm.complete(prompt).text

    def structured_complete(self, prompt: str, model: Type[BaseModel]) -> BaseModel:
        """Return a Pydantic model instance validated from the LLM JSON output.

        The `model` argument must be a subclass of pydantic.BaseModel.
        """
        sllm = self.llm.as_structured_llm(model)
        raw_text = sllm.complete(prompt).text
        try:
            parsed = json.loads(raw_text)
        except Exception:
            # If the LLM already returned a JSON-able structure string, keep as-is
            parsed = raw_text
        # Validate and coerce into the provided Pydantic model class
        return model.model_validate(parsed)
    def generate_text_with_context(self, prompt: str, context: str) -> str:
        pass