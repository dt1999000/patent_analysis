from __future__ import annotations

import re
from html import unescape
from typing import Any, Optional


def _collapse_whitespace(text: str) -> str:
    text = text.replace("\r\n", "\n").replace("\r", "\n")
    text = re.sub(r"\n{3,}", "\n\n", text)
    text = re.sub(r"[\t ]+", " ", text)
    text = "\n".join(line.rstrip() for line in text.splitlines())
    return text.strip()


def _strip_tags(html: str) -> str:
    cleaned = re.sub(r"<\s*(script|style)\b[^>]*>.*?<\s*/\s*\1\s*>", "", html, flags=re.I | re.S)
    cleaned = re.sub(r"<\s*br\s*/?\s*>", "\n", cleaned, flags=re.I)
    cleaned = re.sub(r"<\s*/?\s*(p|div|section|article|li|ul|ol|tr|td|th|h\d)\b[^>]*>", "\n", cleaned, flags=re.I)
    cleaned = re.sub(r"<[^>]+>", "", cleaned)
    cleaned = unescape(cleaned)
    return _collapse_whitespace(cleaned)


def _find_first(pattern: str, text: str, flags: int = 0) -> Optional[str]:
    m = re.search(pattern, text, flags)
    return m.group(1) if m else None


def _find_all(pattern: str, text: str, flags: int = 0) -> list[str]:
    return [m.group(1) for m in re.finditer(pattern, text, flags)]


def _extract_title(html: str) -> Optional[str]:
    article = _find_first(r"<article[^>]*class=\"[^\"]*result[^\"]*\"[^>]*>(.*?)</article>", html, flags=re.I | re.S)
    scope = article or html
    span_title = _find_first(r"<span[^>]*itemprop=\"title\"[^>]*>(.*?)</span>", scope, flags=re.I | re.S)
    if span_title:
        return _strip_tags(span_title)
    doc_title = _find_first(r"<title>(.*?)</title>", html, flags=re.I | re.S)
    if doc_title:
        return _strip_tags(re.sub(r"\s*-\s*Google\s+Patents\s*$", "", doc_title, flags=re.I))
    meta_title = _find_first(r"<meta[^>]*name=\"DC.title\"[^>]*content=\"([^\"]+)\"", html, flags=re.I)
    if meta_title:
        return _strip_tags(meta_title)
    return None


def _extract_pdf_url(html: str) -> Optional[str]:
    url = _find_first(r"<meta[^>]*name=\"citation_pdf_url\"[^>]*content=\"([^\"]+)\"", html, flags=re.I)
    if url:
        return url
    url = _find_first(r"<a[^>]*itemprop=\"pdfLink\"[^>]*href=\"([^\"]+)\"", html, flags=re.I)
    return url


def _extract_section_text(html: str, itemprop_value: str) -> Optional[str]:
    block = _find_first(rf"<section[^>]*itemprop=\"{re.escape(itemprop_value)}\"[^>]*>(.*?)</section>", html, flags=re.I | re.S)
    return _strip_tags(block) if block else None


def _extract_authors(html: str) -> list[str]:
    vals = _find_all(r"<dd[^>]*itemprop=\"inventor\"[^>]*>(.*?)</dd>", html, flags=re.I | re.S)
    return [_strip_tags(v) for v in vals if _strip_tags(v)]


def _extract_canonical_url(html: str) -> Optional[str]:
    return _find_first(r"<link[^>]*rel=\"canonical\"[^>]*href=\"([^\"]+)\"", html, flags=re.I)


def _extract_publication_id(html: str) -> Optional[str]:
    pub_no = _find_first(r"<dd[^>]*itemprop=\"publicationNumber\"[^>]*>(.*?)</dd>", html, flags=re.I | re.S)
    if pub_no:
        return _strip_tags(pub_no)
    canonical = _extract_canonical_url(html) or ""
    m = re.search(r"/patent/([^/]+)/", canonical)
    return m.group(1) if m else None


def _extract_meta(html: str) -> dict[str, Any]:
    meta: dict[str, Any] = {}

    def get_text(pattern: str) -> Optional[str]:
        v = _find_first(pattern, html, flags=re.I | re.S)
        return _strip_tags(v) if v else None

    def get_all_texts(pattern: str) -> list[str]:
        return [_strip_tags(v) for v in _find_all(pattern, html, flags=re.I | re.S) if _strip_tags(v)]

    fields: dict[str, str] = {
        "publicationNumber": r"<dd[^>]*itemprop=\"publicationNumber\"[^>]*>(.*?)</dd>",
        "countryCode": r"<dd[^>]*itemprop=\"countryCode\"[^>]*>(.*?)</dd>",
        "countryName": r"<dd[^>]*itemprop=\"countryName\"[^>]*>(.*?)</dd>",
        "applicationNumber": r"<dd[^>]*itemprop=\"applicationNumber\"[^>]*>(.*?)</dd>",
        "priorityDate": r"<time[^>]*itemprop=\"priorityDate\"[^>]*>(.*?)</time>",
        "filingDate": r"<time[^>]*itemprop=\"filingDate\"[^>]*>(.*?)</time>",
        "publicationDate": r"<time[^>]*itemprop=\"publicationDate\"[^>]*>(.*?)</time>",
        "assigneeCurrent": r"<dd[^>]*itemprop=\"assigneeCurrent\"[^>]*>(.*?)</dd>",
        "assigneeOriginal": r"<dd[^>]*itemprop=\"assigneeOriginal\"[^>]*>(.*?)</dd>",
    }

    for key, pat in fields.items():
        val = get_text(pat)
        if val:
            meta[key] = val

    meta["priorArtKeywords"] = get_all_texts(r"<dd[^>]*itemprop=\"priorArtKeywords\"[^>]*>(.*?)</dd>")

    # External links
    links_blocks = _find_all(r"<li[^>]*itemprop=\"links\"[^>]*>(.*?)</li>", html, flags=re.I | re.S)
    links: list[dict[str, str]] = []
    for lb in links_blocks:
        url = _find_first(r"<a[^>]*href=\"([^\"]+)\"[^>]*>", lb, flags=re.I)
        text = _find_first(r"<span[^>]*itemprop=\"text\"[^>]*>(.*?)</span>", lb, flags=re.I | re.S)
        if url or text:
            links.append({"url": url or "", "text": _strip_tags(text or "")})
    if links:
        meta["links"] = links

    return meta


def parse_google_patent_html(html: str, source_url: Optional[str] = None) -> dict[str, Any]:
    title = _extract_title(html)
    abstract = _extract_section_text(html, "abstract")
    description = _extract_section_text(html, "description")
    claims = _extract_section_text(html, "claims")
    authors = _extract_authors(html)
    pdf_url = _extract_pdf_url(html)
    meta = _extract_meta(html)
    pub_id = _extract_publication_id(html)
    url = source_url or _extract_canonical_url(html)

    fulltext = abstract if abstract else ""
    fulltext += description if description else ""
    fulltext += claims if claims else ""

    return {
        "id": pub_id,
        "url": url,
        "title": title,
        "abstract": abstract,
        "description": description,
        "claims": claims,
        "authors": authors,
        "pdf_url": pdf_url,
        "meta": meta,
        "fulltext": fulltext
    }


