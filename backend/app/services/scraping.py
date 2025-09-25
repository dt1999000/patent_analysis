from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import requests
from typing import List, Dict, Optional
from dataclasses import dataclass

@dataclass
class Inventor:
    name: str
    country_code: Optional[str] = None
    openalex_id: Optional[str] = None

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

def get_openalex_inventor(author_id: str) -> Optional[Inventor]:
    """
    Get inventor information from OpenAlex API
    Example input: 'A1234567' or full URL 'https://openalex.org/A1234567'
    """
    # Extract ID if full URL is provided
    if author_id.startswith('https://'):
        author_id = author_id.split('/')[-1]
    
    # Ensure ID starts with 'A' for author
    if not author_id.startswith(('A', 'a')):
        author_id = f'A{author_id}'
    
    url = f'https://api.openalex.org/authors/{author_id}'
    response = requests.get(url)
    
    if response.status_code == 200:
        data = response.json()
        # Get name and any available country code from last known institution
        name = data.get('display_name', '')
        country_code = None
        if 'last_known_institution' in data and data['last_known_institution']:
            country_code = data['last_known_institution'].get('country_code')
        
        return Inventor(
            name=name,
            country_code=country_code,
            openalex_id=data.get('id')
        )
    elif response.status_code == 404:
        return None
    else:
        response.raise_for_status()

def get_multiple_openalex_inventors(author_ids: List[str]) -> List[Inventor]:
    """
    Get multiple inventors from OpenAlex API using bulk request
    Example input: ['A1234567', 'A7654321']
    """
    # Format IDs for API query
    formatted_ids = ','.join(f'"{id}"' if id.startswith('A') else f'"A{id}"' for id in author_ids)
    url = f'https://api.openalex.org/authors?filter=openalex_id:{formatted_ids}'
    
    response = requests.get(url)
    response.raise_for_status()
    
    inventors = []
    data = response.json()
    
    for result in data.get('results', []):
        name = result.get('display_name', '')
        country_code = None
        if 'last_known_institution' in result and result['last_known_institution']:
            country_code = result['last_known_institution'].get('country_code')
            
        inventors.append(Inventor(
            name=name,
            country_code=country_code,
            openalex_id=result.get('id')
        ))
    
    return inventors

# Example usage:
if __name__ == "__main__":
    # Example for Espacenet
    espacenet_url = "https://worldwide.espacenet.com/patent/EP3898084A1"
    espacenet_inventors = scrape_espacenet_inventors(espacenet_url)
    print("Espacenet inventors:", espacenet_inventors)
    
    # Example for OpenAlex (single inventor)
    openalex_inventor = get_openalex_inventor("A1969205032")
    print("OpenAlex inventor:", openalex_inventor)
    
    # Example for OpenAlex (multiple inventors)
    inventor_ids = ["A1969205032", "A2208157095"]
    openalex_inventors = get_multiple_openalex_inventors(inventor_ids)
    print("Multiple OpenAlex inventors:", openalex_inventors)