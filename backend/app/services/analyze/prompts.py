from typing import List
from app.services.ingest import IngestedDocument

def get_analyze_topic_prompt(text: str) -> str:
    return f"""
    You are a helpful assistant that analyzes the topic of the following text:
    {text}
    """

def get_topic_refinement_prompt(documents: List[IngestedDocument]) -> str:
    return f"""
    You are a helpful assistant that refines the topic of scientific documents.
    In the given list, each document has a list of topics. Look at all the topics of all the documents, harmonize
    them into a list of topics that are common to all the documents. Make sure the topics are semantically meaningful, mutually exclusive, and consistent.
    {documents}
    """

def get_author_refinement_prompt(documents: List[IngestedDocument]) -> str:
    return f"""
    You are a helpful assistant that refines the author of scientific documents.
    In the given list, each document has a list of authors. Look at all the authors of all the documents, normalize
    the names since different names can refer to the same person. Return the list of authors with the normalized names.
    {documents}
    """

def get_institution_refinement_prompt(documents: List[IngestedDocument]) -> str:
    return f"""
    You are a helpful assistant that refines the institution of scientific documents.
    In the given list, each document has a list of institutions. Look at all the institutions of all the documents, normalize
    the names since different names can refer to the same institution. Return the list of institutions with the normalized names.
    {documents}
    """