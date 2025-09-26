from abc import ABC, abstractmethod
import json
from llama_index.llms.anthropic import Anthropic
from app.core.config import settings
from pydantic import BaseModel

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
        self.llm = Anthropic(api_key=self.api_key, model="claude-3-5-haiku-latest", temperature=0.0)

    def complete(self, prompt: str) -> str:
        return self.llm.complete(prompt).text

    def structured_complete(self, prompt: str, model: BaseModel):
        sllm = self.llm.as_structured_llm(model)
        response = json.loads(sllm.complete(prompt).text)
        return response

    def generate_text_with_context(self, prompt: str, context: str) -> str:
        pass