from datetime import datetime
from typing import List, Dict, Optional
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

class Topic(BaseModel):
    id: str
    display_name: str
    score: float
    subfield: Dict[str, str]
    field: Dict[str, str]
    domain: Dict[str, str]

class AuthorshipInstitution(BaseModel):
    id: str
    display_name: str
    type: Optional[str] = None
    country_code: Optional[str] = None

class Author(BaseModel):
    id: str
    display_name: str
    orcid: Optional[str] = None

class Authorship(BaseModel):
    author_position: str
    author: Author
    institutions: List[AuthorshipInstitution]
    is_corresponding: bool = False

class Concept(BaseModel):
    id: str
    wikidata: Optional[str]
    display_name: str
    level: int
    score: float

class Location(BaseModel):
    is_oa: bool
    landing_page_url: Optional[str]
    pdf_url: Optional[str]
    source: Optional[Dict]
    license: Optional[str]
    version: Optional[str]
    is_accepted: bool
    is_published: bool

class PublicationContentBreakdown(BaseModel):
    id: str
    authorship: List[Authorship]
    problem_statement: Optional[str]
    methods: Optional[str]
    conclusions: Optional[str]

class PublicationBase(BaseModel):
    id: str
    title: str
    abstract: Optional[str]

class PublicationFull(PublicationBase):
    cited_by_count: int
    is_retracted: bool
    is_paratext: bool
    citation_normalized_percentile: Optional[Dict]
    primary_topic: Optional[Topic]
    topics: List[Topic]
    authorships: List[Authorship]
    concepts: List[Concept]
    referenced_works: List[str]
    related_works: List[str]
    counts_by_year: List[Dict]

class PublicationGroup(BaseModel):
    group_key: str
    publications: List[PublicationFull]
    total_citations: int
    publication_count: int



class Patent(BaseModel):
    id: str | None
    url: str | None
    title: str | None
    abstract: str | None
    description: str | None
    claims: str | None
    authors: list[str]
    pdf_url: str | None
    meta: dict