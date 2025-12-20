"use client";
import { useState, useCallback, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Underline from "@tiptap/extension-underline";
import Highlight from "@tiptap/extension-highlight";
import TextAlign from "@tiptap/extension-text-align";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
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
} from "lucide-react";
import {
  useParaphrasedMutation,
  useHumanizeContendMutation,
  useSpellCheckerMutation,
} from "@/redux/api/tools/toolsApi";
import { setShowLoginModal } from "@/redux/slices/auth";
import { cn } from "@/lib/utils";
import WordCounter from "../common/WordCounter";

const AI_TOOLS = [
  {
    id: "paraphrase",
    name: "Paraphrase",
    icon: RefreshCw,
    description: "Rewrite your text in a different way while keeping the meaning",
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
  },
  {
    id: "humanize",
    name: "Humanize",
    icon: Bot,
    description: "Make AI-generated text sound more natural and human",
    color: "text-purple-500",
    bgColor: "bg-purple-500/10",
  },
  {
    id: "grammar",
    name: "Grammar Fix",
    icon: CheckCircle2,
    description: "Fix grammar, spelling, and punctuation errors",
    color: "text-green-500",
    bgColor: "bg-green-500/10",
  },
];

const PARAPHRASE_MODES = [
  { id: "Fluency", name: "Fluency", description: "Improve readability" },
  { id: "Standard", name: "Standard", description: "Balanced rewrite" },
  { id: "Creative", name: "Creative", description: "More creative changes" },
  { id: "Formal", name: "Formal", description: "Professional tone" },
  { id: "Simple", name: "Simple", description: "Simpler language" },
];

