"use client";
import { useState, useCallback, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useEditor, EditorContent } from "@tiptap/react";
import { BubbleMenu } from "@tiptap/react/menus";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Highlight from "@tiptap/extension-highlight";
import TextAlign from "@tiptap/extension-text-align";
import Link from "@tiptap/extension-link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { toast } from "react-toastify";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  AlignLeft,
  AlignCenter,
  AlignRight,
  List,
  ListOrdered,
  Undo,
  Redo,
  Wand2,
  RefreshCw,
  Bot,
  CheckCircle2,
  Copy,
  Download,
  Sparkles,
  Type,
  FileText,
  Loader2,
  Link as LinkIcon,
  Unlink,
  X,
  Check,
  AlertTriangle,
  Eye,
  MessageSquare,
  GraduationCap,
  FlaskConical,
  FileSearch,
} from "lucide-react";
import {
  useParaphrasedMutation,
  useHumanizeContendMutation,
  useSpellCheckerMutation,
  useScanAidetectorMutation,
} from "@/redux/api/tools/toolsApi";
import { setShowLoginModal } from "@/redux/slices/auth";
import { cn } from "@/lib/utils";
import { getFullAnalysis } from "@/lib/text-analysis";
import { searchAll, formatCitation } from "@/lib/citation-lookup";
import { analyzePlagiarism } from "@/services/plagiarismService";
import {
  BookOpen,
  TrendingUp,
  BarChart3,
  AlertCircle,
  Info,
  Search,
  ExternalLink,
  Plus,
  Trash2,
  ListOrdered as ListIcon,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, FileDown, HelpCircle } from "lucide-react";
import WritingStudioOnboarding from "./WritingStudioOnboarding";
import { 
  WritingStudioUpgradeModal, 
  UsageLimitBanner, 
  USAGE_LIMITS,
} from "./WritingStudioUpgrade";
import { useWritingStudioLimits, getUpgradeMessage } from "@/hooks/useWritingStudioLimits";

const AI_TOOLS = [
  {
    id: "paraphrase",
    name: "Paraphrase",
    icon: RefreshCw,
    description: "Rewrite text while preserving meaning",
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
  },
  {
    id: "humanize",
    name: "Humanize",
    icon: Bot,
    description: "Make AI text sound more natural",
    color: "text-purple-500",
    bgColor: "bg-purple-500/10",
  },
  {
    id: "grammar",
    name: "Grammar & Clarity",
    icon: CheckCircle2,
    description: "Fix errors and improve clarity",
    color: "text-green-500",
    bgColor: "bg-green-500/10",
  },
  {
    id: "summarize",
    name: "Summarize",
    icon: FileText,
    description: "Condense text to key points",
    color: "text-orange-500",
    bgColor: "bg-orange-500/10",
  },
];

const PARAPHRASE_MODES = [
  { id: "Fluency", name: "Fluency", description: "Improve readability" },
  { id: "Standard", name: "Standard", description: "Balanced rewrite" },
  { id: "Formal", name: "Academic", description: "Academic tone" },
  { id: "Simple", name: "Simplify", description: "Clearer language" },
  { id: "Creative", name: "Creative", description: "More varied wording" },
  { id: "Shorten", name: "Shorten", description: "Reduce word count" },
  { id: "Expand", name: "Expand", description: "Add more detail" },
];

const WRITING_TEMPLATES = [
  {
    id: "research-paper",
    name: "Research Paper",
    icon: FlaskConical,
    description: "Standard academic research structure",
    content: `<h1>Research Paper Title</h1>
<h2>Abstract</h2>
<p>[Provide a brief summary of your research, including the problem, methods, key findings, and conclusions. Keep it under 300 words.]</p>
<h2>1. Introduction</h2>
<p>[Introduce your research topic and its significance. State the research problem or question. Outline the objectives and scope of your study.]</p>
<h2>2. Literature Review</h2>
<p>[Summarize relevant existing research. Identify gaps in current knowledge. Explain how your research addresses these gaps.]</p>
<h2>3. Methodology</h2>
<p>[Describe your research design and approach. Explain data collection methods. Detail your analysis procedures.]</p>
<h2>4. Results</h2>
<p>[Present your findings objectively. Use tables and figures where appropriate. Report statistical analyses if applicable.]</p>
<h2>5. Discussion</h2>
<p>[Interpret your results. Compare findings with existing literature. Discuss implications and limitations.]</p>
<h2>6. Conclusion</h2>
<p>[Summarize key findings. State contributions to the field. Suggest directions for future research.]</p>
<h2>References</h2>
<p>[List all cited sources in your chosen citation format.]</p>`,
  },
  {
    id: "argumentative-essay",
    name: "Argumentative Essay",
    icon: MessageSquare,
    description: "Persuasive essay with thesis and evidence",
    content: `<h1>Essay Title</h1>
<h2>Introduction</h2>
<p><strong>Hook:</strong> Start with an engaging opening that captures reader attention.</p>
<p><strong>Background:</strong> Provide context and background information on your topic.</p>
<p><strong>Thesis Statement:</strong> Clearly state your main argument or position.</p>
<h2>Body Paragraph 1: First Main Point</h2>
<p><strong>Topic Sentence:</strong> State your first supporting argument.</p>
<p><strong>Evidence:</strong> Present facts, statistics, or examples that support this point.</p>
<p><strong>Analysis:</strong> Explain how this evidence supports your thesis.</p>
<p><strong>Transition:</strong> Connect to the next paragraph.</p>
<h2>Body Paragraph 2: Second Main Point</h2>
<p><strong>Topic Sentence:</strong> State your second supporting argument.</p>
<p><strong>Evidence:</strong> Present supporting evidence.</p>
<p><strong>Analysis:</strong> Explain the significance of this evidence.</p>
<p><strong>Transition:</strong> Connect to the next paragraph.</p>
<h2>Body Paragraph 3: Counterargument & Rebuttal</h2>
<p>[Acknowledge opposing viewpoints fairly.]</p>
<p>[Explain why your position is stronger.]</p>
<p>[Provide evidence to refute counterarguments.]</p>
<h2>Conclusion</h2>
<p>[Restate thesis in new words.]</p>
<p>[Summarize main points.]</p>
<p>[End with a call to action or thought-provoking statement.]</p>`,
  },
  {
    id: "thesis-chapter",
    name: "Thesis Chapter",
    icon: GraduationCap,
    description: "Detailed thesis/dissertation chapter",
    content: `<h1>Chapter [X]: [Chapter Title]</h1>
<h2>[X.1] Introduction to Chapter</h2>
<p>[Outline what this chapter covers. Explain its role in your overall thesis. State the chapter objectives.]</p>
<h2>[X.2] Theoretical Framework</h2>
<p>[Present relevant theories and concepts. Explain how they apply to your research. Justify your theoretical choices.]</p>
<h2>[X.3] Main Content Section</h2>
<h3>[X.3.1] First Subsection</h3>
<p>[Develop your main ideas with detailed analysis. Support claims with evidence and citations. Connect to your research questions.]</p>
<h3>[X.3.2] Second Subsection</h3>
<p>[Continue developing your argument. Maintain logical flow between sections. Reference related literature.]</p>
<h3>[X.3.3] Third Subsection</h3>
<p>[Further elaborate on key points. Address complexities and nuances. Build toward chapter conclusions.]</p>
<h2>[X.4] Critical Analysis</h2>
<p>[Synthesize the information presented. Evaluate different perspectives. Identify patterns and relationships.]</p>
<h2>[X.5] Chapter Summary</h2>
<p>[Recap the main points covered. Explain how this chapter contributes to your thesis. Preview connections to subsequent chapters.]</p>
<h2>References</h2>
<p>[Chapter-specific references if using footnote style.]</p>`,
  },
  {
    id: "literature-review",
    name: "Literature Review",
    icon: BookOpen,
    description: "Comprehensive review of existing research",
    content: `<h1>Literature Review: [Topic]</h1>
<h2>1. Introduction</h2>
<p>[Define the scope of your review. Explain the significance of the topic. State your review objectives and organization.]</p>
<h2>2. Search Strategy</h2>
<p>[Describe databases and sources searched. Explain inclusion/exclusion criteria. Note the time period covered.]</p>
<h2>3. Thematic Section 1: [Theme Name]</h2>
<p>[Summarize key studies related to this theme. Compare and contrast different findings. Identify consensus and disagreements.]</p>
<h2>4. Thematic Section 2: [Theme Name]</h2>
<p>[Present relevant literature. Analyze methodological approaches. Evaluate quality of evidence.]</p>
<h2>5. Thematic Section 3: [Theme Name]</h2>
<p>[Discuss emerging trends. Note evolving perspectives. Highlight influential works.]</p>
<h2>6. Gaps in Current Research</h2>
<p>[Identify what is missing in the literature. Explain why these gaps matter. Connect to your research questions.]</p>
<h2>7. Conclusion</h2>
<p>[Synthesize main findings. Explain implications for your research. Justify the need for your study.]</p>
<h2>References</h2>
<p></p>`,
  },
  {
    id: "lab-report",
    name: "Lab Report",
    icon: FlaskConical,
    description: "Scientific laboratory report format",
    content: `<h1>Lab Report: [Experiment Title]</h1>
<p><strong>Date:</strong> [Date of experiment]</p>
<p><strong>Course:</strong> [Course name and number]</p>
<p><strong>Instructor:</strong> [Instructor name]</p>
<h2>Abstract</h2>
<p>[Brief summary of the experiment, methods, key results, and conclusions in ~150 words.]</p>
<h2>1. Introduction</h2>
<p>[Explain the scientific background. State the purpose of the experiment. Present your hypothesis.]</p>
<h2>2. Materials and Methods</h2>
<h3>2.1 Materials</h3>
<ul><li>[List all equipment and materials used]</li></ul>
<h3>2.2 Procedure</h3>
<ol><li>[Step-by-step description of what you did]</li><li>[Be specific enough for replication]</li><li>[Include safety precautions taken]</li></ol>
<h2>3. Results</h2>
<p>[Present data in tables and figures. Describe observations objectively. Include calculations and statistical analysis.]</p>
<h2>4. Discussion</h2>
<p>[Interpret your results. Compare with expected outcomes. Explain sources of error. Suggest improvements.]</p>
<h2>5. Conclusion</h2>
<p>[State whether hypothesis was supported. Summarize key findings. Suggest future experiments.]</p>
<h2>References</h2>
<p></p>`,
  },
];

