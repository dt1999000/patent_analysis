from __future__ import annotations

from typing import Any, Optional, List, Dict, Optional, Set
from datetime import datetime
import requests
from dataclasses import dataclass
from app.services.patent_scraping import parse_google_patent_html
import pyalex
from pyalex import Authors, Works
from app.schemas import PublicationBase, PublicationFull, Topic, Authorship, AuthorshipInstitution, Concept, Location, PublicationGroup, Author
from typing import List

# Configure PyAlex
pyalex.config.email = "dt1999000@gmail.com"  # Replace with your email for proper attribution

class ScrapingService:
    def __init__(self, timeout: int = 30) -> None:
        self.timeout = timeout

    def _fetch_html(self, url: str) -> str:
        headers = {
            "user-agent": (
                "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
                "AppleWebKit/537.36 (KHTML, like Gecko) "
                "Chrome/127.0.0.0 Safari/537.36"
            )
        }
        r = requests.get(url, headers=headers, timeout=self.timeout)
        r.raise_for_status()
        return r.text

    def _build_patent_url(self, patent_id: str) -> str:
        return f"https://patents.google.com/patent/{patent_id}"

    def get_patent(self, patent_id: str) -> dict[str, Any]:
        url = self._build_patent_url(patent_id)
        html = self._fetch_html(url)
        data = parse_google_patent_html(html, source_url=url)
        return data

    def get_publication(self, work_id: str) -> PublicationBase:
        """
        Get detailed information about a single publication from OpenAlex API using PyAlex
        
        Args:
            work_id (str): OpenAlex work ID, DOI, or URL
        
        Returns:
            Publication: Structured publication information
        """
        work = Works()[work_id]
        
        # Process topics
        topics = []
        for topic_data in work['topics']:
            topics.append(Topic(
                id=topic_data['id'],
                display_name=topic_data['display_name'],
                score=topic_data['score'],
                subfield=topic_data['subfield'],
                field=topic_data['field'],
                domain=topic_data['domain']
            ))
        
        # Process authorships
        authorships = []
        for auth_data in work['authorships']:
            institutions = [
                AuthorshipInstitution(
                    id=inst.get('id', ''),
                    display_name=inst.get('display_name', ''),
                    type=inst.get('type'),
                    country_code=inst.get('country_code')
                )
                for inst in auth_data.get('institutions', [])
            ]
            
            author_data = auth_data.get('author', {})
            author = Author(
                id=author_data.get('id', ''),
                display_name=author_data.get('display_name', ''),
                orcid=author_data.get('orcid')
            )
            
            authorships.append(Authorship(
                author_position=auth_data.get('author_position', ''),
                author=author,
                institutions=institutions,
                is_corresponding=auth_data.get('is_corresponding', False)
            ))
        
        # Process concepts
        concepts = [
            Concept(
                id=c['id'],
                wikidata=c.get('wikidata'),
                display_name=c['display_name'],
                level=c['level'],
                score=c['score']
            )
            for c in work['concepts']
        ]
        
        # Process locations
        locations = [
            Location(
                is_oa=loc.get('is_oa', False),
                landing_page_url=loc.get('landing_page_url'),
                pdf_url=loc.get('pdf_url'),
                source=loc.get('source'),
                license=loc.get('license'),
                version=loc.get('version'),
                is_accepted=loc.get('is_accepted', False),
                is_published=loc.get('is_published', False)
            )
            for loc in work['locations']
        ]
        
        return PublicationFull(
            id=work['id'],
            title=work['title'],
            abstract=work['abstract'] if work['abstract'] else None,
            cited_by_count=work['cited_by_count'],
            is_retracted=work.get('is_retracted', False),
            is_paratext=work.get('is_paratext', False),
            citation_normalized_percentile=work.get('citation_normalized_percentile'),
            primary_topic=topics[0] if topics else None,
            topics=topics,
            authorships=authorships,
            concepts=concepts,
            referenced_works=work.get('referenced_works', []),
            related_works=work.get('related_works', []),
            counts_by_year=work.get('counts_by_year', [])
        )

    def get_works_by_author(self, author_id: str, max_works: int = 5) -> List[PublicationBase]:
        """
        Get works by a specific author using PyAlex
        
        Args:
            author_id (str): OpenAlex author ID, e.g., 'A1969205032'
            max_works (int): Maximum number of works to retrieve
        
        Returns:
            List[Publication]: List of structured publication information
        """
        author = Authors()[author_id]
        works = author.works[:max_works]
        
        publications = []
        for work in works:
            pub = self.get_publication(work.id)
            publications.append(pub)
            
        return publications


