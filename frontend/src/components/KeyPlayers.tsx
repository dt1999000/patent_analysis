import { useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DialogRoot,
  DialogContent,
  DialogBody,
  DialogBackdrop,
  DialogCloseTrigger,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Building2,
  User,
  GraduationCap,
  ExternalLink,
  Network,
} from "lucide-react";
import ForceGraph from "@/components/Graph/ForceGraph";
import { mockDocuments } from "@/components/Graph/mockDocs";

interface Player {
  id: string;
  name: string;
  type: "inventor" | "author" | "institution";
  activity: number;
  recentWork: string;
  affiliation?: string;
  specialization: string;
  collaborations: number;
}

const mockPlayers: Player[] = [
  {
    id: "microsoft-research",
    name: "Microsoft Research",
    type: "institution",
    activity: 47,
    recentWork: "Topological quantum computing platform",
    specialization: "Quantum Computing",
    collaborations: 23,
  },
  {
    id: "dr-chen-liu",
    name: "Dr. Chen Liu",
    type: "author",
    activity: 23,
    recentWork: "Majorana fermion detection in nanowires",
    affiliation: "MIT",
    specialization: "Condensed Matter Physics",
    collaborations: 15,
  },
  {
    id: "prof-anderson",
    name: "Prof. Peter Anderson",
    type: "inventor",
    activity: 19,
    recentWork: "Quantum error correction protocols",
    affiliation: "Stanford University",
    specialization: "Quantum Information",
    collaborations: 31,
  },
  {
    id: "ibm-quantum",
    name: "IBM Quantum",
    type: "institution",
    activity: 34,
    recentWork: "Scalable quantum architectures",
    specialization: "Quantum Hardware",
    collaborations: 18,
  },
  {
    id: "dr-kumar",
    name: "Dr. Sanjay Kumar",
    type: "author",
    activity: 16,
    recentWork: "Semiconductor nanowire fabrication",
    affiliation: "University of Copenhagen",
    specialization: "Materials Science",
    collaborations: 12,
  },
  {
    id: "google-quantum",
    name: "Google Quantum AI",
    type: "institution",
    activity: 28,
    recentWork: "Coherence enhancement techniques",
    specialization: "Quantum Computing",
    collaborations: 9,
  },
];