function WritingTemplates({ onApply }) {
  const [selectedTemplate, setSelectedTemplate] = useState(null);

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <FileText className="h-4 w-4 text-primary" />
        <h3 className="text-sm font-medium">Writing Templates</h3>
      </div>
      <p className="text-xs text-muted-foreground">
        Start with a pre-built structure for your document
      </p>
      <div className="space-y-2">
        {WRITING_TEMPLATES.map((template) => (
          <button
            key={template.id}
            onClick={() => setSelectedTemplate(selectedTemplate === template.id ? null : template.id)}
            className={cn(
              "w-full p-3 rounded-lg border text-left transition-all",
              selectedTemplate === template.id
                ? "border-primary bg-primary/5 ring-1 ring-primary"
                : "hover:border-primary/50 hover:bg-muted/50"
            )}
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <template.icon className="h-4 w-4 text-primary" />
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-sm">{template.name}</h4>
                <p className="text-xs text-muted-foreground">{template.description}</p>
              </div>
            </div>
          </button>
        ))}
      </div>
      {selectedTemplate && (
        <Button
          onClick={() => {
            const template = WRITING_TEMPLATES.find(t => t.id === selectedTemplate);
            if (template && onApply) {
              onApply(template.content);
              setSelectedTemplate(null);
              toast.success(`${template.name} template applied!`);
            }
          }}
          className="w-full"
          size="sm"
        >
          <FileText className="h-4 w-4 mr-2" />
          Apply Template
        </Button>
      )}
    </div>
  );
}

function DiffPreview({ original, modified, onAccept, onReject }) {
  return (
    <div className="space-y-3 border rounded-lg p-3 bg-muted/30">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium flex items-center gap-2">
          <Eye className="h-4 w-4" />
          Review Changes
        </span>
        <div className="flex gap-1">
          <Button size="sm" variant="ghost" onClick={onReject} className="h-7 text-destructive">
            <X className="h-4 w-4 mr-1" />
            Reject
          </Button>
          <Button size="sm" onClick={onAccept} className="h-7">
            <Check className="h-4 w-4 mr-1" />
            Accept
          </Button>
        </div>
      </div>
      <div className="grid gap-2">
        <div className="text-xs font-medium text-muted-foreground">Original</div>
        <div className="bg-red-500/10 border border-red-500/20 rounded p-2 text-sm line-through opacity-70">
          {original.length > 200 ? original.slice(0, 200) + "..." : original}
        </div>
        <div className="text-xs font-medium text-muted-foreground">Improved</div>
        <div className="bg-green-500/10 border border-green-500/20 rounded p-2 text-sm">
          {modified.length > 200 ? modified.slice(0, 200) + "..." : modified}
        </div>
      </div>
    </div>
  );
}

