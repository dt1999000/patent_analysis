import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, FileText, Download, GitCompare } from "lucide-react";
import { NoveltyGauge } from "./NoveltyGauge";
import { SimilarWorks } from "./SimilarWorks";
import { KeyPlayers } from "./KeyPlayers";
import { LicensingMap } from "./LicensingMap";
import { AttorneyBrief } from "./AttorneyBrief";
import { DataResponse } from "@/api/types";

interface ResultsWorkspaceProps {
  abstract: string;
  res: DataResponse | null;
  onBack: () => void;
}

export const ResultsWorkspace = ({
  abstract,
  res,
  onBack,
}: ResultsWorkspaceProps) => {
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  const handleCompare = () => {
    // Handle compare functionality
    console.log("Comparing items:", selectedItems);
  };

  const handleExport = () => {
    // Handle export functionality
    console.log("Exporting analysis");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-surface">
        <div className="section-padding content-width py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={onBack}
                className="hover:bg-muted"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Input
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-foreground">
                  Research Analysis
                </h1>
                <p className="text-sm text-muted-foreground mt-1">
                  {abstract.slice(0, 100)}...
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                size="sm"
                onClick={handleCompare}
                disabled={selectedItems.length < 2}
              >
                <GitCompare className="w-4 h-4 mr-2" />
                Compare ({selectedItems.length})
              </Button>
              <Button
                variant="solid"
                size="sm"
                onClick={handleExport}
                className="btn-primary"
              >
                <Download className="w-4 h-4 mr-2" />
                PDF
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="section-padding content-width py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5 mb-8">
            <TabsTrigger value="overview" className="text-sm">
              Overview
            </TabsTrigger>
            <TabsTrigger value="similar-works" className="text-sm">
              Similar Works
            </TabsTrigger>
            <TabsTrigger value="key-players" className="text-sm">
              Key Players
            </TabsTrigger>
            <TabsTrigger value="licensing" className="text-sm">
              Licensing Map
            </TabsTrigger>
            <TabsTrigger value="brief" className="text-sm">
              Attorney Brief
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Novelty Gauge - Takes up 2 columns */}
              <div className="lg:col-span-2">
                <NoveltyGauge overview={res?.overview!} />
              </div>

              {/* Quick Actions */}
              <div className="space-y-6">
                <Card className="research-card p-6">
                  <h3 className="font-semibold text-foreground mb-4">
                    Quick Insights
                  </h3>
                  <div className="space-y-3">
                    <Badge
                      variant="secondary"
                      className="w-full justify-start p-3"
                    >
                      <div className="w-3 h-3 bg-success rounded-full mr-3" />
                      High novelty potential
                    </Badge>
                    <Badge
                      variant="secondary"
                      className="w-full justify-start p-3"
                    >
                      <div className="w-3 h-3 bg-warning rounded-full mr-3" />
                      Emerging field cluster
                    </Badge>
                    <Badge
                      variant="secondary"
                      className="w-full justify-start p-3"
                    >
                      <div className="w-3 h-3 bg-primary rounded-full mr-3" />
                      23 similar patents found
                    </Badge>
                  </div>
                </Card>

                <Card className="research-card p-6">
                  <h3 className="font-semibold text-foreground mb-4">
                    Recommended Actions
                  </h3>
                  <div className="space-y-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start"
                    >
                      <FileText className="w-4 h-4 mr-2" />
                      Review similar patents
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start"
                    >
                      <GitCompare className="w-4 h-4 mr-2" />
                      Compare key claims
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Generate brief
                    </Button>
                  </div>
                </Card>
              </div>
            </div>

            {/* Top Takeaways */}
            <Card className="research-card p-8">
              <h3 className="text-xl font-semibold text-foreground mb-6">
                Key Takeaways
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-3">
                  <div className="w-10 h-10 bg-success-muted rounded-lg flex items-center justify-center">
                    <div className="w-4 h-4 bg-success rounded-full" />
                  </div>
                  <h4 className="font-semibold text-foreground">
                    {res?.overview.keyTakeaways.noveltyLevel} Novelty
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    {res?.overview.keyTakeaways.noveltyReasoning}
                  </p>
                </div>
                <div className="space-y-3">
                  <div className="w-10 h-10 bg-warning-muted rounded-lg flex items-center justify-center">
                    <div className="w-4 h-4 bg-warning rounded-full" />
                  </div>
                  <h4 className="font-semibold text-foreground">
                    {res?.overview.keyTakeaways.competitiveLandscapeLevel}{" "}
                    Competitive Landscape
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    {res?.overview.keyTakeaways.competitiveLandscapeReasoning}
                  </p>
                </div>
                <div className="space-y-3">
                  <div className="w-10 h-10 bg-primary-muted rounded-lg flex items-center justify-center">
                    <div className="w-4 h-4 bg-primary rounded-full" />
                  </div>
                  <h4 className="font-semibold text-foreground">
                    {res?.overview.keyTakeaways.licensingOpportunityLevel}{" "}
                    Licensing Opportunity
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    {res?.overview.keyTakeaways.licensingOpportunityReasoning}
                  </p>
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="similar-works">
            <SimilarWorks
              onSelectionChange={setSelectedItems}
              similarWork={res?.similarWork!}
            />
          </TabsContent>

          <TabsContent value="key-players">
            <KeyPlayers />
          </TabsContent>

          <TabsContent value="licensing">
            <LicensingMap />
          </TabsContent>

          <TabsContent value="brief">
            <AttorneyBrief abstract={abstract} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};
