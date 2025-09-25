import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Sparkles, TrendingUp, AlertTriangle } from "lucide-react";

export const NoveltyGauge = () => {
  const noveltyScore = 78; // High novelty
  const getNoveltyLevel = (score: number) => {
    if (score >= 70) return { level: "High", color: "success", icon: Sparkles };
    if (score >= 40)
      return { level: "Medium", color: "warning", icon: TrendingUp };
    return { level: "Low", color: "destructive", icon: AlertTriangle };
  };

  const novelty = getNoveltyLevel(noveltyScore);
  const IconComponent = novelty.icon;

  return (
    <Card className="research-card-elevated p-8">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-foreground">
            Novelty Assessment
          </h2>
          <Badge variant="secondary" className="text-sm">
            AI-Powered Analysis
          </Badge>
        </div>

        {/* Main Gauge */}
        <div className="text-center space-y-4">
          <div className="relative inline-flex items-center justify-center">
            <div className="w-32 h-32 rounded-full bg-gradient-to-r from-destructive/20 via-warning/20 to-success/20 p-1">
              <div className="w-full h-full rounded-full bg-background flex items-center justify-center">
                <div
                  className={`w-24 h-24 rounded-full bg-${novelty.color}/10 flex items-center justify-center`}
                >
                  <IconComponent className={`w-8 h-8 text-${novelty.color}`} />
                </div>
              </div>
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className={`text-3xl font-bold text-${novelty.color}`}>
                  {noveltyScore}%
                </div>
                <div className="text-sm font-medium text-muted-foreground">
                  {novelty.level} Novelty
                </div>
              </div>
            </div>
          </div>

          <Progress value={noveltyScore} className="w-full h-3" />
        </div>

        {/* Rationale */}
        <div className="space-y-4">
          <h3 className="font-semibold text-foreground">Analysis Rationale</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <h4 className="font-medium text-success flex items-center">
                <div className="w-2 h-2 bg-success rounded-full mr-2" />
                Novel Aspects
              </h4>
              <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                <li>• 10x improvement in coherence times</li>
                <li>• Novel Majorana fermion approach</li>
                <li>• Unique error correction mechanism</li>
                <li>• Scalable architecture design</li>
              </ul>
            </div>
            <div className="space-y-3">
              <h4 className="font-medium text-warning flex items-center">
                <div className="w-2 h-2 bg-warning rounded-full mr-2" />
                Prior Art Concerns
              </h4>
              <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                <li>• Basic topological qubits known</li>
                <li>• Similar nanowire approaches exist</li>
                <li>• Error correction widely studied</li>
                <li>• Microsoft has related patents</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Evidence Pills */}
        <div className="space-y-3">
          <h4 className="font-medium text-foreground">Supporting Evidence</h4>
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className="text-xs">
              23 similar patents analyzed
            </Badge>
            <Badge variant="outline" className="text-xs">
              156 publications reviewed
            </Badge>
            <Badge variant="outline" className="text-xs">
              Semantic similarity: 0.72
            </Badge>
            <Badge variant="outline" className="text-xs">
              Citation network depth: 3 levels
            </Badge>
          </div>
        </div>
      </div>
    </Card>
  );
};
