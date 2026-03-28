"use client";

import { cn } from "@/lib/utils";
import { Bold, Italic, List, Redo2, Underline, Undo2 } from "lucide-react";
import { useState, useEffect } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const ToolbarButton = ({ onClick, isActive, disabled, label, children }) => {
  const buttonClass =
    "flex items-center justify-center w-8 h-8 rounded cursor-pointer transition-colors hover:bg-accent hover:text-foreground";
  const activeClass = "bg-muted";

  const button = (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(buttonClass, {
        [activeClass]: isActive,
        "cursor-not-allowed opacity-50": disabled,
        "pointer-events-none": disabled,
      })}
      aria-label={label}
    >
      {children}
    </button>
  );

  if (disabled) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <span
            tabIndex={0}
            className="inline-block rounded focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
          >
            {button}
          </span>
        </TooltipTrigger>
        <TooltipContent>
          <p>{label}</p>
        </TooltipContent>
      </Tooltip>
    );
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>{button}</TooltipTrigger>
      <TooltipContent>
        <p>{label}</p>
      </TooltipContent>
    </Tooltip>
  );
};

const EditorToolbar = ({ editor, onHistoryOperation }) => {
  const [isBulletListActive, setIsBulletListActive] = useState(false);
  const [isOrderedListActive, setIsOrderedListActive] = useState(false);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

  // Update active states when editor state changes
  useEffect(() => {
    if (!editor) return;

    const updateActiveStates = () => {
      const bulletActive = editor.isActive("bulletList");
      const orderedActive = editor.isActive("orderedList");

      setIsBulletListActive(bulletActive);
      setIsOrderedListActive(orderedActive);

      // Update undo/redo states
      setCanUndo(editor.can().undo());
      setCanRedo(editor.can().redo());
    };

    // Update on selection change and content update
    editor.on("selectionUpdate", updateActiveStates);
    editor.on("update", updateActiveStates);
    editor.on("transaction", updateActiveStates);
    editor.on("create", updateActiveStates);

    // Initial update
    updateActiveStates();

    return () => {
      editor.off("selectionUpdate", updateActiveStates);
      editor.off("update", updateActiveStates);
      editor.off("transaction", updateActiveStates);
      editor.off("create", updateActiveStates);
    };
  }, [editor]);

  if (!editor) return null;

  return (
    <>
      <ToolbarButton
        onClick={(e) => {
          e.preventDefault();
          editor.chain().focus().toggleBold().run();
        }}
        isActive={editor.isActive("bold")}
        label="Bold"
      >
        <Bold className="size-4" />
      </ToolbarButton>

      <ToolbarButton
        onClick={(e) => {
          e.preventDefault();
          editor.chain().focus()?.toggleItalic()?.run();
        }}
        isActive={editor.isActive("italic")}
        label="Italic"
      >
        <Italic className="size-4" />
      </ToolbarButton>

      <ToolbarButton
        onClick={(e) => {
          e.preventDefault();
          editor.chain().focus()?.toggleUnderline()?.run();
        }}
        isActive={editor.isActive("strike")}
        label="Underline"
      >
        <Underline className="size-4" />
      </ToolbarButton>

      <div className="bg-muted mx-1 h-6 w-px" />

      <ToolbarButton
        onClick={(e) => {
          e.preventDefault();
          editor.chain().focus().toggleBulletList().run();
          requestAnimationFrame(() => {
            setIsBulletListActive(editor.isActive("bulletList"));
            setIsOrderedListActive(editor.isActive("orderedList"));
          });
        }}
        isActive={isBulletListActive}
        label="Bullet List"
      >
        <List className="size-4" />
      </ToolbarButton>

      <ToolbarButton
        onClick={(e) => {
          e.preventDefault();
          editor.chain().focus().toggleOrderedList().run();
          requestAnimationFrame(() => {
            setIsBulletListActive(editor.isActive("bulletList"));
            setIsOrderedListActive(editor.isActive("orderedList"));
          });
        }}
        isActive={isOrderedListActive}
        label="Numbered List"
      >
        <List className="size-4" />
      </ToolbarButton>

      <div className="bg-muted mx-1 h-6 w-px" />

      <ToolbarButton
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();

          if (!editor || !canUndo) return;
          if (onHistoryOperation) onHistoryOperation();

          try {
            const success = editor.chain().focus().undo().run();
            if (success) {
              setTimeout(() => {
                setCanRedo(editor.can().redo());
                setCanUndo(editor.can().undo());
              }, 0);
            }
          } catch (error) {
            console.error("[EditorToolbar] Undo error:", error);
          }
        }}
        disabled={!editor || !canUndo}
        label="Undo"
      >
        <Undo2 className="size-4" />
      </ToolbarButton>

      <ToolbarButton
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();

          if (!editor || !canRedo) return;
          if (onHistoryOperation) onHistoryOperation();

          try {
            const success = editor.chain().focus().redo().run();
            if (success) {
              setTimeout(() => {
                setCanRedo(editor.can().redo());
                setCanUndo(editor.can().undo());
              }, 0);
            } else {
              console.warn("[EditorToolbar] Redo command returned false");
            }
          } catch (error) {
            console.error("[EditorToolbar] Redo error:", error);
          }
        }}
        disabled={!editor || !canRedo}
        label="Redo"
      >
        <Redo2 className="size-4" />
      </ToolbarButton>
    </>
  );
};

export default EditorToolbar;
