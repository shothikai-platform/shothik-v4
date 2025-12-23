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
];

const PARAPHRASE_MODES = [
  { id: "Fluency", name: "Fluency", description: "Improve readability" },
  { id: "Standard", name: "Standard", description: "Balanced rewrite" },
  { id: "Formal", name: "Academic", description: "Academic tone" },
  { id: "Simple", name: "Simplify", description: "Clearer language" },
];

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

function CitationLookup({ onSave, citationFormat, onFormatChange }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [savedIndex, setSavedIndex] = useState(null);

  const handleSearch = async () => {
    if (!query.trim() || query.length < 3) return;
    
    setIsSearching(true);
    try {
      const searchResults = await searchAll(query);
      setResults(searchResults);
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

function ReferenceListPanel({ references, onRemove, citationFormat, onCopyAll }) {
  const handleCopy = async (item) => {
    const formatted = formatCitation(item, citationFormat);
    try {
      await navigator.clipboard.writeText(formatted);
      toast.success("Citation copied!");
    } catch {
      toast.error("Failed to copy");
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
  const selectionRef = useRef({ from: 0, to: 0 });
  const analysisTimeoutRef = useRef(null);

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

        default:
          toast.error("Please select an AI tool first");
          return;
      }

      if (processedText) {
        setProcessedResult(processedText);
        setShowDiff(true);
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

    if (!user) {
      dispatch(setShowLoginModal(true));
      return;
    }

    setIsScanning(true);
    try {
      const result = await scanAi({ text }).unwrap();
      const score = result?.data?.ai_percentage || result?.ai_percentage || 0;
      setAiScore(Math.round(score));
      toast.success("Scan complete!");
    } catch (error) {
      console.error("Scan error:", error);
      toast.error("Failed to scan. Please try again.");
    } finally {
      setIsScanning(false);
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

  const handleExport = (format) => {
    const content = editor?.getHTML() || "";
    const text = editor?.getText() || "";

    if (format === "txt") {
      const blob = new Blob([text], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "document.txt";
      a.click();
      URL.revokeObjectURL(url);
    } else if (format === "html") {
      const blob = new Blob([content], { type: "text/html" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "document.html";
      a.click();
      URL.revokeObjectURL(url);
    }
    toast.success(`Exported as ${format.toUpperCase()}`);
  };

  return (
    <div className="container mx-auto max-w-7xl px-4 py-6">
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <GraduationCap className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold text-primary">Academic Writing Studio</h1>
        </div>
        <p className="text-muted-foreground">
          Write, critique, and enhance your papers, theses, and research with AI-powered tools
        </p>
      </div>

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
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleExport("txt")}
                  className="gap-1"
                >
                  <Download className="h-4 w-4" />
                  Export
                </Button>
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

            <EditorContent editor={editor} className="min-h-[500px]" />

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
                <TabsTrigger value="actions" className="gap-1">
                  <Wand2 className="h-4 w-4" />
                  AI Actions
                </TabsTrigger>
                <TabsTrigger value="review" className="gap-1">
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
                        <p className="text-xs font-medium mb-2">Mode</p>
                        <div className="grid grid-cols-2 gap-1">
                          {PARAPHRASE_MODES.map((mode) => (
                            <button
                              key={mode.id}
                              onClick={() => setSelectedMode(mode.id)}
                              className={cn(
                                "p-2 rounded border text-xs transition-all",
                                selectedMode === mode.id
                                  ? "border-primary bg-primary/10 text-primary"
                                  : "hover:border-primary/50"
                              )}
                            >
                              {mode.name}
                            </button>
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

                    <ReferenceListPanel 
                      references={savedReferences}
                      onRemove={(index) => {
                        setSavedReferences(prev => prev.filter((_, i) => i !== index));
                        toast.success("Reference removed");
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
                      citationFormat={citationFormat}
                      onFormatChange={setCitationFormat}
                    />

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
