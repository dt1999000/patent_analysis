from abc import ABC, abstractmethod
from collections import defaultdict
from typing import Dict, List, Optional, Set, Tuple

import networkx as nx
from app.services.llm import LLMService
from app.services.analyze.prompts import get_analyze_topic_prompt
from pydantic import BaseModel, Field
from app.services.analyze.prompts import get_topic_refinement_prompt, get_author_refinement_prompt, get_institution_refinement_prompt
from app.services.ingest import IngestedDocument
class Topic(BaseModel):
    topic: str = Field(description="A topic of the document, describing the one core concept or idea of the document")
    subtopics: List[str] = Field(description="A list of subtopics/child topics of the document, describing the specific aspects or details of the topic")

class DocumentTopics(BaseModel):
    topics: List[Topic] = Field(
        description=
        "A list of topics of the document, describing main ideas or concepts of the document. "
        "The list consists of multiple topics, each having a topic (parent topic) and subtopics (child topics)"
    )



class GraphNode(BaseModel):
    id: str
    type: str
    label: str
    cluster: Optional[int] = None
    degree: Optional[float] = None
    betweenness: Optional[float] = None


class GraphEdge(BaseModel):
    source: str
    target: str
    relation: str
    weight: int = 1


class KeyPlayer(BaseModel):
    name: str
    type: str  # author | institution
    specialization: List[str]
    related_works: int
    collaborations: int
    activity: str  # Low | Medium | High | Very High
    score: float
    summary: str


class GraphMetrics(BaseModel):
    active_players: int
    total_collaborations: int
    research_clusters: int


class GraphAnalysisResult(BaseModel):
    nodes: List[GraphNode]
    edges: List[GraphEdge]
    clusters: int
    key_players: List[KeyPlayer]
    metrics: GraphMetrics

class AnalyzeService(ABC):
    @abstractmethod
    def analyze(self, text: str) -> str:
        pass

    @abstractmethod
    def analyze_topic(self, text: str) -> str:
        pass

    @abstractmethod
    def aggregate_rank_analyze(self, documents: List[IngestedDocument]) -> GraphAnalysisResult:
        pass