export default function WritingStudioContent() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [selectedTool, setSelectedTool] = useState(null);
  const [selectedMode, setSelectedMode] = useState("Fluency");
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedText, setSelectedText] = useState("");
  const [processedResult, setProcessedResult] = useState("");
  const [wordCount, setWordCount] = useState(0);

  const [paraphrase] = useParaphrasedMutation();
  const [humanize] = useHumanizeContendMutation();
  const [grammarCheck] = useSpellCheckerMutation();

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      Placeholder.configure({
        placeholder: "Start writing or paste your text here...",
      }),
      Underline,
      Highlight.configure({ multicolor: true }),
      TextAlign.configure({
        types: ["heading", "paragraph"],
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
    },
    onSelectionUpdate: ({ editor }) => {
      const { from, to } = editor.state.selection;
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
  };

  const getTextToProcess = useCallback(() => {
    if (selectedText) return selectedText;
    return editor?.getText() || "";
  }, [selectedText, editor]);

  const handleProcess = async () => {
    if (!selectedTool) {
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

    setIsProcessing(true);
    setProcessedResult("");

    try {
      let result;
      let processedText = "";

      switch (selectedTool) {
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
            purpose: "General Writing",
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
        toast.success("Text processed successfully!");
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

  const handleApplyResult = () => {
    if (!processedResult || !editor) return;

    const { from, to } = editor.state.selection;
    if (selectedText && from !== to) {
      editor.chain().focus().deleteRange({ from, to }).insertContent(processedResult).run();
    } else {
      editor.commands.setContent(`<p>${processedResult}</p>`);
    }
    setProcessedResult("");
    setSelectedText("");
    toast.success("Applied to document!");
  };

  const handleCopyResult = () => {
    if (!processedResult) return;
    navigator.clipboard.writeText(processedResult);
    toast.success("Copied to clipboard!");
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
        <h1 className="text-3xl font-bold text-primary mb-2">AI Writing Studio</h1>
        <p className="text-muted-foreground">
          Write, edit, and enhance your content with AI-powered tools
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
                  className={cn(
                    "h-8 w-8",
                    editor?.isActive("bold") && "bg-muted"
                  )}
                >
                  <Bold className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => editor?.chain().focus().toggleItalic().run()}
                  className={cn(
                    "h-8 w-8",
                    editor?.isActive("italic") && "bg-muted"
                  )}
                >
                  <Italic className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => editor?.chain().focus().toggleUnderline().run()}
                  className={cn(
                    "h-8 w-8",
                    editor?.isActive("underline") && "bg-muted"
                  )}
                >
                  <UnderlineIcon className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => editor?.chain().focus().toggleStrike().run()}
                  className={cn(
                    "h-8 w-8",
                    editor?.isActive("strike") && "bg-muted"
                  )}
                >
                  <Strikethrough className="h-4 w-4" />
                </Button>
                <Separator orientation="vertical" className="h-6 mx-1" />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => editor?.chain().focus().setTextAlign("left").run()}
                  className={cn(
                    "h-8 w-8",
                    editor?.isActive({ textAlign: "left" }) && "bg-muted"
                  )}
                >
                  <AlignLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => editor?.chain().focus().setTextAlign("center").run()}
                  className={cn(
                    "h-8 w-8",
                    editor?.isActive({ textAlign: "center" }) && "bg-muted"
                  )}
                >
                  <AlignCenter className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => editor?.chain().focus().setTextAlign("right").run()}
                  className={cn(
                    "h-8 w-8",
                    editor?.isActive({ textAlign: "right" }) && "bg-muted"
                  )}
                >
                  <AlignRight className="h-4 w-4" />
                </Button>
                <Separator orientation="vertical" className="h-6 mx-1" />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => editor?.chain().focus().toggleBulletList().run()}
                  className={cn(
                    "h-8 w-8",
                    editor?.isActive("bulletList") && "bg-muted"
                  )}
                >
                  <List className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => editor?.chain().focus().toggleOrderedList().run()}
                  className={cn(
                    "h-8 w-8",
                    editor?.isActive("orderedList") && "bg-muted"
                  )}
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
            <EditorContent editor={editor} className="min-h-[500px]" />
            {selectedText && (
              <div className="border-t bg-primary/5 px-4 py-2 flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  <Sparkles className="h-4 w-4 inline mr-1 text-primary" />
                  {selectedText.split(/\s+/).length} words selected - Choose an AI tool to enhance
                </span>
              </div>
            )}
          </Card>
        </div>

        <div className="lg:col-span-1">
          <Card className="sticky top-4">
            <div className="p-4 border-b">
              <h2 className="font-semibold flex items-center gap-2">
                <Wand2 className="h-5 w-5 text-primary" />
                AI Tools
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                {selectedText ? "Apply to selected text" : "Apply to entire document"}
              </p>
            </div>
            <ScrollArea className="h-[600px]">
              <div className="p-4 space-y-3">
                {AI_TOOLS.map((tool) => (
                  <button
                    key={tool.id}
                    onClick={() => handleToolSelect(tool.id)}
                    className={cn(
                      "w-full p-4 rounded-lg border text-left transition-all",
                      selectedTool === tool.id
                        ? "border-primary bg-primary/5 ring-1 ring-primary"
                        : "hover:border-primary/50 hover:bg-muted/50"
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <div className={cn("p-2 rounded-lg", tool.bgColor)}>
                        <tool.icon className={cn("h-5 w-5", tool.color)} />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium">{tool.name}</h3>
                        <p className="text-sm text-muted-foreground mt-0.5">
                          {tool.description}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}

                {selectedTool === "paraphrase" && (
                  <div className="pt-3 border-t">
                    <p className="text-sm font-medium mb-2">Paraphrase Mode</p>
                    <div className="grid grid-cols-2 gap-2">
                      {PARAPHRASE_MODES.map((mode) => (
                        <button
                          key={mode.id}
                          onClick={() => setSelectedMode(mode.id)}
                          className={cn(
                            "p-2 rounded-lg border text-center text-sm transition-all",
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
                    className="w-full mt-4"
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
                        {selectedText ? "Enhance Selected Text" : "Enhance Document"}
                      </>
                    )}
                  </Button>
                )}

                {processedResult && (
                  <div className="pt-4 border-t space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium">Result</p>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={handleCopyResult}
                          className="h-8 w-8"
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="bg-muted/50 rounded-lg p-3 text-sm max-h-48 overflow-y-auto">
                      {processedResult}
                    </div>
                    <Button
                      onClick={handleApplyResult}
                      variant="default"
                      className="w-full"
                    >
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      Apply to Document
                    </Button>
                  </div>
                )}

                {!selectedTool && (
                  <div className="pt-4 text-center text-muted-foreground">
                    <FileText className="h-10 w-10 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">
                      Select an AI tool above to enhance your writing
                    </p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </Card>
        </div>
      </div>
    </div>
  );
}
