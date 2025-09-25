import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Download, Copy, Edit3, FileText, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AttorneyBriefProps {
  abstract: string;
}

export const AttorneyBrief = ({ abstract }: AttorneyBriefProps) => {
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [briefContent, setBriefContent] = useState(generateBrief(abstract));

  function generateBrief(abstract: string): string {
    return `# PATENT NOVELTY AND PATENTABILITY ASSESSMENT

## EXECUTIVE SUMMARY

The submitted research abstract describes a novel quantum error correction approach using topological qubits based on Majorana fermions in semiconductor nanowires. Our analysis indicates **HIGH NOVELTY POTENTIAL** with significant technical advancement over existing approaches.

**Key Finding:** 10x improvement in coherence times represents a substantial technical breakthrough with strong commercial potential.

---

## 1. TECHNICAL SUMMARY

The invention relates to quantum error correction systems utilizing:
- Topological qubits based on Majorana fermions
- Semiconductor nanowire architectures  
- Enhanced coherence time mechanisms
- Scalable quantum computing implementations

**Primary Innovation:** Novel error correction protocols achieving 10x coherence improvement while maintaining architectural scalability.

---

## 2. PRIOR ART ANALYSIS

### Closely Related Patents (Cited)
1. **US10789563B2** - Microsoft Corporation (2023)
   - Topological quantum computing with Majorana fermions
   - **Relevance:** 89% - Similar foundational approach
   - **Distinguishing Factor:** Our coherence enhancement mechanism

2. **US11234567B2** - IBM Corporation (2022)  
   - Error correction protocols for topological systems
   - **Relevance:** 84% - Overlapping error correction methodology
   - **Distinguishing Factor:** 10x performance improvement and scalability

3. **US98765432B2** - Google LLC (2021)
   - Semiconductor nanowire quantum devices  
   - **Relevance:** 76% - Similar hardware platform
   - **Distinguishing Factor:** Novel topological implementation

### Key Publications
- Nature Physics (2023): "Scaling quantum error correction in topological systems"
- Physical Review Letters (2022): "Majorana fermion manipulation in nanowires"

---

## 3. NOVELTY ASSESSMENT

### Novel Aspects (Likely Patentable)
✓ **10x coherence time improvement** - Quantifiable technical advancement
✓ **Specific error correction mechanism** - Novel implementation methodology  
✓ **Scalable architecture design** - Unique system-level approach
✓ **Majorana fermion manipulation technique** - Specific technical process

### Prior Art Concerns
⚠️ Basic topological qubit concepts are well-established (Microsoft, IBM patents)
⚠️ Semiconductor nanowire quantum devices have extensive prior art
⚠️ General error correction principles are widely known

### Patentability Recommendation: **PROCEED**
The 10x performance improvement and specific implementation methodology provide sufficient novelty for patent protection.

---

## 4. FREEDOM TO OPERATE (FTO) ANALYSIS

### Potential Infringement Risks
- **Microsoft Patents:** Broad topological qubit claims may require license
- **IBM Patents:** Error correction protocol overlaps need review
- **Google Patents:** Nanowire device patents may be implicated

### Mitigation Strategies
1. Focus claims on specific 10x improvement mechanism
2. Emphasize novel architectural elements
3. Consider continuation applications for specific implementations

---

## 5. COMMERCIAL POTENTIAL

### Target Licensees
- **Intel Quantum** ($100M+ potential)
- **Rigetti Computing** ($50M-100M potential)  
- **IonQ** ($25M-75M potential)

### Market Positioning
- Strong differentiation in performance metrics
- Clear commercial value proposition
- Multiple licensing opportunities identified

---

## 6. RECOMMENDED ACTIONS

### Immediate (0-30 days)
1. **File provisional patent application** - Secure priority date
2. **Conduct detailed FTO search** - Focus on Microsoft/IBM patents
3. **Document experimental results** - Support 10x improvement claims

### Medium-term (1-6 months)  
1. **Prepare PCT application** - International protection strategy
2. **Initiate licensing discussions** - Target Intel and Rigetti first
3. **Consider continuation strategy** - Multiple patent applications

### Long-term (6+ months)
1. **Monitor competitive landscape** - Track new patent filings
2. **Develop licensing program** - Structured commercialization approach
3. **Consider strategic partnerships** - Joint development opportunities

---

## 7. APPENDIX - SUPPORTING DOCUMENTATION

### Citation Index
- Patent references: 23 relevant patents analyzed
- Publication references: 156 academic papers reviewed
- Semantic analysis confidence: 0.72 average relevance score

### Contact Information
For questions regarding this analysis, contact:
- Patent Attorney: [To be assigned]
- Technology Transfer Office: [Institution contact]
- Licensing Manager: [To be assigned]

---

*This analysis was generated using AI-powered patent intelligence tools and should be reviewed by qualified patent counsel before making filing decisions.*

**Document ID:** Brief-2024-001
**Generated:** ${new Date().toLocaleDateString()}
**Status:** Draft for Review`;
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(briefContent);
      toast({
        title: "Brief copied!",
        description: "Attorney brief has been copied to clipboard.",
      });
    } catch (error) {
      toast({
        title: "Copy failed",
        description: "Unable to copy brief to clipboard.",
        variant: "destructive",
      });
    }
  };

  const handleExport = () => {
    // Create a blob with the content
    const blob = new Blob([briefContent], { type: "text/plain" });
    const url = URL.createObjectURL(blob);

    // Create a download link
    const a = document.createElement("a");
    a.href = url;
    a.download = `attorney-brief-${new Date().toISOString().split("T")[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Brief exported!",
      description: "Attorney brief has been downloaded.",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="research-card p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-foreground mb-2">
              Attorney Brief
            </h2>
            <p className="text-sm text-muted-foreground">
              AI-generated patent novelty and patentability assessment
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <Badge variant="secondary" className="text-sm">
              <CheckCircle className="w-4 h-4 mr-1" />
              Ready for Review
            </Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(!isEditing)}
            >
              <Edit3 className="w-4 h-4 mr-2" />
              {isEditing ? "Preview" : "Edit"}
            </Button>
            <Button variant="outline" size="sm" onClick={handleCopy}>
              <Copy className="w-4 h-4 mr-2" />
              Copy
            </Button>
            <Button size="sm" onClick={handleExport} className="btn-primary">
              <Download className="w-4 h-4 mr-2" />
              Export PDF
            </Button>
          </div>
        </div>
      </Card>

      {/* Brief Content */}
      <Card className="research-card p-8">
        {isEditing ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-foreground">
                Edit Brief Content
              </h3>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setBriefContent(generateBrief(abstract))}
              >
                Reset to Default
              </Button>
            </div>
            <Textarea
              value={briefContent}
              onChange={(e) => setBriefContent(e.target.value)}
              className="min-h-[600px] font-mono text-sm"
            />
          </div>
        ) : (
          <div className="prose prose-slate max-w-none">
            <div className="whitespace-pre-wrap text-sm leading-relaxed text-foreground font-serif">
              {briefContent}
            </div>
          </div>
        )}
      </Card>

      {/* Action Summary */}
      <Card className="research-card p-6">
        <h3 className="font-semibold text-foreground mb-4">
          Next Steps Summary
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-destructive rounded-full" />
              <span className="font-medium text-foreground">
                Urgent (0-30 days)
              </span>
            </div>
            <ul className="text-sm text-muted-foreground space-y-1 ml-5">
              <li>• File provisional patent</li>
              <li>• Conduct FTO search</li>
              <li>• Document experimental results</li>
            </ul>
          </div>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-warning rounded-full" />
              <span className="font-medium text-foreground">
                Medium (1-6 months)
              </span>
            </div>
            <ul className="text-sm text-muted-foreground space-y-1 ml-5">
              <li>• Prepare PCT application</li>
              <li>• Initiate licensing talks</li>
              <li>• Plan continuation strategy</li>
            </ul>
          </div>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-success rounded-full" />
              <span className="font-medium text-foreground">
                Long-term (6+ months)
              </span>
            </div>
            <ul className="text-sm text-muted-foreground space-y-1 ml-5">
              <li>• Monitor landscape</li>
              <li>• Develop licensing program</li>
              <li>• Strategic partnerships</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
};
