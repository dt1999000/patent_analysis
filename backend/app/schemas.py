from pydantic import BaseModel

class LogicMillQuery(BaseModel):
    title: str
    abstract: str
    amount: int
    model: str

class LogicMillDocument(BaseModel):
    PatspecterEmbedding: list[float]
    title: str
    url: str

class LogicMillRetrievedDocument(BaseModel):
    id: str
    score: float
    index: str
    document: LogicMillDocument

class LogicMillRetrievedResponse(BaseModel):
    response: list[LogicMillRetrievedDocument]