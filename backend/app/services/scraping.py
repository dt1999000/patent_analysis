from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import requests
from app.schemas import Inventor, Publication, Topic, Authorship, AuthorshipInstitution, Concept, Location, PublicationGroup
from dataclasses import dataclass
from typing import List, Dict, Optional, Set
from datetime import datetime
import pyalex
from pyalex import Works, Authors

# Configure PyAlex
pyalex.config.email = "dt1999000@gmail.com"  # Replace with your email for proper attribution


def scrape_espacenet_inventors(url: str) -> List[Inventor]:
    """
    Scrape inventors from Espacenet patent pages
    Example input URL: https://worldwide.espacenet.com/patent/...
    """
    driver = webdriver.Chrome()
    try:
        driver.get(url)
        # Wait for inventors section to load
        wait = WebDriverWait(driver, 10)
        inventors_elements = wait.until(
            EC.presence_of_all_elements_located((By.XPATH, "//div[contains(text(), 'Inventors')]/following-sibling::div"))
        )
        
        inventors = []
        for element in inventors_elements:
            # Parse inventor text like "SAINZ FUERTES GUILLERMO [ES]"
            text = element.text.strip()
            if text:
                name_parts = text.split("[")
                name = name_parts[0].strip()
                country_code = name_parts[1].strip("]") if len(name_parts) > 1 else None
                inventors.append(Inventor(name=name, country_code=country_code))
                
        return inventors
    finally:
        driver.quit()



class AlexScraper:
        
    
    def get_works_by_author(self, author_id: str, max_works: int = 5) -> List[Publication]:
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

    def get_publication(self, work_id: str) -> Publication:
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
            
            authorships.append(Authorship(
                author_position=auth_data.get('author_position', ''),
                author=auth_data['author'],
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
        
        return Publication(
            id=work['id'],
            doi=work['doi'],
            title=work['title'],
            display_name=work['display_name'],
            publication_year=work['publication_year'],
            publication_date=datetime.fromisoformat(work['publication_date']),
            type=work['type'],
            type_crossref=work.get('type_crossref'),
            cited_by_count=work['cited_by_count'],
            is_retracted=work.get('is_retracted', False),
            is_paratext=work.get('is_paratext', False),
            citation_normalized_percentile=work.get('citation_normalized_percentile'),
            primary_topic=topics[0] if topics else None,
            topics=topics,
            authorships=authorships,
            concepts=concepts,
            locations=locations,
            abstract_inverted_index=work.get('abstract_inverted_index'),
            referenced_works=work.get('referenced_works', []),
            related_works=work.get('related_works', []),
            counts_by_year=work.get('counts_by_year', []),
            updated_date=work['updated_date'],
            created_date=work['created_date']
        )

    def group_publications(self, publications: List[Publication], 
                        by: str = 'field',
                        min_concept_score: float = 0.5) -> Dict[str, PublicationGroup]:
        """
        Group publications by different criteria
        
        Args:
            publications (List[Publication]): List of publications to group
            by (str): Grouping criterion: 'field', 'subfield', 'domain', 'author', or 'institution'
            min_concept_score (float): Minimum concept score to consider (for field-based grouping)
        
        Returns:
            Dict[str, PublicationGroup]: Publications grouped by the specified criterion
        """
        groups: Dict[str, List[Publication]] = {}
        
        for pub in publications:
            if by in ['field', 'subfield', 'domain']:
                # Get concepts at the appropriate level
                level = 0 if by == 'domain' else 1 if by == 'field' else 2
                relevant_concepts = [c for c in pub.concepts 
                                if c.level == level and c.score >= min_concept_score]
                
                # A publication can belong to multiple groups
                for concept in relevant_concepts:
                    group_key = concept.display_name
                    if group_key not in groups:
                        groups[group_key] = []
                    groups[group_key].append(pub)
                    
            elif by == 'author':
                # Group by each author
                for author in pub.authors:
                    group_key = f"{author.display_name} ({author.id})"
                    if group_key not in groups:
                        groups[group_key] = []
                    groups[group_key].append(pub)
                    
            elif by == 'institution':
                # Group by each institution
                for inst_id in pub.institutions:
                    if inst_id not in groups:
                        groups[inst_id] = []
                    groups[inst_id].append(pub)
        
        # Convert to PublicationGroup objects with metrics
        return {
            key: PublicationGroup(
                group_key=key,
                publications=pubs,
                total_citations=sum(p.citation_count for p in pubs),
                publication_count=len(pubs)
            )
            for key, pubs in groups.items()
        }

    def get_related_publications(self, work_id: str, limit: int = 10) -> List[Publication]:
        """
        Get publications related to a specific work using PyAlex's native related_works
        
        Args:
            work_id (str): OpenAlex work ID, DOI, or URL
            limit (int): Maximum number of related publications to retrieve
        
        Returns:
            List[Publication]: List of related publications
        """
        # First get the original publication to get the related_works list
        work = Works()[work_id]
        related_ids = work.get('related_works', [])[:limit]
        
        # Fetch the related publications
        related_publications = []
        for related_id in related_ids:
            try:
                pub = self.get_publication(related_id)
                related_publications.append(pub)
            except Exception:
                continue
                
        return related_publications
