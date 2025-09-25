from abc import ABC, abstractmethod
from app.schemas import LogicMillDocument, LogicMillRetrievedDocument, LogicMillRetrievedResponse, LogicMillQuery
from app.core.config import settings
import json
from urllib3.util import Retry
from requests import Session
from requests.adapters import HTTPAdapter

# Abstract class for retrieval
class Retrieval(ABC):
    @abstractmethod
    def retrieve(self, query: LogicMillQuery) -> LogicMillRetrievedResponse | None:
        pass


class BaseRetrieval(Retrieval):
    def retrieve(self, query: LogicMillQuery) -> LogicMillRetrievedResponse | None:
        # Establish session for robust connection
        s = Session()
        retries = Retry(total=5, backoff_factor=0.1,
                        status_forcelist=[500, 501, 502, 503, 504, 524])
        s.mount('https://', HTTPAdapter(max_retries=retries))
        # Get settings from config
        LOGIC_MILL_URL = settings.LOGIC_MILL_URL
        LOGIC_MILL_TOKEN = settings.LOGIC_MILL_TOKEN

        headers = {
        'content-type': 'application/json',
        'Authorization': 'Bearer '+ LOGIC_MILL_TOKEN,
        }

        # Build GraphQL query
        graphql_query="""
            query embedDocumentAndSimilaritySearch($data: [EncodeDocumentPart], $indices: [String], $amount: Int, $model: String!) {
            encodeDocumentAndSimilaritySearch(
                data: $data
                indices: $indices
                amount: $amount
                model: $model
            ) {
                id
                score
                index
                document {
                title
                url
                PatspecterEmbedding
                }
            }
            }
        """

        # Build variables
        variables = {
            "model": query.model,
            "data": [
                {
                "key": "title",
                "value": query.title
                },
                {
                "key": "abstract",
                "value": query.abstract
                }
            ],
            "amount": query.amount,
            "indices": [
                "patents",
                "publications"
            ]
        }

                # Send request
        r = s.post(LOGIC_MILL_URL, headers=headers, json={'query': graphql_query , 'variables': variables})

        # Handle response
        if r.status_code != 200:
            print(f"Error executing\n{graphql_query}\non {LOGIC_MILL_URL}")
            return None
        else:
            response = r.json()
            raw_documents = response["data"]["encodeDocumentAndSimilaritySearch"]
            
            # Parse the response into the proper format
            logic_mill_retrieved_documents = []
            for item in raw_documents:
                # Create LogicMillDocument from the document data
                document = LogicMillDocument(
                    PatspecterEmbedding=item["document"]["PatspecterEmbedding"],
                    title=item["document"]["title"],
                    url=item["document"]["url"]
                )
                
                # Create LogicMillRetrievedDocument with all fields
                retrieved_document = LogicMillRetrievedDocument(
                    id=item["id"],
                    score=item["score"],
                    index=item["index"],
                    document=document
                )
                
                logic_mill_retrieved_documents.append(retrieved_document)
            
            # Return the properly formatted response
            return LogicMillRetrievedResponse(response=logic_mill_retrieved_documents)