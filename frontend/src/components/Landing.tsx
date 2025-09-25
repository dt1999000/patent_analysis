import { SetStateAction, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  FileText,
  Users,
  Scale,
  Download,
  Sparkles,
} from "lucide-react";

interface LandingProps {
  onAnalyze: (abstract: string) => void;
}

const sampleAbstract = `We present a novel approach to quantum error correction using topological qubits based on Majorana fermions in semiconductor nanowires. Our method achieves significantly higher error thresholds compared to conventional surface codes while maintaining scalability for large-scale quantum computing architectures. The implementation demonstrates a 10x improvement in coherence times and establishes a pathway toward fault-tolerant quantum computation.`;

export const Landing = ({ onAnalyze }: LandingProps) => {
  const [abstract, setAbstract] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleAnalyze = async () => {
    if (!abstract.trim()) return;
    setIsLoading(true);
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1500));
    onAnalyze(abstract);
    setIsLoading(false);
  };

  const handleTrySample = () => {
    setAbstract(sampleAbstract);
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Hero Section */}
      <div className="section-padding content-width pt-16 pb-24">
        <div className="text-center max-w-4xl mx-auto">
          <div className="mb-8">
            <Badge variant="secondary" className="mb-6 text-sm px-4 py-2">
              <Sparkles className="w-4 h-4 mr-2" />
              AI-Powered Tech Transfer Intelligence
            </Badge>
            <h1 className="text-5xl font-bold text-foreground mb-6 leading-tight">
              Transform Research into Commercial Success
              <span className="bg-gradient-primary bg-clip-text text-transparent block mt-2">
                Commercial Success
              </span>
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed max-w-3xl mx-auto">
              Instantly surface similar patents, identify key players, assess
              novelty, and generate attorney-ready briefs. Bridge Europe's
              commercialization gap with AI-powered prior art analysis.
            </p>
          </div>

          {/* Key Benefits */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="flex items-center justify-center space-x-3 text-muted-foreground">
              <Search className="w-5 h-5 text-primary" />
              <span className="font-medium">Smart Patent Discovery</span>
            </div>
            <div className="flex items-center justify-center space-x-3 text-muted-foreground">
              <Users className="w-5 h-5 text-primary" />
              <span className="font-medium">Key Player Mapping</span>
            </div>
            <div className="flex items-center justify-center space-x-3 text-muted-foreground">
              <Scale className="w-5 h-5 text-primary" />
              <span className="font-medium">Novelty Assessment</span>
            </div>
          </div>
        </div>

        {/* Input Section */}
        <div className="max-w-3xl mx-auto">
          <Card className="research-card-elevated p-8">
            <div className="space-y-6">
              <div>
                <label
                  htmlFor="abstract"
                  className="block text-sm font-semibold text-foreground mb-3"
                >
                  Research Abstract
                </label>
                <Textarea
                  id="abstract"
                  placeholder="Paste your research abstract here (2-5000 words)..."
                  value={abstract}
                  onChange={(e: {
                    target: { value: SetStateAction<string> };
                  }) => setAbstract(e.target.value)}
                  className="min-h-32 text-base leading-relaxed resize-none"
                  maxLength={5000}
                />
                <div className="flex justify-between items-center mt-2">
                  <span className="text-sm text-muted-foreground">
                    {abstract.length}/5000 characters
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleTrySample}
                    className="text-primary hover:text-primary-hover"
                  >
                    Try sample abstract
                  </Button>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  onClick={handleAnalyze}
                  disabled={!abstract.trim() || isLoading}
                  className="btn-primary flex-1 h-12 text-base font-semibold"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary-foreground border-t-transparent mr-2" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Search className="w-5 h-5 mr-2" />
                      Analyze Research
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  className="h-12 px-6"
                  disabled={isLoading}
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Upload File
                </Button>
              </div>
            </div>
          </Card>
        </div>

        {/* Demo Preview */}
        <div className="max-w-4xl mx-auto mt-16">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-3">
              See How It Works
            </h2>
            <p className="text-muted-foreground">
              Get comprehensive insights in seconds, not hours
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="research-card p-6 text-center hover-lift">
              <div className="w-12 h-12 bg-primary-muted rounded-lg flex items-center justify-center mx-auto mb-4">
                <Search className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">
                Similar Works
              </h3>
              <p className="text-sm text-muted-foreground">
                Ranked patents & publications with relevance scores
              </p>
            </Card>

            <Card className="research-card p-6 text-center hover-lift">
              <div className="w-12 h-12 bg-success-muted rounded-lg flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-6 h-6 text-success" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">
                Novelty Gauge
              </h3>
              <p className="text-sm text-muted-foreground">
                AI-powered assessment of innovation potential
              </p>
            </Card>

            <Card className="research-card p-6 text-center hover-lift">
              <div className="w-12 h-12 bg-secondary-muted rounded-lg flex items-center justify-center mx-auto mb-4">
                <Users className="w-6 h-6 text-secondary" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">
                Key Players
              </h3>
              <p className="text-sm text-muted-foreground">
                Identify active inventors, authors & institutions
              </p>
            </Card>

            <Card className="research-card p-6 text-center hover-lift">
              <div className="w-12 h-12 bg-warning-muted rounded-lg flex items-center justify-center mx-auto mb-4">
                <Download className="w-6 h-6 text-warning" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">
                Attorney Brief
              </h3>
              <p className="text-sm text-muted-foreground">
                Export-ready patent analysis & recommendations
              </p>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};
