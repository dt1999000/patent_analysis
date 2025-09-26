import { useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Building2,
  TrendingUp,
  AlertTriangle,
  ExternalLink,
  Mail,
} from "lucide-react";
import { mockDocuments } from "@/components/Graph/mockDocs";

interface LicensingOpportunity {
  id: string;
  company: string;
  type: "potential-licensee" | "infringement-risk" | "partnership";
  likelihood: "high" | "medium" | "low";
  rationale: string;
  overlap: string[];
  revenue: string;
  contact?: string;
}

// Base licensing opportunities derived from mock data institutions
const getBaseOpportunities = (): LicensingOpportunity[] => {
  const institutionCounts = new Map<string, number>();
  const institutionTopics = new Map<string, Set<string>>();
  
  // Analyze mock documents to understand institutional presence and topics
  for (const doc of mockDocuments) {
    for (const inst of doc.institutions) {
      if (!inst) continue;
      institutionCounts.set(inst, (institutionCounts.get(inst) || 0) + 1);
      
      if (!institutionTopics.has(inst)) {
        institutionTopics.set(inst, new Set());
      }
      
      for (const topic of doc.topics || []) {
        institutionTopics.get(inst)?.add(topic.topic);
        for (const subtopic of topic.subtopics || []) {
          institutionTopics.get(inst)?.add(subtopic);
        }
      }
    }
  }

  const opportunities: LicensingOpportunity[] = [];

  // Microsoft Research - high activity in mock data, potential infringement risk
  if (institutionCounts.has("Microsoft Research")) {
    opportunities.push({
      id: "microsoft-research",
      company: "Microsoft Research",
      type: "infringement-risk",
      likelihood: "medium",
      rationale:
        "Extensive presence in topological quantum computing research with multiple patents. Strong overlap in Majorana fermions and cryogenic control.",
      overlap: Array.from(institutionTopics.get("Microsoft Research") || []),
      revenue: "Cross-licensing potential",
      contact: "quantumlegal@microsoft.com",
    });
  }

  // IBM Quantum - frequent collaborator, licensing opportunity
  if (institutionCounts.has("IBM Quantum")) {
    opportunities.push({
      id: "ibm-quantum",
      company: "IBM Quantum",
      type: "potential-licensee",
      likelihood: "high",
      rationale:
        "Active in quantum error correction and hardware development. Multiple collaborative works indicate strategic interest in our technologies.",
      overlap: Array.from(institutionTopics.get("IBM Quantum") || []),
      revenue: "$75M-150M potential",
      contact: "quantum-partnerships@ibm.com",
    });
  }

  // Stanford University - academic partnership
  if (institutionCounts.has("Stanford University")) {
    opportunities.push({
      id: "stanford-university",
      company: "Stanford University",
      type: "partnership",
      likelihood: "high",
      rationale:
        "Leading academic institution with strong quantum information research. Potential for joint R&D and technology transfer.",
      overlap: Array.from(institutionTopics.get("Stanford University") || []),
      revenue: "$5M-15M potential",
      contact: "otl@stanford.edu",
    });
  }

  // Add external opportunities based on technology overlap
  opportunities.push(
    {
      id: "rigetti-computing",
      company: "Rigetti Computing",
      type: "potential-licensee",
      likelihood: "high",
      rationale:
        "Quantum processor company with interest in error correction and scalable architectures. Strong alignment with our topological approach.",
      overlap: ["quantum error correction", "scalable architectures", "coherence enhancement"],
      revenue: "$50M-100M potential",
      contact: "licensing@rigetti.com",
    },
    {
      id: "intel-labs",
      company: "Intel Labs",
      type: "potential-licensee",
      likelihood: "high",
      rationale:
        "Major semiconductor manufacturer developing quantum technologies. Strong interest in nanowire devices and cryogenic control systems.",
      overlap: ["nanowire devices", "cryogenic control", "quantum hardware"],
      revenue: "$100M+ potential",
      contact: "quantum-licensing@intel.com",
    },
    {
      id: "google-quantum-ai",
      company: "Google Quantum AI",
      type: "partnership",
      likelihood: "medium",
      rationale:
        "Leading quantum computing research with complementary expertise. Potential for joint development in fault-tolerant systems.",
      overlap: ["fault tolerance", "quantum computing", "error correction"],
      revenue: "$25M-75M potential",
      contact: "partnerships@google.com",
    }
  );

  return opportunities;
};

