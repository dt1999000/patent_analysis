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

interface Patent {
  id: string;
  title: string;
  year: number;
  assignee?: string;
  relevance: number;
  source: "patent" | "publication";
  abstract: string;
  authors?: string[];
  publisher?: string;
}

const mockData: Patent[] = [
  {
    id: "US10789563B2",
    title:
      "Topological quantum computing with Majorana fermions in semiconductor nanowires",
    year: 2023,
    assignee: "Microsoft Corporation",
    relevance: 0.89,
    source: "patent",
    abstract:
      "Systems and methods for implementing quantum gates using topological qubits based on Majorana fermions...",
  },
  {
    id: "US11234567B2",
    title: "Error correction protocols for topological quantum systems",
    year: 2022,
    assignee: "IBM Corporation",
    relevance: 0.84,
    source: "patent",
    abstract:
      "Methods for quantum error correction in topological quantum computing architectures...",
  },
  {
    id: "nature-2023-001",
    title: "Scaling quantum error correction in topological systems",
    year: 2023,
    authors: ["Chen, L.", "Anderson, P.", "Kumar, S."],
    publisher: "Nature Physics",
    relevance: 0.81,
    source: "publication",
    abstract:
      "We demonstrate scalable quantum error correction protocols for topological quantum computers...",
  },
  {
    id: "US98765432B2",
    title: "Semiconductor nanowire quantum devices with enhanced coherence",
    year: 2021,
    assignee: "Google LLC",
    relevance: 0.76,
    source: "patent",
    abstract:
      "Quantum computing devices utilizing semiconductor nanowires with improved coherence properties...",
  },
];

interface SimilarWorksProps {
  onSelectionChange: (selected: string[]) => void;
}

export const SimilarWorks = ({ onSelectionChange }: SimilarWorksProps) => {
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sourceFilter, setSourceFilter] = useState("all");
  const [minRelevance, setMinRelevance] = useState(0);

  const filteredData = mockData.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.assignee?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.authors?.some((author) =>
        author.toLowerCase().includes(searchTerm.toLowerCase())
      );
    const matchesSource =
      sourceFilter === "all" || item.source === sourceFilter;
    const matchesRelevance = item.relevance >= minRelevance;

    return matchesSearch && matchesSource && matchesRelevance;
  });

  const handleItemSelect = (itemId: string, checked: boolean) => {
    const newSelection = checked
      ? [...selectedItems, itemId]
      : selectedItems.filter((id) => id !== itemId);

    setSelectedItems(newSelection);
    onSelectionChange(newSelection);
  };

  const getRelevanceColor = (
    relevance: number
  ): "secondary" | "default" | "destructive" | "outline" => {
    if (relevance >= 0.8) return "default";
    if (relevance >= 0.6) return "secondary";
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
              placeholder="Search titles, assignees..."
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
        {filteredData.map((item) => (
          <Card key={item.id} className="research-card p-6 hover-lift">
            <div className="flex items-start space-x-4">
              <Checkbox
                checked={selectedItems.includes(item.id)}
                onCheckedChange={(checked) =>
                  handleItemSelect(item.id, checked as unknown as boolean)
                }
                className="mt-1"
              />

              <div className="flex-1 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <h3 className="font-semibold text-foreground leading-tight">
                      {item.title}
                    </h3>
                    <div className="flex items-center space-x-4">
                      <Badge
                        variant={
                          item.source === "patent" ? "default" : "secondary"
                        }
                      >
                        {item.source === "patent" ? "Patent" : "Publication"}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {item.year}
                      </span>
                      <span className="text-sm font-medium text-foreground">
                        {item.source === "patent"
                          ? item.assignee
                          : item.authors?.join(", ")}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Badge
                      variant={getRelevanceColor(item.relevance)}
                      className="text-sm"
                    >
                      {Math.round(item.relevance * 100)}% match
                    </Badge>
                    <Button size="sm" variant="ghost">
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <p className="text-sm text-muted-foreground leading-relaxed">
                  {item.abstract}
                </p>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline" className="text-xs">
                      ID: {item.id}
                    </Badge>
                    {item.publisher && (
                      <Badge variant="outline" className="text-xs">
                        {item.publisher}
                      </Badge>
                    )}
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