function WritingAnalysisPanel({ analysis }) {
  if (!analysis || analysis.wordCount === 0) {
    return (
      <div className="p-4 border rounded-lg bg-muted/20">
        <div className="text-center text-muted-foreground py-4">
          <BarChart3 className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">Start writing to see analysis</p>
        </div>
      </div>
    );
  }

  const getScoreColor = (score) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    if (score >= 40) return "text-orange-600";
    return "text-red-600";
  };

  const getPassiveStatus = (percentage) => {
    if (percentage < 10) return { color: "text-yellow-600", label: "Low (consider adding some)" };
    if (percentage <= 25) return { color: "text-green-600", label: "Good for academic writing" };
    if (percentage <= 40) return { color: "text-yellow-600", label: "Slightly high" };
    return { color: "text-red-600", label: "Too much passive voice" };
  };

  const passiveStatus = getPassiveStatus(analysis.passiveVoice.percentage);

  return (
    <div className="space-y-4">
      <div className="p-4 border rounded-lg bg-muted/20">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Academic Tone Score
          </span>
          <span className={cn("text-2xl font-bold", getScoreColor(analysis.academicToneScore))}>
            {analysis.academicToneScore}
          </span>
        </div>
        <Progress value={analysis.academicToneScore} className="h-2 mb-2" />
        <p className="text-xs text-muted-foreground">
          Based on vocabulary complexity, passive voice usage, and readability
        </p>
      </div>

      <div className="p-4 border rounded-lg bg-muted/20">
        <div className="flex items-center gap-2 mb-3">
          <BookOpen className="h-4 w-4" />
          <span className="text-sm font-medium">Readability</span>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="text-center p-2 bg-background rounded">
            <div className={cn("text-lg font-semibold", analysis.readabilityInfo.color)}>
              {analysis.readingEase}
            </div>
            <div className="text-xs text-muted-foreground">Flesch Score</div>
          </div>
          <div className="text-center p-2 bg-background rounded">
            <div className="text-lg font-semibold">{analysis.gradeLevel}</div>
            <div className="text-xs text-muted-foreground">Grade Level</div>
          </div>
        </div>
        <div className="mt-2 flex items-center justify-between text-xs">
          <span className={analysis.readabilityInfo.color}>{analysis.readabilityInfo.label}</span>
          <span className="text-muted-foreground">{analysis.gradeLevelLabel}</span>
        </div>
      </div>

      <div className="p-4 border rounded-lg bg-muted/20">
        <div className="flex items-center gap-2 mb-3">
          <BarChart3 className="h-4 w-4" />
          <span className="text-sm font-medium">Statistics</span>
        </div>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Words</span>
            <span className="font-medium">{analysis.wordCount}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Sentences</span>
            <span className="font-medium">{analysis.sentenceCount}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Paragraphs</span>
            <span className="font-medium">{analysis.paragraphCount}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Avg. Sentence</span>
            <span className="font-medium">{analysis.avgSentenceLength} words</span>
          </div>
        </div>
      </div>

      <div className="p-4 border rounded-lg bg-muted/20">
        <div className="flex items-center gap-2 mb-3">
          <AlertCircle className="h-4 w-4" />
          <span className="text-sm font-medium">Writing Style</span>
        </div>
        <div className="space-y-3 text-sm">
          <div>
            <div className="flex items-center justify-between mb-1">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger className="flex items-center gap-1 text-muted-foreground">
                    Passive Voice
                    <Info className="h-3 w-3" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-xs max-w-xs">Academic writing often uses 10-25% passive voice. Too little feels informal, too much feels evasive.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <span className={passiveStatus.color}>
                {Math.round(analysis.passiveVoice.percentage)}%
              </span>
            </div>
            <Progress value={analysis.passiveVoice.percentage} className="h-1.5" />
            <p className="text-xs text-muted-foreground mt-1">{passiveStatus.label}</p>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger className="flex items-center gap-1 text-muted-foreground">
                    Complex Words
                    <Info className="h-3 w-3" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-xs max-w-xs">Words with 3+ syllables. Academic writing typically has 15-25%.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <span className="font-medium">
                {Math.round(analysis.complexWords.percentage)}%
              </span>
            </div>
            <Progress value={analysis.complexWords.percentage} className="h-1.5" />
            {analysis.complexWords.words.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {analysis.complexWords.words.slice(0, 5).map((word, i) => (
                  <Badge key={i} variant="secondary" className="text-xs">
                    {word}
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger className="flex items-center gap-1 text-muted-foreground">
                    Hedging Language
                    <Info className="h-3 w-3" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-xs max-w-xs">Words like "might", "perhaps", "possibly". Some hedging is appropriate in academic writing.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <span className="font-medium">
                {analysis.hedgingLanguage.count} uses
              </span>
            </div>
            {analysis.hedgingLanguage.instances.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {analysis.hedgingLanguage.instances.slice(0, 4).map((h, i) => (
                  <Badge key={i} variant="outline" className="text-xs">
                    {h.word} ({h.count})
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="p-4 border rounded-lg bg-muted/20">
        <div className="flex items-center gap-2 mb-3">
          <AlertCircle className="h-4 w-4" />
          <span className="text-sm font-medium">Word Choice</span>
        </div>
        <div className="space-y-3 text-sm">
          {analysis.weakWords?.count > 0 && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger className="flex items-center gap-1 text-muted-foreground">
                      Weak Words
                      <Info className="h-3 w-3" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-xs max-w-xs">Vague words like "very", "really", "thing". Replace with specific, precise language.</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <span className="font-medium text-yellow-600">
                  {analysis.weakWords.count} found
                </span>
              </div>
              <div className="flex flex-wrap gap-1 mt-1">
                {analysis.weakWords.instances.slice(0, 5).map((w, i) => (
                  <Badge key={i} variant="secondary" className="text-xs bg-yellow-500/10 text-yellow-700">
                    {w.word} ({w.count})
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {analysis.informalLanguage?.count > 0 && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger className="flex items-center gap-1 text-muted-foreground">
                      Informal Language
                      <Info className="h-3 w-3" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-xs max-w-xs">Contractions and casual words. Avoid in academic writing.</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <span className="font-medium text-orange-600">
                  {analysis.informalLanguage.count} found
                </span>
              </div>
              <div className="flex flex-wrap gap-1 mt-1">
                {analysis.informalLanguage.instances.slice(0, 5).map((w, i) => (
                  <Badge key={i} variant="secondary" className="text-xs bg-orange-500/10 text-orange-700">
                    {w.word} ({w.count})
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {analysis.repetition?.count > 0 && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger className="flex items-center gap-1 text-muted-foreground">
                      Repeated Words
                      <Info className="h-3 w-3" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-xs max-w-xs">Words used 3+ times. Consider using synonyms for variety.</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <span className="font-medium">
                  {analysis.repetition.count} words
                </span>
              </div>
              <div className="flex flex-wrap gap-1 mt-1">
                {analysis.repetition.instances.slice(0, 5).map((w, i) => (
                  <Badge key={i} variant="outline" className="text-xs">
                    {w.word} ({w.count}x)
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {(!analysis.weakWords?.count && !analysis.informalLanguage?.count && !analysis.repetition?.count) && (
            <p className="text-xs text-muted-foreground text-center py-2">
              No word choice issues detected
            </p>
          )}
        </div>
      </div>

      {analysis.sentenceVariety && analysis.sentenceCount > 2 && (
        <div className="p-4 border rounded-lg bg-muted/20">
          <div className="flex items-center gap-2 mb-3">
            <BarChart3 className="h-4 w-4" />
            <span className="text-sm font-medium">Sentence Variety</span>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Variety Score</span>
              <span className={cn(
                "font-medium",
                analysis.sentenceVariety.varietyScore >= 50 ? "text-green-600" : 
                analysis.sentenceVariety.varietyScore >= 30 ? "text-yellow-600" : "text-orange-600"
              )}>
                {analysis.sentenceVariety.varietyScore}%
              </span>
            </div>
            <Progress value={analysis.sentenceVariety.varietyScore} className="h-1.5" />
            <div className="grid grid-cols-3 gap-2 mt-2 text-xs text-center">
              <div className="p-1 bg-background rounded">
                <div className="font-medium">{analysis.sentenceVariety.shortCount}</div>
                <div className="text-muted-foreground">Short</div>
              </div>
              <div className="p-1 bg-background rounded">
                <div className="font-medium">{analysis.sentenceVariety.mediumCount}</div>
                <div className="text-muted-foreground">Medium</div>
              </div>
              <div className="p-1 bg-background rounded">
                <div className="font-medium">{analysis.sentenceVariety.longCount}</div>
                <div className="text-muted-foreground">Long</div>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Mix sentence lengths for better flow
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

function CitationFormatHelper() {
  const [selectedFormat, setSelectedFormat] = useState("apa");
  
  const formats = {
    apa: {
      name: "APA 7th",
      book: "Author, A. A. (Year). Title of work: Capital letter also for subtitle. Publisher.",
      journal: "Author, A. A., & Author, B. B. (Year). Title of article. Title of Periodical, volume(issue), page–page. https://doi.org/xxxxx",
      website: "Author, A. A. (Year, Month Day). Title of page. Site Name. URL",
    },
    mla: {
      name: "MLA 9th",
      book: "Author Last, First. Title of Book. Publisher, Year.",
      journal: "Author Last, First. \"Title of Article.\" Journal Name, vol. #, no. #, Year, pp. #-#.",
      website: "Author Last, First. \"Title of Page.\" Website Name, Publisher, Day Month Year, URL.",
    },
    chicago: {
      name: "Chicago 17th",
      book: "Last, First. Title of Book. Place: Publisher, Year.",
      journal: "Last, First. \"Article Title.\" Journal Name Volume, no. Issue (Year): pages.",
      website: "Last, First. \"Page Title.\" Website Name. Last modified Month Day, Year. URL.",
    },
  };

  const current = formats[selectedFormat];

  return (
    <div className="p-4 border rounded-lg bg-muted/20">
      <div className="flex items-center gap-2 mb-3">
        <BookOpen className="h-4 w-4" />
        <span className="text-sm font-medium">Citation Formats</span>
      </div>
      <div className="flex gap-1 mb-3">
        {Object.entries(formats).map(([key, format]) => (
          <button
            key={key}
            onClick={() => setSelectedFormat(key)}
            className={cn(
              "px-2 py-1 text-xs rounded transition-colors",
              selectedFormat === key
                ? "bg-primary text-primary-foreground"
                : "bg-muted hover:bg-muted/80"
            )}
          >
            {format.name}
          </button>
        ))}
      </div>
      <div className="space-y-2 text-xs">
        <div className="p-2 bg-background rounded">
          <div className="font-medium text-muted-foreground mb-1">Book</div>
          <div className="font-mono text-[10px] break-all">{current.book}</div>
        </div>
        <div className="p-2 bg-background rounded">
          <div className="font-medium text-muted-foreground mb-1">Journal</div>
          <div className="font-mono text-[10px] break-all">{current.journal}</div>
        </div>
        <div className="p-2 bg-background rounded">
          <div className="font-medium text-muted-foreground mb-1">Website</div>
          <div className="font-mono text-[10px] break-all">{current.website}</div>
        </div>
      </div>
    </div>
  );
}

function CitationLookup({ onSave, onInsert, citationFormat, onFormatChange, checkLimit, trackUsage, onLimitReached }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [savedIndex, setSavedIndex] = useState(null);
  const [insertedIndex, setInsertedIndex] = useState(null);

  const handleSearch = async () => {
    if (!query.trim() || query.length < 3) return;
    
    if (checkLimit && !checkLimit("citations")) {
      onLimitReached?.("citations");
      return;
    }
    
    setIsSearching(true);
    try {
      const searchResults = await searchAll(query);
      setResults(searchResults);
      trackUsage?.("citations");
    } catch (error) {
      toast.error("Failed to search citations");
    } finally {
      setIsSearching(false);
    }
  };

  const handleCopy = async (item, index) => {
    const formatted = formatCitation(item, citationFormat);
    try {
      await navigator.clipboard.writeText(formatted);
      setCopiedIndex(index);
      toast.success("Citation copied!");
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch {
      toast.error("Failed to copy");
    }
  };

  const handleSave = (item, index) => {
    if (onSave) {
      const wasAdded = onSave(item);
      if (wasAdded) {
        setSavedIndex(index);
        setTimeout(() => setSavedIndex(null), 2000);
      }
    }
  };

  const handleInsert = (item, index) => {
    if (onInsert) {
      const formatted = formatCitation(item, citationFormat);
      onInsert(formatted);
      setInsertedIndex(index);
      setTimeout(() => setInsertedIndex(null), 2000);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <div className="p-4 border rounded-lg bg-muted/20">
      <div className="flex items-center gap-2 mb-3">
        <Search className="h-4 w-4" />
        <span className="text-sm font-medium">Citation Lookup</span>
      </div>
      <p className="text-xs text-muted-foreground mb-3">
        Search by title, author, DOI, or ISBN
      </p>
      <div className="flex gap-2 mb-3">
        <Input
          placeholder="Enter DOI, ISBN, or search term..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          className="text-sm h-8"
        />
        <Button
          size="sm"
          onClick={handleSearch}
          disabled={isSearching || query.length < 3}
          className="h-8 px-3"
        >
          {isSearching ? (
            <Loader2 className="h-3 w-3 animate-spin" />
          ) : (
            <Search className="h-3 w-3" />
          )}
        </Button>
      </div>
      
      <div className="flex gap-1 mb-3">
        {["apa", "mla", "chicago"].map((format) => (
          <button
            key={format}
            onClick={() => onFormatChange?.(format)}
            className={cn(
              "px-2 py-0.5 text-[10px] rounded transition-colors uppercase",
              citationFormat === format
                ? "bg-primary text-primary-foreground"
                : "bg-muted hover:bg-muted/80"
            )}
          >
            {format}
          </button>
        ))}
      </div>

      {results.length > 0 && (
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {results.map((item, index) => (
            <div
              key={index}
              className="p-2 bg-background rounded border text-xs group hover:border-primary/50 transition-colors"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{item.title}</div>
                  <div className="text-muted-foreground truncate">
                    {item.authors?.map((a) => `${a.family}`).join(", ")} 
                    {item.year ? ` (${item.year})` : ""}
                  </div>
                  <div className="text-[10px] text-muted-foreground mt-1">
                    {item.type === "book" ? "📚 Book" : "📄 Article"}
                    {item.journal && ` • ${item.journal}`}
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleInsert(item, index)}
                    className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Insert into document"
                  >
                    {insertedIndex === index ? (
                      <Check className="h-3 w-3 text-green-500" />
                    ) : (
                      <FileText className="h-3 w-3" />
                    )}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleSave(item, index)}
                    className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Add to references"
                  >
                    {savedIndex === index ? (
                      <Check className="h-3 w-3 text-green-500" />
                    ) : (
                      <Plus className="h-3 w-3" />
                    )}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleCopy(item, index)}
                    className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Copy citation"
                  >
                    {copiedIndex === index ? (
                      <Check className="h-3 w-3 text-green-500" />
                    ) : (
                      <Copy className="h-3 w-3" />
                    )}
                  </Button>
                </div>
              </div>
              {item.doi && (
                <a
                  href={`https://doi.org/${item.doi}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[10px] text-primary hover:underline mt-1"
                >
                  <ExternalLink className="h-2.5 w-2.5" />
                  DOI
                </a>
              )}
            </div>
          ))}
        </div>
      )}

      {results.length === 0 && query.length >= 3 && !isSearching && (
        <p className="text-xs text-muted-foreground text-center py-2">
          No results found. Try a different search term.
        </p>
      )}
    </div>
  );
}

function ReferenceListPanel({ references, onRemove, onInsert, citationFormat, onCopyAll }) {
  const [insertedIndex, setInsertedIndex] = useState(null);
  
  const handleCopy = async (item) => {
    const formatted = formatCitation(item, citationFormat);
    try {
      await navigator.clipboard.writeText(formatted);
      toast.success("Citation copied!");
    } catch {
      toast.error("Failed to copy");
    }
  };

  const handleInsert = (item, index) => {
    if (onInsert) {
      const formatted = formatCitation(item, citationFormat);
      onInsert(formatted);
      setInsertedIndex(index);
      setTimeout(() => setInsertedIndex(null), 2000);
    }
  };

  if (references.length === 0) {
    return (
      <div className="p-4 border rounded-lg bg-muted/20">
        <div className="flex items-center gap-2 mb-2">
          <ListIcon className="h-4 w-4" />
          <span className="text-sm font-medium">Reference List</span>
        </div>
        <p className="text-xs text-muted-foreground text-center py-3">
          No references saved yet. Use Citation Lookup to find and save sources.
        </p>
      </div>
    );
  }

  return (
    <div className="p-4 border rounded-lg bg-muted/20">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <ListIcon className="h-4 w-4" />
          <span className="text-sm font-medium">Reference List</span>
          <Badge variant="secondary" className="text-[10px]">
            {references.length}
          </Badge>
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={onCopyAll}
          className="h-6 text-[10px] px-2"
        >
          <Copy className="h-3 w-3 mr-1" />
          Copy All
        </Button>
      </div>
      <div className="space-y-2 max-h-48 overflow-y-auto">
        {references.map((item, index) => (
          <div
            key={index}
            className="p-2 bg-background rounded border text-xs group hover:border-primary/50 transition-colors"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <div className="font-medium truncate">{item.title}</div>
                <div className="text-muted-foreground truncate">
                  {item.authors?.map((a) => `${a.family}`).join(", ")} 
                  {item.year ? ` (${item.year})` : ""}
                </div>
              </div>
              <div className="flex gap-1">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleInsert(item, index)}
                  className="h-5 w-5 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Insert into document"
                >
                  {insertedIndex === index ? (
                    <Check className="h-2.5 w-2.5 text-green-500" />
                  ) : (
                    <FileText className="h-2.5 w-2.5" />
                  )}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleCopy(item)}
                  className="h-5 w-5 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Copy citation"
                >
                  <Copy className="h-2.5 w-2.5" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onRemove(index)}
                  className="h-5 w-5 p-0 opacity-0 group-hover:opacity-100 transition-opacity text-destructive"
                  title="Remove"
                >
                  <Trash2 className="h-2.5 w-2.5" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function PlagiarismCheckPanel({ result, isChecking, error, onRetry }) {
  const getScoreColor = (score) => {
    if (score === null || score === undefined) return "bg-muted";
    if (score <= 10) return "bg-green-500";
    if (score <= 25) return "bg-yellow-500";
    return "bg-red-500";
  };

  const getScoreLabel = (score) => {
    if (score === null || score === undefined) return "Not checked";
    if (score <= 10) return "Original";
    if (score <= 25) return "Some matches found";
    return "High similarity";
  };

  const score = result?.score ?? null;

  return (
    <div className="p-4 border rounded-lg bg-muted/20">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium flex items-center gap-2">
          <FileSearch className="h-4 w-4" />
          Plagiarism Check
        </span>
        {isChecking && <Loader2 className="h-4 w-4 animate-spin" />}
      </div>
      
      {error ? (
        <div className="space-y-2">
          <p className="text-xs text-destructive">{error}</p>
          <Button size="sm" variant="outline" onClick={onRetry} className="w-full">
            <RefreshCw className="h-3 w-3 mr-1" />
            Retry
          </Button>
        </div>
      ) : (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Similarity</span>
            <span className={cn(
              "font-medium",
              score !== null && score <= 10 && "text-green-600",
              score !== null && score > 10 && score <= 25 && "text-yellow-600",
              score !== null && score > 25 && "text-red-600"
            )}>
              {score !== null ? `${score}%` : "—"}
            </span>
          </div>
          <Progress value={score || 0} className="h-2" />
          <div className="flex items-center gap-1 text-xs">
            <div className={cn("w-2 h-2 rounded-full", getScoreColor(score))} />
            <span className="text-muted-foreground">{getScoreLabel(score)}</span>
          </div>
          
          {result?.sections && result.sections.length > 0 && (
            <div className="mt-3 pt-3 border-t">
              <p className="text-xs font-medium mb-2">Matches ({result.sections.length})</p>
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {result.sections.slice(0, 5).map((section, i) => (
                  <div key={i} className="flex items-center justify-between text-xs p-1.5 bg-background rounded">
                    <span className="truncate flex-1 text-muted-foreground">
                      {section.source || section.sourceUrl || "Source"}
                    </span>
                    <span className={cn(
                      "font-medium ml-2",
                      section.similarityScore <= 25 ? "text-yellow-600" : "text-red-600"
                    )}>
                      {section.similarityScore || 0}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function AIScorePanel({ aiScore, isScanning }) {
  const getScoreColor = (score) => {
    if (score === null) return "bg-muted";
    if (score <= 20) return "bg-green-500";
    if (score <= 50) return "bg-yellow-500";
    return "bg-red-500";
  };

  const getScoreLabel = (score) => {
    if (score === null) return "Not scanned";
    if (score <= 20) return "Likely Human";
    if (score <= 50) return "Mixed";
    return "Likely AI";
  };

  return (
    <div className="p-4 border rounded-lg bg-muted/20">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium flex items-center gap-2">
          <FlaskConical className="h-4 w-4" />
          AI Detection
        </span>
        {isScanning && <Loader2 className="h-4 w-4 animate-spin" />}
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">AI Probability</span>
          <span className={cn(
            "font-medium",
            aiScore !== null && aiScore <= 20 && "text-green-600",
            aiScore !== null && aiScore > 20 && aiScore <= 50 && "text-yellow-600",
            aiScore !== null && aiScore > 50 && "text-red-600"
          )}>
            {aiScore !== null ? `${aiScore}%` : "—"}
          </span>
        </div>
        <Progress value={aiScore || 0} className="h-2" />
        <div className="flex items-center gap-1 text-xs">
          <div className={cn("w-2 h-2 rounded-full", getScoreColor(aiScore))} />
          <span className="text-muted-foreground">{getScoreLabel(aiScore)}</span>
        </div>
      </div>
    </div>
  );
}

export default function WritingStudioContent() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [selectedTool, setSelectedTool] = useState(null);
  const [selectedMode, setSelectedMode] = useState("Fluency");
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedText, setSelectedText] = useState("");
  const [processedResult, setProcessedResult] = useState("");
  const [originalText, setOriginalText] = useState("");
  const [wordCount, setWordCount] = useState(0);
  const [showDiff, setShowDiff] = useState(false);
  const [aiScore, setAiScore] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [textAnalysis, setTextAnalysis] = useState(null);
  const [savedReferences, setSavedReferences] = useState([]);
  const [citationFormat, setCitationFormat] = useState("apa");
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [upgradeLimitType, setUpgradeLimitType] = useState("ai_actions");
  const [isCheckingPlagiarism, setIsCheckingPlagiarism] = useState(false);
  const [plagiarismResult, setPlagiarismResult] = useState(null);
  const [plagiarismError, setPlagiarismError] = useState(null);
  const selectionRef = useRef({ from: 0, to: 0 });
  const analysisTimeoutRef = useRef(null);

  const {
    isPro,
    isAuthenticated,
    checkFeatureAccess,
    refetchAll,
    paraphraseLimits,
    humanizeLimits,
  } = useWritingStudioLimits();

  useEffect(() => {
    const hasSeenTour = localStorage.getItem("writing-studio-onboarding");
    if (!hasSeenTour) {
      setTimeout(() => setShowOnboarding(true), 1000);
    }
  }, []);

  const checkLimit = useCallback((type) => {
    const featureMap = {
      ai_actions: "paraphrase",
      citations: "citations",
      ai_scans: "ai_detector",
      plagiarism: "plagiarism",
    };
    const feature = featureMap[type] || type;
    const access = checkFeatureAccess(feature);
    return access.allowed;
  }, [checkFeatureAccess]);

  const trackUsage = useCallback((type) => {
    refetchAll();
  }, [refetchAll]);

  const [paraphrase] = useParaphrasedMutation();
  const [humanize] = useHumanizeContendMutation();
  const [grammarCheck] = useSpellCheckerMutation();
  const [scanAi] = useScanAidetectorMutation();

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
        link: false,
      }),
      Placeholder.configure({
        placeholder: "Start writing your paper, thesis, or research here...",
      }),
      Highlight.configure({ multicolor: true }),
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-primary underline cursor-pointer",
        },
      }),
    ],
    content: "",
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class:
          "prose prose-sm sm:prose-base max-w-none focus:outline-none min-h-[400px] px-4 py-3",
      },
    },
    onUpdate: ({ editor }) => {
      const text = editor.getText();
      const words = text.trim() ? text.trim().split(/\s+/).length : 0;
      setWordCount(words);
      
      if (analysisTimeoutRef.current) {
        clearTimeout(analysisTimeoutRef.current);
      }
      analysisTimeoutRef.current = setTimeout(() => {
        const analysis = getFullAnalysis(text);
        setTextAnalysis(analysis);
      }, 500);
    },
    onSelectionUpdate: ({ editor }) => {
      const { from, to } = editor.state.selection;
      selectionRef.current = { from, to };
      if (from !== to) {
        const text = editor.state.doc.textBetween(from, to, " ");
        setSelectedText(text);
      } else {
        setSelectedText("");
      }
    },
  });

  const handleToolSelect = (toolId) => {
    if (!user) {
      dispatch(setShowLoginModal(true));
      return;
    }
    setSelectedTool(toolId);
    setProcessedResult("");
    setShowDiff(false);
  };

  const getTextToProcess = useCallback(() => {
    const { from, to } = selectionRef.current;
    if (from !== to && editor) {
      return editor.state.doc.textBetween(from, to, " ");
    }
    if (selectedText) return selectedText;
    return editor?.getText() || "";
  }, [selectedText, editor]);

  const handleProcess = async (toolOverride = null) => {
    const tool = toolOverride || selectedTool;
    if (!tool) {
      toast.error("Please select an AI tool first");
      return;
    }

    const text = getTextToProcess();
    if (!text.trim()) {
      toast.error("Please enter or select some text first");
      return;
    }

    if (!user) {
      dispatch(setShowLoginModal(true));
      return;
    }

    const toolFeatureMap = {
      paraphrase: "paraphrase",
      grammar: "grammar",
      summarize: "summarize",
      humanize: "humanize",
    };
    const feature = toolFeatureMap[tool] || "paraphrase";
    const access = checkFeatureAccess(feature);
    
    if (!access.allowed) {
      const limitTypeMap = {
        login_required: "ai_actions",
        word_limit_reached: "ai_actions",
        pro_required: "ai_actions",
      };
      setUpgradeLimitType(limitTypeMap[access.reason] || "ai_actions");
      
      if (access.reason === "login_required") {
        dispatch(setShowLoginModal(true));
      } else {
        setShowUpgradeModal(true);
      }
      return;
    }

    if (toolOverride) {
      setSelectedTool(toolOverride);
    }

    setIsProcessing(true);
    setProcessedResult("");
    setOriginalText(text);
    setShowDiff(false);

    try {
      let result;
      let processedText = "";

      switch (tool) {
        case "paraphrase":
          result = await paraphrase({
            text,
            mode: selectedMode,
            synonymLevel: 40,
          }).unwrap();
          processedText = result?.data?.paraphrased_text || result?.paraphrased_text || "";
          break;

        case "humanize":
          result = await humanize({
            text,
            readability: "University",
            purpose: "Academic Writing",
          }).unwrap();
          processedText = result?.data?.humanized_text || result?.humanized_text || "";
          break;

        case "grammar":
          result = await grammarCheck({
            text,
            language: "en-US",
          }).unwrap();
          processedText = result?.data?.corrected_text || result?.corrected_text || result?.text || "";
          break;

        case "summarize":
          result = await paraphrase({
            text,
            mode: "Shorten",
            synonymLevel: 20,
          }).unwrap();
          processedText = result?.data?.paraphrased_text || result?.paraphrased_text || "";
          break;

        default:
          toast.error("Please select an AI tool first");
          return;
      }

      if (processedText) {
        setProcessedResult(processedText);
        setShowDiff(true);
        trackUsage("ai_actions");
        toast.success("Text enhanced! Review the changes below.");
      } else {
        toast.error("No result received. Please try again.");
      }
    } catch (error) {
      console.error("Processing error:", error);
      const errorMessage = error?.data?.message || error?.message || "Failed to process text. Please try again.";
      toast.error(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAcceptChanges = () => {
    if (!processedResult || !editor) return;

    const { from, to } = selectionRef.current;
    if (selectedText && from !== to) {
      editor.chain().focus().deleteRange({ from, to }).insertContent(processedResult).run();
    } else {
      editor.commands.setContent(`<p>${processedResult}</p>`);
    }
    setProcessedResult("");
    setOriginalText("");
    setSelectedText("");
    setShowDiff(false);
    toast.success("Changes applied!");
  };

  const handleRejectChanges = () => {
    setProcessedResult("");
    setOriginalText("");
    setShowDiff(false);
    toast.info("Changes rejected");
  };

  const handleCopyResult = () => {
    if (!processedResult) return;
    navigator.clipboard.writeText(processedResult);
    toast.success("Copied to clipboard!");
  };

  const handleScanForAI = async () => {
    const text = editor?.getText() || "";
    if (!text.trim() || text.trim().split(/\s+/).length < 50) {
      toast.error("Please write at least 50 words before scanning");
      return;
    }

    const access = checkFeatureAccess("ai_detector");
    if (!access.allowed) {
      if (access.reason === "login_required") {
        dispatch(setShowLoginModal(true));
      } else {
        setUpgradeLimitType("ai_scan");
        setShowUpgradeModal(true);
      }
      return;
    }

    setIsScanning(true);
    try {
      const result = await scanAi({ text }).unwrap();
      const score = result?.data?.ai_percentage || result?.ai_percentage || 0;
      setAiScore(Math.round(score));
      trackUsage("ai_scans");
      toast.success("Scan complete!");
    } catch (error) {
      console.error("Scan error:", error);
      toast.error("Failed to scan. Please try again.");
    } finally {
      setIsScanning(false);
    }
  };

  const handleCheckPlagiarism = async () => {
    const text = editor?.getText() || "";
    if (!text.trim() || text.trim().split(/\s+/).length < 50) {
      toast.error("Please write at least 50 words before checking");
      return;
    }

    const access = checkFeatureAccess("plagiarism");
    if (!access.allowed) {
      if (access.reason === "login_required") {
        dispatch(setShowLoginModal(true));
      } else {
        setUpgradeLimitType("plagiarism");
        setShowUpgradeModal(true);
      }
      return;
    }

    setIsCheckingPlagiarism(true);
    setPlagiarismError(null);
    
    try {
      const result = await analyzePlagiarism({ text });
      setPlagiarismResult(result);
      trackUsage("plagiarism");
      toast.success("Plagiarism check complete!");
    } catch (error) {
      console.error("Plagiarism check error:", error);
      const errorMessage = error?.message || "Failed to check plagiarism. Please try again.";
      setPlagiarismError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsCheckingPlagiarism(false);
    }
  };

  const handleSetLink = () => {
    if (!linkUrl) {
      editor?.chain().focus().unsetLink().run();
      setShowLinkInput(false);
      return;
    }
    editor?.chain().focus().setLink({ href: linkUrl }).run();
    setShowLinkInput(false);
    setLinkUrl("");
  };

  const handleExport = async (format, includeRefs = true) => {
    const exportFeature = format === "docx" ? "export_docx" : format === "html" ? "export_html" : "export_txt";
    const access = checkFeatureAccess(exportFeature);
    
    if (!access.allowed) {
      setUpgradeLimitType("export");
      setShowUpgradeModal(true);
      return;
    }

    const content = editor?.getHTML() || "";
    const text = editor?.getText() || "";
    
    let referencesText = "";
    let referencesHtml = "";
    
    if (includeRefs && savedReferences.length > 0) {
      referencesText = "\n\n---\n\nReferences\n\n" + 
        savedReferences.map(ref => formatCitation(ref, citationFormat)).join("\n\n");
      referencesHtml = `<hr><h2>References</h2>` + 
        savedReferences.map(ref => `<p>${formatCitation(ref, citationFormat)}</p>`).join("");
    }

    if (format === "txt") {
      const blob = new Blob([text + referencesText], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "document.txt";
      a.click();
      URL.revokeObjectURL(url);
    } else if (format === "html") {
      const fullHtml = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Document</title><style>body{font-family:Georgia,serif;max-width:800px;margin:40px auto;padding:20px;line-height:1.6}h1,h2,h3{margin-top:1.5em}p{margin:1em 0}</style></head><body>${content}${referencesHtml}</body></html>`;
      const blob = new Blob([fullHtml], { type: "text/html" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "document.html";
      a.click();
      URL.revokeObjectURL(url);
    } else if (format === "docx") {
      try {
        const { Document, Packer, Paragraph, TextRun, HeadingLevel } = await import("docx");
        
        const extractTextRuns = (node, TextRun, inheritBold = false, inheritItalic = false) => {
          const runs = [];
          
          const processChild = (child, bold = inheritBold, italic = inheritItalic) => {
            if (child.nodeType === Node.TEXT_NODE) {
              const text = child.textContent;
              if (text) {
                runs.push(new TextRun({ text, bold, italics: italic }));
              }
            } else if (child.nodeType === Node.ELEMENT_NODE) {
              const tag = child.tagName.toLowerCase();
              const isBold = bold || tag === "strong" || tag === "b";
              const isItalic = italic || tag === "em" || tag === "i";
              
              if (tag === "a") {
                runs.push(new TextRun({ text: child.textContent, bold, italics: italic }));
              } else {
                child.childNodes.forEach(c => processChild(c, isBold, isItalic));
              }
            }
          };
          
          node.childNodes.forEach(child => processChild(child));
          return runs.length > 0 ? runs : [new TextRun(node.textContent || "")];
        };
        
        const htmlToDocxElements = (html) => {
          const elements = [];
          const div = document.createElement("div");
          div.innerHTML = html;
          
          const processNode = (node) => {
            if (node.nodeType !== Node.ELEMENT_NODE) return;
            
            const tag = node.tagName.toLowerCase();
            
            if (tag === "h1") {
              elements.push(new Paragraph({ 
                children: extractTextRuns(node, TextRun),
                heading: HeadingLevel.HEADING_1 
              }));
            } else if (tag === "h2") {
              elements.push(new Paragraph({ 
                children: extractTextRuns(node, TextRun),
                heading: HeadingLevel.HEADING_2 
              }));
            } else if (tag === "h3") {
              elements.push(new Paragraph({ 
                children: extractTextRuns(node, TextRun),
                heading: HeadingLevel.HEADING_3 
              }));
            } else if (tag === "p") {
              elements.push(new Paragraph({ children: extractTextRuns(node, TextRun) }));
            } else if (tag === "ul") {
              let idx = 0;
              node.querySelectorAll(":scope > li").forEach(li => {
                idx++;
                elements.push(new Paragraph({ 
                  children: [new TextRun("• "), ...extractTextRuns(li, TextRun)]
                }));
              });
            } else if (tag === "ol") {
              let idx = 0;
              node.querySelectorAll(":scope > li").forEach(li => {
                idx++;
                elements.push(new Paragraph({ 
                  children: [new TextRun(`${idx}. `), ...extractTextRuns(li, TextRun)]
                }));
              });
            } else if (tag === "blockquote") {
              elements.push(new Paragraph({ 
                children: extractTextRuns(node, TextRun, false, true),
                indent: { left: 720 }
              }));
            } else if (tag === "hr") {
              elements.push(new Paragraph({ text: "—".repeat(40) }));
            } else if (tag === "br") {
              elements.push(new Paragraph({ text: "" }));
            } else {
              node.childNodes.forEach(child => {
                if (child.nodeType === Node.ELEMENT_NODE) {
                  processNode(child);
                }
              });
            }
          };
          
          div.childNodes.forEach(child => processNode(child));
          return elements;
        };
        
        const docElements = htmlToDocxElements(content + referencesHtml);
        
        const doc = new Document({
          sections: [{
            properties: {},
            children: docElements.length > 0 ? docElements : [new Paragraph({ text: text })]
          }]
        });
        
        const blob = await Packer.toBlob(doc);
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "document.docx";
        a.click();
        URL.revokeObjectURL(url);
      } catch (err) {
        console.error("DOCX export error:", err);
        toast.error("Failed to export DOCX");
        return;
      }
    }
    toast.success(`Exported as ${format.toUpperCase()}${includeRefs && savedReferences.length > 0 ? " with references" : ""}`);
  };

  return (
    <div className="container mx-auto max-w-7xl px-4 py-6">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <GraduationCap className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold text-primary">Academic Writing Studio</h1>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowOnboarding(true)}
            className="gap-2"
          >
            <HelpCircle className="h-4 w-4" />
            Take a Tour
          </Button>
        </div>
        <p className="text-muted-foreground">
          Write, critique, and enhance your papers, theses, and research with AI-powered tools
        </p>
      </div>

      {showOnboarding && (
        <WritingStudioOnboarding
          onComplete={() => setShowOnboarding(false)}
          onLoadSample={(content) => {
            if (editor) {
              const currentContent = editor.getText().trim();
              if (!currentContent || currentContent.length < 10) {
                editor.commands.setContent(content);
              }
            }
          }}
        />
      )}

      <WritingStudioUpgradeModal 
        open={showUpgradeModal} 
        onClose={() => setShowUpgradeModal(false)}
        limitType={upgradeLimitType}
      />

      {!isPro && paraphraseLimits && paraphraseLimits.totalWordLimit !== 99999 && (
        <div className="mb-4">
          <UsageLimitBanner 
            used={paraphraseLimits.totalWordLimit - paraphraseLimits.remainingWord} 
            limit={paraphraseLimits.totalWordLimit} 
            type="words"
          />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="overflow-hidden">
            <div className="border-b bg-muted/30 px-4 py-2 flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-1 flex-wrap">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => editor?.chain().focus().toggleBold().run()}
                  className={cn("h-8 w-8", editor?.isActive("bold") && "bg-muted")}
                >
                  <Bold className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => editor?.chain().focus().toggleItalic().run()}
                  className={cn("h-8 w-8", editor?.isActive("italic") && "bg-muted")}
                >
                  <Italic className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => editor?.chain().focus().toggleUnderline().run()}
                  className={cn("h-8 w-8", editor?.isActive("underline") && "bg-muted")}
                >
                  <UnderlineIcon className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => editor?.chain().focus().toggleStrike().run()}
                  className={cn("h-8 w-8", editor?.isActive("strike") && "bg-muted")}
                >
                  <Strikethrough className="h-4 w-4" />
                </Button>
                <Separator orientation="vertical" className="h-6 mx-1" />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    if (editor?.isActive("link")) {
                      editor?.chain().focus().unsetLink().run();
                    } else {
                      setShowLinkInput(true);
                    }
                  }}
                  className={cn("h-8 w-8", editor?.isActive("link") && "bg-muted")}
                >
                  {editor?.isActive("link") ? <Unlink className="h-4 w-4" /> : <LinkIcon className="h-4 w-4" />}
                </Button>
                <Separator orientation="vertical" className="h-6 mx-1" />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => editor?.chain().focus().setTextAlign("left").run()}
                  className={cn("h-8 w-8", editor?.isActive({ textAlign: "left" }) && "bg-muted")}
                >
                  <AlignLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => editor?.chain().focus().setTextAlign("center").run()}
                  className={cn("h-8 w-8", editor?.isActive({ textAlign: "center" }) && "bg-muted")}
                >
                  <AlignCenter className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => editor?.chain().focus().setTextAlign("right").run()}
                  className={cn("h-8 w-8", editor?.isActive({ textAlign: "right" }) && "bg-muted")}
                >
                  <AlignRight className="h-4 w-4" />
                </Button>
                <Separator orientation="vertical" className="h-6 mx-1" />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => editor?.chain().focus().toggleBulletList().run()}
                  className={cn("h-8 w-8", editor?.isActive("bulletList") && "bg-muted")}
                >
                  <List className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => editor?.chain().focus().toggleOrderedList().run()}
                  className={cn("h-8 w-8", editor?.isActive("orderedList") && "bg-muted")}
                >
                  <ListOrdered className="h-4 w-4" />
                </Button>
                <Separator orientation="vertical" className="h-6 mx-1" />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => editor?.chain().focus().undo().run()}
                  disabled={!editor?.can().undo()}
                  className="h-8 w-8"
                >
                  <Undo className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => editor?.chain().focus().redo().run()}
                  disabled={!editor?.can().redo()}
                  className="h-8 w-8"
                >
                  <Redo className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="gap-1">
                  <Type className="h-3 w-3" />
                  {wordCount} words
                </Badge>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="gap-1" id="writing-studio-export">
                      <FileDown className="h-4 w-4" />
                      Export
                      <ChevronDown className="h-3 w-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleExport("docx")}>
                      <FileText className="h-4 w-4 mr-2" />
                      Word Document (.docx)
                      {!isPro && <Badge variant="outline" className="ml-auto text-xs">Pro</Badge>}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleExport("html")}>
                      <FileText className="h-4 w-4 mr-2" />
                      HTML File (.html)
                      {!isPro && <Badge variant="outline" className="ml-auto text-xs">Pro</Badge>}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleExport("txt")}>
                      <FileText className="h-4 w-4 mr-2" />
                      Plain Text (.txt)
                    </DropdownMenuItem>
                    {savedReferences.length > 0 && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-xs text-muted-foreground" disabled>
                          {savedReferences.length} reference{savedReferences.length > 1 ? "s" : ""} will be included
                        </DropdownMenuItem>
                      </>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {showLinkInput && (
              <div className="border-b bg-muted/20 px-4 py-2 flex items-center gap-2">
                <input
                  type="url"
                  placeholder="Enter URL..."
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  className="flex-1 bg-background border rounded px-2 py-1 text-sm"
                  onKeyDown={(e) => e.key === "Enter" && handleSetLink()}
                />
                <Button size="sm" onClick={handleSetLink}>Apply</Button>
                <Button size="sm" variant="ghost" onClick={() => setShowLinkInput(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}

            {editor && (
              <BubbleMenu editor={editor}>
                <div className="flex items-center gap-1 bg-popover border rounded-lg shadow-lg p-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 px-2 text-xs"
                    onClick={() => handleProcess("paraphrase")}
                    disabled={isProcessing}
                  >
                    <RefreshCw className="h-3 w-3 mr-1" />
                    Paraphrase
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 px-2 text-xs"
                    onClick={() => handleProcess("grammar")}
                    disabled={isProcessing}
                  >
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    Fix Grammar
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 px-2 text-xs"
                    onClick={() => handleProcess("humanize")}
                    disabled={isProcessing}
                  >
                    <Bot className="h-3 w-3 mr-1" />
                    Humanize
                  </Button>
                </div>
              </BubbleMenu>
            )}

            <EditorContent editor={editor} className="min-h-[500px]" id="writing-studio-editor" />

            {selectedText && !showDiff && (
              <div className="border-t bg-primary/5 px-4 py-2 flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  <Sparkles className="h-4 w-4 inline mr-1 text-primary" />
                  {selectedText.split(/\s+/).length} words selected
                </span>
                <span className="text-xs text-muted-foreground">
                  Use the floating menu or sidebar tools to enhance
                </span>
              </div>
            )}
          </Card>
        </div>

        <div className="lg:col-span-1">
          <Card className="sticky top-4">
            <Tabs defaultValue="actions" className="w-full">
              <TabsList className="w-full grid grid-cols-2">
                <TabsTrigger value="actions" className="gap-1" id="writing-studio-ai-tools">
                  <Wand2 className="h-4 w-4" />
                  AI Actions
                </TabsTrigger>
                <TabsTrigger value="review" className="gap-1" id="writing-studio-review-tab">
                  <FileSearch className="h-4 w-4" />
                  Review
                </TabsTrigger>
              </TabsList>

              <TabsContent value="actions" className="m-0">
                <ScrollArea className="h-[550px]">
                  <div className="p-4 space-y-3">
                    <p className="text-sm text-muted-foreground">
                      {selectedText ? "Apply to selected text" : "Apply to entire document"}
                    </p>

                    {AI_TOOLS.map((tool) => (
                      <button
                        key={tool.id}
                        onClick={() => handleToolSelect(tool.id)}
                        className={cn(
                          "w-full p-3 rounded-lg border text-left transition-all",
                          selectedTool === tool.id
                            ? "border-primary bg-primary/5 ring-1 ring-primary"
                            : "hover:border-primary/50 hover:bg-muted/50"
                        )}
                      >
                        <div className="flex items-start gap-3">
                          <div className={cn("p-2 rounded-lg", tool.bgColor)}>
                            <tool.icon className={cn("h-4 w-4", tool.color)} />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-medium text-sm">{tool.name}</h3>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {tool.description}
                            </p>
                          </div>
                        </div>
                      </button>
                    ))}

                    {selectedTool === "paraphrase" && (
                      <div className="pt-2 border-t">
                        <p className="text-xs font-medium mb-2">Paraphrase Mode</p>
                        <div className="grid grid-cols-2 gap-1.5">
                          {PARAPHRASE_MODES.map((mode) => (
                            <TooltipProvider key={mode.id}>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <button
                                    onClick={() => setSelectedMode(mode.id)}
                                    className={cn(
                                      "p-2 rounded border text-xs transition-all text-center",
                                      selectedMode === mode.id
                                        ? "border-primary bg-primary/10 text-primary font-medium"
                                        : "hover:border-primary/50 hover:bg-muted/50"
                                    )}
                                  >
                                    {mode.name}
                                  </button>
                                </TooltipTrigger>
                                <TooltipContent side="top" className="text-xs">
                                  {mode.description}
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          ))}
                        </div>
                      </div>
                    )}

                    {selectedTool && (
                      <Button
                        onClick={handleProcess}
                        disabled={isProcessing}
                        className="w-full"
                        size="lg"
                      >
                        {isProcessing ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Processing...
                          </>
                        ) : (
                          <>
                            <Sparkles className="h-4 w-4 mr-2" />
                            Enhance Text
                          </>
                        )}
                      </Button>
                    )}

                    {showDiff && processedResult && (
                      <DiffPreview
                        original={originalText}
                        modified={processedResult}
                        onAccept={handleAcceptChanges}
                        onReject={handleRejectChanges}
                      />
                    )}

                    {!selectedTool && !showDiff && (
                      <div className="pt-4 text-center text-muted-foreground">
                        <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">
                          Select an AI tool to enhance your academic writing
                        </p>
                      </div>
                    )}

                    <Separator className="my-4" />

                    <WritingTemplates 
                      onApply={(content) => {
                        if (editor) {
                          editor.commands.setContent(content);
                        }
                      }}
                    />
                  </div>
                </ScrollArea>
              </TabsContent>

              <TabsContent value="review" className="m-0">
                <ScrollArea className="h-[550px]">
                  <div className="p-4 space-y-4">
                    <WritingAnalysisPanel analysis={textAnalysis} />

                    <Separator />

                    <AIScorePanel aiScore={aiScore} isScanning={isScanning} />

                    <Button
                      onClick={handleScanForAI}
                      disabled={isScanning || wordCount < 50}
                      variant="outline"
                      className="w-full"
                    >
                      {isScanning ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Scanning...
                        </>
                      ) : (
                        <>
                          <FlaskConical className="h-4 w-4 mr-2" />
                          Scan for AI Content
                        </>
                      )}
                    </Button>

                    {wordCount < 50 && (
                      <p className="text-xs text-muted-foreground text-center">
                        Write at least 50 words to enable AI detection
                      </p>
                    )}

                    <Separator />

                    <PlagiarismCheckPanel 
                      result={plagiarismResult} 
                      isChecking={isCheckingPlagiarism} 
                      error={plagiarismError}
                      onRetry={handleCheckPlagiarism}
                    />

                    <Button
                      onClick={handleCheckPlagiarism}
                      disabled={isCheckingPlagiarism || wordCount < 50}
                      variant="outline"
                      className="w-full"
                    >
                      {isCheckingPlagiarism ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Checking...
                        </>
                      ) : (
                        <>
                          <FileSearch className="h-4 w-4 mr-2" />
                          Check for Plagiarism
                        </>
                      )}
                    </Button>

                    {wordCount < 50 && (
                      <p className="text-xs text-muted-foreground text-center">
                        Write at least 50 words to check for plagiarism
                      </p>
                    )}

                    <Separator />

                    <ReferenceListPanel 
                      references={savedReferences}
                      onRemove={(index) => {
                        setSavedReferences(prev => prev.filter((_, i) => i !== index));
                        toast.success("Reference removed");
                      }}
                      onInsert={(formattedCitation) => {
                        if (editor) {
                          editor.chain().focus().insertContent({
                            type: "paragraph",
                            content: [{ type: "text", text: formattedCitation }]
                          }).run();
                          toast.success("Citation inserted!");
                        }
                      }}
                      citationFormat={citationFormat}
                      onCopyAll={async () => {
                        if (savedReferences.length === 0) return;
                        const formatted = savedReferences
                          .map(ref => formatCitation(ref, citationFormat))
                          .join("\n\n");
                        try {
                          await navigator.clipboard.writeText(formatted);
                          toast.success("All citations copied!");
                        } catch {
                          toast.error("Failed to copy");
                        }
                      }}
                    />

                    <Separator />

                    <div id="writing-studio-citations-tab">
                    <CitationLookup 
                      onSave={(item) => {
                        const exists = savedReferences.some(
                          ref => ref.title === item.title && ref.year === item.year
                        );
                        if (!exists) {
                          setSavedReferences(prev => [...prev, item]);
                          toast.success("Added to references!");
                          return true;
                        } else {
                          toast.info("This reference is already saved");
                          return false;
                        }
                      }}
                      onInsert={(formattedCitation) => {
                        if (editor) {
                          editor.chain().focus().insertContent({
                            type: "paragraph",
                            content: [{ type: "text", text: formattedCitation }]
                          }).run();
                          toast.success("Citation inserted!");
                        }
                      }}
                      citationFormat={citationFormat}
                      onFormatChange={setCitationFormat}
                      checkLimit={checkLimit}
                      trackUsage={trackUsage}
                      onLimitReached={(type) => {
                        setUpgradeLimitType(type);
                        setShowUpgradeModal(true);
                      }}
                    />
                    </div>

                    <Separator />

                    <CitationFormatHelper />
                  </div>
                </ScrollArea>
              </TabsContent>
            </Tabs>
          </Card>
        </div>
      </div>
    </div>
  );
}