export const KeyPlayers = () => {
  const [isOpen, setIsOpen] = useState(false);
  const open = () => setIsOpen(true);

  // Derive statistics from mock documents for a more factual view
  const stats = useMemo(() => {
    const authors = new Map<string, number>();
    const institutions = new Map<string, number>();
    let collaborations = 0;

    for (const d of mockDocuments) {
      // count authors and pairwise collaborations per document
      for (const a of d.authors) {
        authors.set(a, (authors.get(a) || 0) + 1);
      }
      for (let i = 0; i < d.authors.length; i++) {
        for (let j = i + 1; j < d.authors.length; j++) collaborations += 1;
      }
      for (const inst of d.institutions) {
        if (!inst) continue;
        institutions.set(inst, (institutions.get(inst) || 0) + 1);
      }
    }

    const activePlayers = new Set<string>([
      ...authors.keys(),
      ...institutions.keys(),
    ]).size;

    // Build top players list from counts
    const topInstitutions = [...institutions.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([name, count]) => ({
        id: name.toLowerCase().replace(/\s+/g, "-"),
        name,
        type: "institution" as const,
        activity: count,
        recentWork: "Research appearing in mock dataset",
        specialization: "Quantum Computing",
        collaborations: count,
      }));

    const topAuthors = [...authors.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([name, count]) => ({
        id: name.toLowerCase().replace(/\s+/g, "-"),
        name,
        type: "author" as const,
        activity: count,
        affiliation: Array.from(institutions.keys())[0] || "",
        recentWork: "Appears across related works",
        specialization: "Quantum Information",
        collaborations: Math.max(1, Math.round(count * 2)),
      }));

    return {
      activePlayers,
      totalCollaborations: collaborations,
      researchClusters: 3,
      players: [...topInstitutions, ...topAuthors] as Player[],
    };
  }, []);
  const getTypeIcon = (type: string) => {
    switch (type) {
      case "institution":
        return Building2;
      case "inventor":
        return GraduationCap;
      case "author":
        return User;
      default:
        return User;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "institution":
        return "primary";
      case "inventor":
        return "success";
      case "author":
        return "secondary";
      default:
        return "secondary";
    }
  };

  const getActivityLevel = (activity: number) => {
    if (activity >= 30) return { level: "Very High", color: "success" };
    if (activity >= 20) return { level: "High", color: "warning" };
    if (activity >= 10) return { level: "Medium", color: "secondary" };
    return { level: "Low", color: "muted" };
  };

  return (
    <div className="space-y-6">
      {/* Overview */}
      <Card className="research-card p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-foreground">
            Key Players Analysis
          </h2>
          <Button variant="outline" size="sm" onClick={open}>
            <Network className="w-4 h-4 mr-2" />
            View Network Graph
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-primary mb-2">{stats.activePlayers}</div>
            <div className="text-sm text-muted-foreground">Active Players</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-secondary mb-2">{stats.totalCollaborations}</div>
            <div className="text-sm text-muted-foreground">
              Total Collaborations
            </div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-success mb-2">{stats.researchClusters}</div>
            <div className="text-sm text-muted-foreground">
              Research Clusters
            </div>
          </div>
        </div>
      </Card>

      {/* Player Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {(stats.players.length ? stats.players : mockPlayers).map((player) => {
          const IconComponent = getTypeIcon(player.type);
          const activity = getActivityLevel(player.activity);

          return (
            <Card key={player.id} className="research-card p-6 hover-lift">
              <div className="flex items-start space-x-4">
                <Avatar className="w-12 h-12">
                  <AvatarFallback
                    className={`bg-${getTypeColor(player.type)}-muted`}
                  >
                    <IconComponent
                      className={`w-6 h-6 text-${getTypeColor(player.type)}`}
                    />
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-foreground">
                        {player.name}
                      </h3>
                      {player.affiliation && (
                        <p className="text-sm text-muted-foreground">
                          {player.affiliation}
                        </p>
                      )}
                    </div>
                    <Button size="sm" variant="ghost">
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Badge variant={getTypeColor(player.type) as any}>
                      {player.type}
                    </Badge>
                    <Badge variant={activity.color as any} className="text-xs">
                      {activity.level} Activity
                    </Badge>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">
                        Specialization:
                      </span>
                      <span className="font-medium text-foreground">
                        {player.specialization}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">
                        Related Works:
                      </span>
                      <span className="font-medium text-foreground">
                        {player.activity}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">
                        Collaborations:
                      </span>
                      <span className="font-medium text-foreground">
                        {player.collaborations}
                      </span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-border">
                    <p className="text-sm text-muted-foreground">
                      <span className="font-medium">Recent:</span>{" "}
                      {player.recentWork}
                    </p>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Button size="sm" variant="outline" className="flex-1">
                      View Profile
                    </Button>
                    <Button size="sm" variant="ghost" className="flex-1">
                      Add to Brief
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Graph Dialog */}
      <DialogRoot open={isOpen} onOpenChange={(e) => setIsOpen((e as any).open)}>
        <DialogBackdrop />
        <DialogContent maxW="6xl" p={4}>
          <DialogCloseTrigger />
          <DialogTitle>Research Collaboration Network</DialogTitle>
          <DialogBody pt={4}>
            <ForceGraph documents={mockDocuments} />
          </DialogBody>
        </DialogContent>
      </DialogRoot>

      {/* Research Clusters */}
      <Card className="research-card p-6">
        <h3 className="font-semibold text-foreground mb-4">
          Research Clusters
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-primary rounded-full" />
              <span className="font-medium text-foreground">
                Quantum Hardware
              </span>
            </div>
            <p className="text-sm text-muted-foreground ml-5">
              Microsoft, IBM, Google - Physical quantum systems
            </p>
          </div>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-secondary rounded-full" />
              <span className="font-medium text-foreground">
                Theory & Algorithms
              </span>
            </div>
            <p className="text-sm text-muted-foreground ml-5">
              Academic researchers - Theoretical foundations
            </p>
          </div>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-success rounded-full" />
              <span className="font-medium text-foreground">
                Materials Science
              </span>
            </div>
            <p className="text-sm text-muted-foreground ml-5">
              Universities - Nanowire fabrication & characterization
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};