class BaseAnalyzeService(AnalyzeService):
    def __init__(self, llm_service: LLMService):
        self.llm_service = llm_service

    def analyze_topic(self, text: str) -> str:
        return self.llm_service.structured_complete(get_analyze_topic_prompt(text), DocumentTopics)

    def analyze_topics(self, documents: List[IngestedDocument]) -> List[IngestedDocument]:
        docs = []
        for document in documents:
            analyzed: DocumentTopics = self.analyze_topic(document.full_text)
            # Keep only the list for downstream pydantic models
            document.topics = analyzed.topics
            docs.append(document)
        return docs

    def refine_topics(self, documents: List[IngestedDocument]) -> List[IngestedDocument]:

        # for document in documents:
        #     if not document.topics:
        #         continue
        #     for topic in document.topics:
        #         topic.topic = topic_mapping.get(topic.topic, topic.topic)
        #         topic.subtopics = [subtopic_mapping.get(s, s) for s in topic.subtopics]
        # return documents

        documents = self.analyze_topics(documents)

        class SlimTopicDocument(BaseModel):
            id: str
            topics: List[Topic]

        class SlimTopicDocumentList(BaseModel):
            documents: List[SlimTopicDocument]

        payload = SlimTopicDocumentList(
            documents=[SlimTopicDocument(id=document.id, topics=document.topics) for document in documents]
        )

        topic_refinement_prompt = get_topic_refinement_prompt(payload.documents)
        refined: SlimTopicDocumentList = self.llm_service.structured_complete(
            topic_refinement_prompt, SlimTopicDocumentList
        )
        # Build lookup to update original list by id
        id_to_index = {doc.id: idx for idx, doc in enumerate(documents)}
        for doc in refined.documents:
            if doc.id in id_to_index:
                documents[id_to_index[doc.id]].topics = list(doc.topics)
        return documents

    def refine_authors(self, documents: List[IngestedDocument]) -> List[IngestedDocument]:
        class SlimAuthorDocument(BaseModel):
            id: str
            authors: List[str]

        class SlimAuthorDocumentList(BaseModel):
            documents: List[SlimAuthorDocument]

        payload = SlimAuthorDocumentList(
            documents=[SlimAuthorDocument(id=document.id, authors=document.authors) for document in documents]
        )
        author_refinement_prompt = get_author_refinement_prompt(payload.documents)
        try:
            refined: SlimAuthorDocumentList = self.llm_service.structured_complete(
                author_refinement_prompt, SlimAuthorDocumentList
            )
        except Exception as e:
            print(f"Error refining authors: {e}")
            return documents
        id_to_index = {doc.id: idx for idx, doc in enumerate(documents)}
        for doc in refined.documents:
            if doc.id in id_to_index:
                documents[id_to_index[doc.id]].authors = list(doc.authors)
        return documents

    def refine_institutions(self, documents: List[IngestedDocument]) -> List[IngestedDocument]:
        class SlimInstitutionDocument(BaseModel):
            id: str
            institutions: List[str]

        class SlimInstitutionDocumentList(BaseModel):
            documents: List[SlimInstitutionDocument]

        payload = SlimInstitutionDocumentList(
            documents=[
                SlimInstitutionDocument(id=document.id, institutions=document.institutions)
                for document in documents
            ]
        )
        institution_refinement_prompt = get_institution_refinement_prompt(payload.documents)
        refined: SlimInstitutionDocumentList = self.llm_service.structured_complete(
            institution_refinement_prompt, SlimInstitutionDocumentList
        )
        id_to_index = {doc.id: idx for idx, doc in enumerate(documents)}
        for doc in refined.documents:
            if doc.id in id_to_index:
                documents[id_to_index[doc.id]].institutions = list(doc.institutions)
        return documents

    def refine_documents(self, documents: List[IngestedDocument]) -> List[IngestedDocument]:
        docs = self.refine_topics(documents)
        docs = self.refine_authors(docs)
        docs = self.refine_institutions(docs)
        return docs

    # -----------------------------
    # Graph Construction Utilities
    # -----------------------------
    @staticmethod
    def _node_id(node_type: str, value: str) -> str:
        return f"{node_type}:{value}"

    def _build_graph(self, documents: List[IngestedDocument]) -> Tuple[nx.Graph, Dict[str, Dict[str, int]], Dict[str, Set[str]], Dict[str, Set[str]]]:
        """
        Build an undirected, weighted graph.
        Returns:
            - G: graph
            - stats: per-entity counters (documents, collaborations, keywords)
            - entity_to_keywords: mapping from entity -> set of keywords for specialization
            - entity_roles: mapping from entity -> roles observed (author/inventor/institution)
        """
        G: nx.Graph = nx.Graph()

        # Tracking statistics for ranking
        stats: Dict[str, Dict[str, int]] = defaultdict(lambda: defaultdict(int))
        entity_to_keywords: Dict[str, Set[str]] = defaultdict(set)
        entity_roles: Dict[str, Set[str]] = defaultdict(set)

        for doc in documents:
            doc_node = self._node_id("document", doc.id)
            if not G.has_node(doc_node):
                G.add_node(doc_node, type="document", label=doc.id)

            # Add author-document edges and co-author edges
            author_nodes: List[str] = []
            for author in doc.authors:
                a_node = self._node_id("author", author)
                if not G.has_node(a_node):
                    G.add_node(a_node, type="author", label=author)
                # author wrote document
                self._add_edge(G, a_node, doc_node, relation="WROTE")
                stats[a_node]["related_works"] += 1
                author_nodes.append(a_node)
                # track role depending on document type
                if doc.type.lower() == "patent":
                    entity_roles[a_node].add("inventor")
                else:
                    entity_roles[a_node].add("author")

            # Co-author edges within the same document
            for i in range(len(author_nodes)):
                for j in range(i + 1, len(author_nodes)):
                    self._add_edge(G, author_nodes[i], author_nodes[j], relation="CO_AUTHOR")
                    stats[author_nodes[i]]["collaborations"] += 1
                    stats[author_nodes[j]]["collaborations"] += 1

            # Institution nodes and affiliation edges
            institution_nodes: List[str] = []
            for inst in doc.institutions:
                i_node = self._node_id("institution", inst)
                if not G.has_node(i_node):
                    G.add_node(i_node, type="institution", label=inst)
                institution_nodes.append(i_node)
                entity_roles[i_node].add("institution")
            # Link authors to institutions (simple association per doc)
            for a_node in author_nodes:
                for i_node in institution_nodes:
                    self._add_edge(G, a_node, i_node, relation="AFFILIATED_WITH")
                    stats[i_node]["related_works"] += 1

            # Topics/keywords
            keywords: Set[str] = set()
            if doc.topics:
                for t in doc.topics:
                    keywords.add(t.topic)
                    for s in t.subtopics:
                        keywords.add(s)

            keyword_nodes: List[str] = []
            for kw in keywords:
                k_node = self._node_id("keyword", kw)
                if not G.has_node(k_node):
                    G.add_node(k_node, type="keyword", label=kw)
                keyword_nodes.append(k_node)
                # Connect document to keyword
                self._add_edge(G, doc_node, k_node, relation="CONTAINS_KEYWORD")

            # Track specialization mapping for authors/institutions
            for entity in author_nodes + institution_nodes:
                entity_to_keywords[entity].update(keywords)

        return G, stats, entity_to_keywords, entity_roles

    @staticmethod
    def _add_edge(G: nx.Graph, u: str, v: str, relation: str) -> None:
        if G.has_edge(u, v):
            G[u][v]["weight"] += 1
        else:
            G.add_edge(u, v, weight=1, relation=relation)

    @staticmethod
    def _detect_communities(G: nx.Graph) -> Dict[str, int]:
        # Use greedy modularity communities (built-in, no extra deps)
        if G.number_of_nodes() == 0:
            return {}
        communities = list(nx.algorithms.community.greedy_modularity_communities(G))
        node_to_cluster: Dict[str, int] = {}
        for idx, community in enumerate(communities):
            for node in community:
                node_to_cluster[node] = idx
        return node_to_cluster

    @staticmethod
    def _centrality_scores(G: nx.Graph) -> Tuple[Dict[str, float], Dict[str, float]]:
        if G.number_of_nodes() == 0:
            return {}, {}
        degree_c = nx.degree_centrality(G)
        betweenness_c = nx.betweenness_centrality(G, weight="weight", normalized=True)
        return degree_c, betweenness_c

    @staticmethod
    def _percentile_bins(value: float, values: List[float]) -> str:
        if not values:
            return "Low"
        sorted_vals = sorted(values)
        n = len(sorted_vals)
        # Determine percentile
        rank = sorted_vals.index(value) if value in sorted_vals else 0
        pct = (rank + 1) / n
        if pct >= 0.9:
            return "Very High"
        if pct >= 0.7:
            return "High"
        if pct >= 0.4:
            return "Medium"
        return "Low"

    def aggregate_rank_analyze(self, documents: List[IngestedDocument]) -> GraphAnalysisResult:
        # 1) Build graph
        G, stats, entity_to_keywords, entity_roles = self._build_graph(documents)

        # 2) Community detection
        node_to_cluster = self._detect_communities(G)

        # 3) Centrality
        degree_c, betweenness_c = self._centrality_scores(G)

        # 4) Prepare nodes/edges payload
        nodes: List[GraphNode] = []
        for node_id, data in G.nodes(data=True):
            nodes.append(
                GraphNode(
                    id=node_id,
                    type=str(data.get("type")),
                    label=str(data.get("label")),
                    cluster=node_to_cluster.get(node_id),
                    degree=degree_c.get(node_id),
                    betweenness=betweenness_c.get(node_id),
                )
            )

        edges: List[GraphEdge] = []
        total_collaborations = 0
        for u, v, data in G.edges(data=True):
            relation = str(data.get("relation", ""))
            weight = int(data.get("weight", 1))
            if relation == "CO_AUTHOR":
                total_collaborations += weight
            edges.append(
                GraphEdge(
                    source=u,
                    target=v,
                    relation=relation,
                    weight=weight,
                )
            )

        # 5) Rank key players (authors + institutions)
        def is_player(node_id: str) -> bool:
            return node_id.startswith("author:") or node_id.startswith("institution:")

        player_scores: List[Tuple[str, float]] = []
        for node_id in G.nodes:
            if not is_player(node_id):
                continue
            dc = degree_c.get(node_id, 0.0)
            bc = betweenness_c.get(node_id, 0.0)
            score = 0.6 * dc + 0.4 * bc
            player_scores.append((node_id, score))
        player_scores.sort(key=lambda x: x[1], reverse=True)

        # Activity rating from related works counts
        related_counts = [stats[n]["related_works"] for n, _ in player_scores]

        key_players: List[KeyPlayer] = []
        for node_id, score in player_scores[:50]:  # top 50 to keep payload manageable
            node_data = G.nodes[node_id]
            # choose role: inventor overrides author if present
            observed_roles = entity_roles.get(node_id, set())
            if "inventor" in observed_roles:
                player_type = "inventor"
            elif "author" in observed_roles:
                player_type = "author"
            else:
                player_type = str(node_data.get("type"))
            name = str(node_data.get("label"))
            related_works = int(stats[node_id]["related_works"]) if node_id in stats else 0
            collaborations = int(stats[node_id]["collaborations"]) if node_id in stats else 0
            specialization = sorted(list(entity_to_keywords.get(node_id, set())))[:5]
            activity = self._percentile_bins(related_works, related_counts)
            summary = self._build_player_summary(name, player_type, related_works, collaborations, specialization)
            key_players.append(
                KeyPlayer(
                    name=name,
                    type=player_type,
                    specialization=specialization,
                    related_works=related_works,
                    collaborations=collaborations,
                    activity=activity,
                    score=round(score, 6),
                    summary=summary,
                )
            )

        research_clusters = len(set(node_to_cluster.values())) if node_to_cluster else 0
        active_players = sum(1 for n, d in G.nodes(data=True) if d.get("type") in {"author", "institution"})

        return GraphAnalysisResult(
            nodes=nodes,
            edges=edges,
            clusters=research_clusters,
            key_players=key_players,
            metrics=GraphMetrics(
                active_players=active_players,
                total_collaborations=total_collaborations,
                research_clusters=research_clusters,
            ),
        )

    @staticmethod
    def _build_player_summary(name: str, player_type: str, related_works: int, collaborations: int, specialization: List[str]) -> str:
        spec = ", ".join(specialization) if specialization else "unspecified"
        return (
            f"{name} ({player_type}) shows activity across {related_works} related works "
            f"with {collaborations} collaborations. Specialization: {spec}."
        )


    def analyze(self, text: str) -> str:
        pass

    def assess_novelty(self, text: str, documents: List[IngestedDocument]) -> str:
        # Use the similarity score to assess the novelty of the paper
        pass

    def assess_impact(self, text: str, documents: List[IngestedDocument]) -> str:
        # LLM to search for the impact of the paper on that domain/industry
        # Then findout which products/ideas might be affected by the paper
        pass

    def assess_marketability(self, text: str, documents: List[IngestedDocument]) -> str:
        # Combine novelty, impact to assess the marketability of the paper
        pass