export const LicensingMap = () => {
  // Generate opportunities from mock data
  const opportunities = useMemo(() => getBaseOpportunities(), []);
  
  // Calculate statistics from derived opportunities
  const stats = useMemo(() => {
    const totalOpportunities = opportunities.length;
    const highLikelihood = opportunities.filter(o => o.likelihood === "high").length;
    
    // Extract revenue estimates and sum them up
    let totalRevenue = 0;
    for (const opp of opportunities) {
      const revenueMatch = opp.revenue.match(/\$(\d+(?:\.\d+)?)M/);
      if (revenueMatch) {
        totalRevenue += parseFloat(revenueMatch[1]);
      } else if (opp.revenue.includes("100M+")) {
        totalRevenue += 100;
      }
    }
    
    // Count unique technology overlaps
    const allOverlaps = new Set<string>();
    opportunities.forEach(opp => opp.overlap.forEach(tech => allOverlaps.add(tech)));
    
    return {
      totalOpportunities,
      highLikelihood,
      totalRevenue: `$${totalRevenue}M+`,
      patentOverlaps: allOverlaps.size,
    };
  }, [opportunities]);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "potential-licensee":
        return TrendingUp;
      case "infringement-risk":
        return AlertTriangle;
      case "partnership":
        return Building2;
      default:
        return Building2;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "potential-licensee":
        return "default";
      case "infringement-risk":
        return "destructive";
      case "partnership":
        return "secondary";
      default:
        return "secondary";
    }
  };

  const getLikelihoodColor = (likelihood: string) => {
    switch (likelihood) {
      case "high":
        return "default";
      case "medium":
        return "secondary";
      case "low":
        return "outline";
      default:
        return "outline";
    }
  };

  return (
    <div className="space-y-6">
      {/* Overview */}
      <Card className="research-card p-6">
        <h2 className="text-xl font-semibold text-foreground mb-6">
          Licensing Opportunities
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-primary mb-2">{stats.totalOpportunities}</div>
            <div className="text-sm text-muted-foreground">
              Total Opportunities
            </div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-success mb-2">{stats.highLikelihood}</div>
            <div className="text-sm text-muted-foreground">High Likelihood</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-warning mb-2">{stats.totalRevenue}</div>
            <div className="text-sm text-muted-foreground">
              Revenue Potential
            </div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-secondary mb-2">{stats.patentOverlaps}</div>
            <div className="text-sm text-muted-foreground">Patent Overlaps</div>
          </div>
        </div>
      </Card>

      {/* Opportunity Cards */}
      <div className="space-y-4">
        {opportunities.map((opportunity) => {
          const IconComponent = getTypeIcon(opportunity.type);

          return (
            <Card key={opportunity.id} className="research-card p-6 hover-lift">
              <div className="flex items-start space-x-4">
                <div
                  className={`w-12 h-12 rounded-lg bg-${getTypeColor(opportunity.type)}-muted flex items-center justify-center`}
                >
                  <IconComponent
                    className={`w-6 h-6 text-${getTypeColor(opportunity.type)}`}
                  />
                </div>

                <div className="flex-1 space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-foreground text-lg">
                        {opportunity.company}
                      </h3>
                      <div className="flex items-center space-x-2 mt-2">
                        <Badge variant={getTypeColor(opportunity.type) as any}>
                          {opportunity.type.replace("-", " ")}
                        </Badge>
                        <Badge
                          variant={
                            getLikelihoodColor(opportunity.likelihood) as any
                          }
                        >
                          {opportunity.likelihood} likelihood
                        </Badge>
                      </div>
                    </div>

                    <div className="text-right space-y-1">
                      <div className="text-lg font-semibold text-foreground">
                        {opportunity.revenue}
                      </div>
                      {opportunity.contact && (
                        <Button size="sm" variant="outline">
                          <Mail className="w-4 h-4 mr-1" />
                          Contact
                        </Button>
                      )}
                    </div>
                  </div>

                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {opportunity.rationale}
                  </p>

                  <div className="space-y-2">
                    <h4 className="font-medium text-foreground text-sm">
                      Patent/Technology Overlap:
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {opportunity.overlap.map((item, index) => (
                        <Badge
                          key={index}
                          variant="outline"
                          className="text-xs"
                        >
                          {item}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-border">
                    <div className="flex items-center space-x-2">
                      <Button size="sm" variant="outline">
                        <ExternalLink className="w-4 h-4 mr-1" />
                        View Profile
                      </Button>
                      <Button size="sm" variant="ghost">
                        Add to Brief
                      </Button>
                    </div>

                    {opportunity.contact && (
                      <span className="text-xs text-muted-foreground">
                        {opportunity.contact}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Strategic Recommendations */}
      <Card className="research-card p-6">
        <h3 className="font-semibold text-foreground mb-4">
          Strategic Recommendations
        </h3>
        <div className="space-y-4">
          <div className="flex items-start space-x-3">
            <div className="w-2 h-2 bg-primary rounded-full mt-2" />
            <div>
              <h4 className="font-medium text-foreground">
                Prioritize Intel & IBM
              </h4>
              <p className="text-sm text-muted-foreground">
                Highest revenue potential with strong technical alignment based on collaborative research patterns.
              </p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <div className="w-2 h-2 bg-warning rounded-full mt-2" />
            <div>
              <h4 className="font-medium text-foreground">
                Address Microsoft Overlap
              </h4>
              <p className="text-sm text-muted-foreground">
                Significant research overlap detected. Proactive patent analysis and cross-licensing discussions recommended.
              </p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <div className="w-2 h-2 bg-success rounded-full mt-2" />
            <div>
              <h4 className="font-medium text-foreground">
                Leverage Academic Partnerships
              </h4>
              <p className="text-sm text-muted-foreground">
                Strong collaboration history with Stanford suggests joint development opportunities.
              </p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};
