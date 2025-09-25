import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ExternalLink, Plus, Search, Filter } from "lucide-react";
import type { SimilarWorkResponse, RetrievedDocument } from "@/api/types";

interface SimilarWorksProps {
  onSelectionChange: (selected: string[]) => void;
  similarWork: SimilarWorkResponse;
}

export const SimilarWorks = ({
  onSelectionChange,
  similarWork,
}: SimilarWorksProps) => {
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sourceFilter, setSourceFilter] = useState("all");
  const [minRelevance, setMinRelevance] = useState(0);

  const filteredData = (similarWork.documents || []).filter(
    (doc: RetrievedDocument) => {
      const matchesSearch =
        doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.institution?.some((inst) =>
          inst.toLowerCase().includes(searchTerm.toLowerCase())
        ) ||
        doc.author?.some((author) =>
          author.toLowerCase().includes(searchTerm.toLowerCase())
        );

      const matchesSource = sourceFilter === "all" || doc.type === sourceFilter;

      const matchesRelevance = doc.similarityScore >= minRelevance;

      return matchesSearch && matchesSource && matchesRelevance;
    }
  );

  const handleItemSelect = (id: string, checked: boolean) => {
    const newSelection = checked
      ? [...selectedItems, id]
      : selectedItems.filter((s) => s !== id);

    setSelectedItems(newSelection);
    onSelectionChange(newSelection);
  };

  const getRelevanceColor = (
    score: number
  ): "secondary" | "default" | "outline" => {
    if (score >= 0.8) return "default";
    if (score >= 0.6) return "secondary";
    return "outline";
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card className="research-card p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search titles, institutions, authors..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={sourceFilter} onValueChange={setSourceFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Source type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Sources</SelectItem>
              <SelectItem value="patent">Patents Only</SelectItem>
              <SelectItem value="publication">Publications Only</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={minRelevance.toString()}
            onValueChange={(value) => setMinRelevance(parseFloat(value))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Min relevance" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="0">All Relevance</SelectItem>
              <SelectItem value="0.5">50%+ Relevance</SelectItem>
              <SelectItem value="0.7">70%+ Relevance</SelectItem>
              <SelectItem value="0.8">80%+ Relevance</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              {filteredData.length} results
            </span>
          </div>
        </div>
      </Card>

      {/* Results */}
      <div className="space-y-4">
        {filteredData.map((doc) => (
          <Card key={doc.id} className="research-card p-6 hover-lift">
            <div className="flex items-start space-x-4">
              <Checkbox
                checked={selectedItems.includes(doc.id)}
                onCheckedChange={(checked) =>
                  handleItemSelect(doc.id, checked as unknown as boolean)
                }
                className="mt-1"
              />

              <div className="flex-1 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <h3 className="font-semibold text-foreground leading-tight">
                      {doc.title}
                    </h3>
                    <div className="flex items-center space-x-4">
                      <Badge
                        variant={
                          doc.type === "patent" ? "default" : "secondary"
                        }
                      >
                        {doc.type === "patent" ? "Patent" : "Publication"}
                      </Badge>
                      <span className="text-sm font-medium text-foreground">
                        {doc.type === "patent"
                          ? doc.institution?.join(", ")
                          : doc.author?.join(", ")}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Badge
                      variant={getRelevanceColor(doc.similarityScore)}
                      className="text-sm"
                    >
                      {Math.round(doc.similarityScore * 100)}% match
                    </Badge>
                    <Button size="sm" variant="ghost">
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <p className="text-sm text-muted-foreground leading-relaxed">
                  {doc.abstract}
                </p>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline" className="text-xs">
                      ID: {doc.id}
                    </Badge>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Button size="sm" variant="outline">
                      <Plus className="w-4 h-4 mr-1" />
                      Add to Brief
                    </Button>
                    <Button size="sm" variant="ghost">
                      Compare
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {filteredData.length === 0 && (
        <Card className="research-card p-12 text-center">
          <div className="space-y-4">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto">
              <Search className="w-8 h-8 text-muted-foreground" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-2">
                No results found
              </h3>
              <p className="text-muted-foreground">
                Try adjusting your search terms or filters to find relevant
                patents and publications.
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};
