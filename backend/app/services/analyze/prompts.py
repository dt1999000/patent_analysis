from typing import List
from app.services.ingest import IngestedDocument

def get_analyze_topic_prompt(text: str) -> str:
    return f"""
    You are a helpful assistant that analyzes the scientific topics of the following research paper:
    {text}
    Remember to return the topic in English language, independent of the language of the text.
    """

def get_topic_refinement_prompt(documents: List[IngestedDocument]) -> str:
    return f"""
    You are a helpful assistant that refines the topic of scientific documents.
    In the given list, each element contains the list of topics of one document. Look at all the topics of all the documents, harmonize
    them into a list of topics that are common to all the documents. Make sure the topics are semantically meaningful, mutually exclusive, and consistent. 
    Note that one document can contain multiple topics, and one topic can be present in multiple documents. The same applies for subtopics.
    The goal is to have multiple documents sharing the same topic, tune and find the appropriate fine grained/coarse grained topics and assign these to the existing documents.
    {documents}

    The list of topics should be returned in the following format:
    class SlimTopicDocument(BaseModel):
            id: str
            topics: List[Topic]

        class SlimTopicDocumentList(BaseModel):
            documents: List[SlimTopicDocument]
    return the list of topics in the SlimTopicDocumentList
    """

def get_author_refinement_prompt(documents: List[IngestedDocument]) -> str:
    return f"""
    You are a helpful assistant that refines the author of scientific documents.
    In the given list, each document has a list of authors. Look at all the authors of all the documents, normalize
    the names since different names can refer to the same person. Return the list of authors with the normalized names.
    {documents}

    The list of authors should be returned in the following format:
    class SlimAuthorDocument(BaseModel):
            id: str
            authors: List[str]

    class SlimAuthorDocumentList(BaseModel):
        documents: List[SlimAuthorDocument]
    return the list of authors in the SlimAuthorDocumentList
    """

def get_institution_refinement_prompt(documents: List[IngestedDocument]) -> str:
    return f"""
    You are a helpful assistant that refines the institution of scientific documents.
    In the given list, each document has a list of institutions. Look at all the institutions of all the documents, normalize
    the names since different names can refer to the same institution. Return the list of institutions with the normalized names.
    {documents}

    The list of institutions should be returned in the following format:
    class SlimInstitutionDocument(BaseModel):
            id: str
            institutions: List[str]

    class SlimInstitutionDocumentList(BaseModel):
        documents: List[SlimInstitutionDocument]
    return the list of institutions in the SlimInstitutionDocumentList
    """

def get_find_relevant_assignees_prompt(text: str, assignees: List[str]) -> str:
    return f"""
    You are a helpful assistant that finds the most relevant assignees of a scientific paper based on the original list of assignees.
    {text}
    List of potential relevant assignees: {assignees}
    """

def get_find_relevant_industries_prompt(text: str, assignees: List[str]) -> str:
    return f"""
    You are a helpful assistant that finds the relevant industries of a scientific paper from a list of assignees.
    {text}
    List of potential relevant industries: {assignees}
    """

def get_estimate_impact_prompt(text: str, industries: List[str]) -> str:
    return f"""
    You are a helpful assistant that estimates the impact of a scientific paper from a list of industries.
    {text}
    List of potential relevant industries: {industries}
    Only return the estimated impact in monetary terms (market_segment) and the reasoning (impact_reasoning).
    """