from app.services.retrieval import Retrieval
from app.services.scraping import ScrapingService
from app.schemas import LogicMillQuery
from pydantic import BaseModel, Field
from typing import List, Optional


class Topic(BaseModel):
    topic: str = Field(description="A topic of the document, describing the one core concept or idea of the document")
    subtopics: List[str] = Field(description="A list of subtopics/child topics of the document, describing the specific aspects or details of the topic")

class DocumentTopics(BaseModel):
    topics: List[Topic] = Field(
        description=
        "A list of topics of the document, describing main ideas or concepts of the document. "
        "The list consists of multiple topics, each having a topic (parent topic) and subtopics (child topics)"
    )

class IngestedDocument(BaseModel):
    id: str
    type: str
    authors: List[str]
    institutions: List[str]
    fulltext: str
    topics: List[str]

class IngestedDocument(BaseModel):
    id: str = Field(description="The id of the document")
    type: str = Field(description="The type of the document: Patent/Publication")
    authors: List[str] = Field(description="The authors of the document")
    institutions: List[str] = Field(description="The institutions of the document")
    full_text: str = Field(description="The full text of the document")
    topics: Optional[List[Topic]] = Field(default=None, description="The topics of the document")

class IngestService:
    def __init__(self, retrieval_service: Retrieval, scraping_service: ScrapingService):
        self.retrieval_service = retrieval_service
        self.scraping_service = scraping_service

    def ingest(self, title: str, abstract: str, amount: int):
        query = LogicMillQuery(title=title, abstract=abstract, amount=amount, model="patspecter")
        retrieved_documents = self.retrieval_service.retrieve(query).response
        ingested_documents = []
        for document in retrieved_documents:
            if document.index == "patents":
                true_id = document.document.url.split("?q=")[-1]
                try: 
                    patent_response = self.scraping_service.get_patent(true_id)
                except Exception as e:
                    print(f"Error getting patent: {e}")
                    continue
                institutions = [patent_response.get("meta").get("assigneeCurrent") if patent_response.get("meta").get("assigneeCurrent") else ""]
                ingested_document = IngestedDocument(
                    id=document.id,
                    type="Patent",
                    authors=patent_response.get("authors", []),
                    institutions=institutions,
                    full_text=patent_response.get("fulltext", "")
                )
                ingested_documents.append(ingested_document)
            elif document.index == "publications":
                publication_response = self.scraping_service.get_publication(document.id)
                authors = [author.author.display_name for author in publication_response.authorships]
                institutions = [inst.display_name for author in publication_response.authorships for inst in author.institutions]
                print(institutions)
                print
                ingested_document = IngestedDocument(
                    id=document.id,
                    type="Publication",
                    authors=authors,
                    institutions=institutions,
                    full_text=publication_response.fulltext
                )
                ingested_documents.append(ingested_document)
            else:
                raise ValueError(f"Invalid index: {document.index}")
        return ingested_documents
        