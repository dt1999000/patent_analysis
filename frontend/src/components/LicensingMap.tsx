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

const mockOpportunities: LicensingOpportunity[] = [
  {
    id: "rigetti-computing",
    company: "Rigetti Computing",
    type: "potential-licensee",
    likelihood: "high",
    rationale:
      "Actively developing quantum processors with similar error correction needs. Recent funding indicates expansion into topological approaches.",
    overlap: [
      "quantum error correction",
      "scalable architecture",
      "coherence enhancement",
    ],
    revenue: "$50M-100M potential",
    contact: "licensing@rigetti.com",
  },
  {
    id: "ionq-inc",
    company: "IonQ Inc",
    type: "potential-licensee",
    likelihood: "medium",
    rationale:
      "Leading trapped-ion quantum computing company seeking to diversify quantum modalities. Patent portfolio shows interest in hybrid approaches.",
    overlap: ["quantum gates", "error correction", "scalability"],
    revenue: "$25M-75M potential",
    contact: "partnerships@ionq.com",
  },
  {
    id: "microsoft-azure",
    company: "Microsoft Azure Quantum",
    type: "infringement-risk",
    likelihood: "medium",
    rationale:
      "Extensive topological qubit patent portfolio may create freedom-to-operate concerns. Cross-licensing opportunity exists.",
    overlap: ["Majorana fermions", "topological qubits", "nanowire devices"],
    revenue: "Cross-licensing",
    contact: "quantumlegal@microsoft.com",
  },
  {
    id: "quantum-circuits",
    company: "Quantum Circuits Inc",
    type: "partnership",
    likelihood: "high",
    rationale:
      "Startup focusing on novel quantum architectures. Strong technical team with complementary expertise in materials science.",
    overlap: ["semiconductor nanowires", "quantum devices"],
    revenue: "$10M-25M potential",
    contact: "bd@quantumcircuits.com",
  },
  {
    id: "intel-quantum",
    company: "Intel Quantum",
    type: "potential-licensee",
    likelihood: "high",
    rationale:
      "Major semiconductor manufacturer with quantum computing division. Strong interest in silicon-compatible quantum technologies.",
    overlap: [
      "semiconductor fabrication",
      "quantum devices",
      "scalable manufacturing",
    ],
    revenue: "$100M+ potential",
    contact: "quantum-licensing@intel.com",
  },
];

export const LicensingMap = () => {
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
            <div className="text-3xl font-bold text-primary mb-2">5</div>
            <div className="text-sm text-muted-foreground">
              Total Opportunities
            </div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-success mb-2">3</div>
            <div className="text-sm text-muted-foreground">High Likelihood</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-warning mb-2">$185M+</div>
            <div className="text-sm text-muted-foreground">
              Revenue Potential
            </div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-secondary mb-2">12</div>
            <div className="text-sm text-muted-foreground">Patent Overlaps</div>
          </div>
        </div>
      </Card>

      {/* Opportunity Cards */}
      <div className="space-y-4">
        {mockOpportunities.map((opportunity) => {
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
                Prioritize Intel & Rigetti
              </h4>
              <p className="text-sm text-muted-foreground">
                Highest revenue potential with strong technical alignment and
                immediate market need.
              </p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <div className="w-2 h-2 bg-warning rounded-full mt-2" />
            <div>
              <h4 className="font-medium text-foreground">
                Address Microsoft Risk
              </h4>
              <p className="text-sm text-muted-foreground">
                Proactive patent analysis and potential cross-licensing
                discussions recommended.
              </p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <div className="w-2 h-2 bg-success rounded-full mt-2" />
            <div>
              <h4 className="font-medium text-foreground">
                Explore Partnership Models
              </h4>
              <p className="text-sm text-muted-foreground">
                Joint development with Quantum Circuits could accelerate
                commercialization.
              </p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};
