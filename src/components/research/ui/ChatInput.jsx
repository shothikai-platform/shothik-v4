import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useResearchStream } from "@/hooks/useResearchStream";
import { setUserPrompt } from "@/redux/slices/researchCoreSlice";
import { Send } from "lucide-react";
import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";

const ChatInput = () => {
  const [inputValue, setInputValue] = useState("");

  // Loading states
  const [isInitiatingPresentation, setIsInitiatingPresentation] =
    useState(false);
  const [isInitiatingSheet, setIsInitiatingSheet] = useState(false);
  // const [isUploading, setIsUploading] = useState(false);
  const [isInitiatingResearch, setIsInitiatingResearch] = useState(false);

  // REDUX
  const dispatch = useDispatch();
  const [effort, setEffort] = useState("medium");
  const [model, setModel] = useState("gemini-2.5-pro");
  const { uploadedFiles, isUploading } = useSelector(
    (state) => state.researchUi,
  );
  const { isStreaming } = useSelector((state) => state.researchCore);

  const { startResearch, cancelResearch } = useResearchStream();

  const handleInputChange = (event) => {
    setInputValue(event.target.value);
  };

  const handleSubmit = async () => {
    if (!inputValue.trim() || isStreaming) return;

    // return;
    try {
      dispatch(setUserPrompt(inputValue));
      setInputValue("");
      await startResearch(inputValue, { effort, model });
    } catch (error) {
      console.error("Research failed:", error);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="relative z-[11] mx-auto w-full max-w-[1000px] py-2">
      <div className="bg-background border-border mx-auto max-w-[1000px] rounded-2xl border p-6 shadow-md">
        <div className="mb-4 flex items-center gap-4">
          <Textarea
            placeholder="Enter a new research topic"
            value={inputValue}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            className="text-foreground max-h-[120px] min-h-[40px] flex-1 resize-none border-none bg-transparent text-lg shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
            rows={1}
            aria-label="Research topic input"
          />
          <div className="flex items-center justify-between">
            <div className="flex flex-row-reverse items-center gap-4">
              <Tooltip>
                <TooltipTrigger asChild>
                  <span tabIndex={0} className="inline-flex rounded-full">
                    <Button
                      onClick={handleSubmit}
                      disabled={
                        !inputValue.trim() ||
                        isInitiatingPresentation ||
                        isInitiatingSheet ||
                        isUploading ||
                        isInitiatingResearch ||
                        isStreaming
                      }
                      size="icon"
                      className="bg-primary hover:bg-primary/90 text-primary-foreground disabled:bg-muted disabled:text-muted-foreground h-10 w-10 rounded-full"
                      aria-label="Start research"
                    >
                      <Send className="h-5 w-5" />
                    </Button>
                  </span>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Start research</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatInput;
