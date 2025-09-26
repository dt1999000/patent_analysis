import { useEffect, useMemo, useRef, useState } from "react"
import * as d3 from "d3"
import { Box } from "@chakra-ui/react"

type Topic = { topic: string; subtopics: string[] }
type Document = {
  id: string
  type: string
  authors: string[]
  institutions: string[]
  full_text: string
  topics?: Topic[]
}

type GraphNode = {
  id: string
  type: string
  label: string
  cluster?: number
  degree?: number
  betweenness?: number
}

type GraphEdge = {
  source: string
  target: string
  relation: string
  weight: number
}

type GraphMetrics = {
  active_players: number
  total_collaborations: number
  research_clusters: number
}

type GraphAnalysisResult = {
  nodes: GraphNode[]
  edges: GraphEdge[]
  clusters: number
  key_players: any[]
  metrics: GraphMetrics
}

type Props = {
  width?: number
  height?: number
  documents: Document[]
  apiBase?: string
}

export default function ForceGraph({ width = 980, height = 600, documents, apiBase = "http://localhost:8000/api/v1" }: Props) {
  const ref = useRef<SVGSVGElement | null>(null)
  const [graph, setGraph] = useState<GraphAnalysisResult | null>(null)
  // Use plain colors to avoid Chakra hook typing mismatches in some envs
  const text = "#0f172a"

  useEffect(() => {
    let cancelled = false
    async function run() {
      try {
        const resp = await fetch(`${apiBase}/analyze/network`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(documents),
        })
        if (!resp.ok) throw new Error(`HTTP ${resp.status}`)
        const data: GraphAnalysisResult = await resp.json()
        if (!cancelled) setGraph(data)
      } catch (_e) {
        // If backend is not available, keep empty to avoid crash; user can retry.
      }
    }
    run()
    return () => {
      cancelled = true
    }
  }, [apiBase, documents])

  const color = useMemo(
    () =>
      d3
        .scaleOrdinal<string, string>()
        .domain(["author", "institution", "document", "keyword"]) 
        .range(["#2563eb", "#16a34a", "#9333ea", "#f59e0b"]),
    []
  )

  useEffect(() => {
    if (!graph || !ref.current) return
    const svg = d3.select(ref.current)
    svg.selectAll("*").remove()

    svg.attr("viewBox", [0, 0, width, height].join(" "))

    type NodeDatum = GraphNode & d3.SimulationNodeDatum
    type LinkDatum = GraphEdge & d3.SimulationLinkDatum<NodeDatum>

    const nodes: NodeDatum[] = graph.nodes.map(d => ({ ...d }))
    const links: LinkDatum[] = graph.edges.map(d => ({ ...d }))

    const simulation = d3
      .forceSimulation<NodeDatum>(nodes)
      .force(
        "link",
        d3
          .forceLink<NodeDatum, LinkDatum>(links)
          .id((d: NodeDatum) => d.id)
          .distance((d: LinkDatum) => 50 + (d.weight ?? 1) * 2)
      )
      .force("charge", d3.forceManyBody().strength(-120))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collide", d3.forceCollide(20))

    const link = svg
      .append("g")
      .attr("stroke", "#94a3b8")
      .attr("stroke-opacity", 0.6)
      .selectAll("line")
      .data(links)
      .join("line")
      .attr("stroke-width", (d: LinkDatum) => Math.max(1, Math.sqrt((d.weight || 1) as number)))

    const node = svg
      .append("g")
      .selectAll<SVGCircleElement, NodeDatum>("circle")
      .data(nodes)
      .join("circle")
      .attr("r", (d: NodeDatum) => 6 + Math.min(10, ((d.degree || 0) as number) * 20))
      .attr("fill", (d: NodeDatum) => color((d.type as string) || "document"))
      .call(
        d3
          .drag<SVGCircleElement, NodeDatum>()
        .on("start", (event: d3.D3DragEvent<SVGCircleElement, NodeDatum, NodeDatum | undefined>, d: NodeDatum) => {
          if (!event.active) simulation.alphaTarget(0.3).restart()
          d.fx = d.x; d.fy = d.y
        })
        .on("drag", (event: d3.D3DragEvent<SVGCircleElement, NodeDatum, NodeDatum | undefined>, d: NodeDatum) => { d.fx = event.x; d.fy = event.y })
        .on("end", (event: d3.D3DragEvent<SVGCircleElement, NodeDatum, NodeDatum | undefined>, d: NodeDatum) => { if (!event.active) simulation.alphaTarget(0); (d as any).fx = null; (d as any).fy = null })
      )

    const labels = svg
      .append("g")
      .selectAll<SVGTextElement, NodeDatum>("text")
      .data(nodes)
      .join("text")
      .text((d: NodeDatum) => (d.label as string))
      .attr("font-size", 11)
      .attr("fill", text)
      .attr("pointer-events", "none")

    simulation.on("tick", () => {
      link
        .attr("x1", (d: LinkDatum) => (d.source as any).x)
        .attr("y1", (d: LinkDatum) => (d.source as any).y)
        .attr("x2", (d: LinkDatum) => (d.target as any).x)
        .attr("y2", (d: LinkDatum) => (d.target as any).y)

      node
        .attr("cx", (d: NodeDatum) => (d.x as number))
        .attr("cy", (d: NodeDatum) => (d.y as number))

      labels
        .attr("x", (d: NodeDatum) => (d.x as number) + 8)
        .attr("y", (d: NodeDatum) => (d.y as number) + 4)
    })

    return () => { simulation.stop() }
  }, [graph, color, text, width, height])

  return (
    <Box borderRadius="lg" borderWidth="1px" overflow="hidden">
      <svg ref={ref} width="100%" height={height} />
    </Box>
  )
}


