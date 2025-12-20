/**
 * Presentation Socket Hook
 *
 * Manages WebSocket connection for presentation generation.
 * Handles event parsing and Redux state updates.
 *
 * @module usePresentationSocket
 */

import {
  addLog,
  insertSlide,
  selectPresentation,
  setMetadata,
  setSessionData,
  setStatus,
  updateLog,
  updateSlide,
} from "@/redux/slices/presentationSlice";
import { enrichLogEntry } from "@/utils/presentation/messageTypeClassifier.js.js";
import {
  parseAgentOutput,
  parseConnectedEvent,
  parseTerminalEvent,
} from "@/utils/presentation/presentationDataParser";
import { useCallback, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { io } from "socket.io-client";

/**
 * Custom hook for managing presentation WebSocket connection
 *
 * @param {string} pId - Presentation ID
 * @param {string} token - Authentication token
 * @returns {Object} Socket utilities and connection status
 */
export default function usePresentationSocket(pId, token) {
  const dispatch = useDispatch();
  const socketRef = useRef(null);
  const messageBufferRef = useRef([]);
  const isProcessingRef = useRef(false);

  // IMPORTANT: Use ref to avoid stale closure issues
  const presentationStateRef = useRef(null);
  const presentation = useSelector(selectPresentation);

  // Update ref whenever state changes (doesn't cause re-render)
  useEffect(() => {
    presentationStateRef.current = presentation;
  }, [presentation]);

  /**
   * Process a single agent_output message
   */
  const processAgentOutputMessage = useCallback(
    (message) => {
      console.log("[Socket] Processing agent_output:", {
        author: message.author,
        type: message.type,
        timestamp: message.timestamp,
      });

      try {
        const currentState = presentationStateRef.current;

        // Parse the message
        const parsed = parseAgentOutput(message, currentState);

        console.log("[Socket] Parsed result:", {
          type: parsed.type,
          author:
            parsed.data?.author ||
            parsed.logEntry?.author ||
            parsed.slideEntry?.author,
        });

        // Validate parsed data exists before processing
        if (!parsed || !parsed.type) {
          console.error("[Socket] Invalid parsed result:", parsed);
          return;
        }

        // Check for duplicates before dispatching
        switch (parsed.type) {
          case "log":
            // Validate data exists
            if (!parsed.data) {
              console.error("[Socket] Missing data for log type:", parsed);
              return;
            }

            // For user messages, check for duplicates by content first (before timestamp check)
            // This handles cases where backend sends same message multiple times with different timestamps
            if (parsed.data.author === "user" && parsed.data.user_message) {
              // First, try to merge with optimistic temp log
              const optimisticLogIndex = currentState.logs?.findIndex(
                (log) =>
                  log.author === "user" &&
                  log.temp === true &&
                  (log.user_message === parsed.data.user_message ||
                    log.content === parsed.data.user_message ||
                    log.text === parsed.data.user_message),
              );

              if (
                optimisticLogIndex !== undefined &&
                optimisticLogIndex !== -1
              ) {
                console.log(
                  "[Socket] 🔄 Replacing optimistic user log with backend log",
                  {
                    optimisticIndex: optimisticLogIndex,
                    message: parsed.data.user_message,
                  },
                );
                dispatch(
                  updateLog({
                    logIndex: optimisticLogIndex,
                    logEntry: enrichLogEntry({ ...parsed.data, temp: false }),
                  }),
                );
                break; // Exit early, don't add as new log
              }

              // Check if this exact user message already exists (even if not temp)
              // This prevents duplicates when backend sends same message multiple times
              const duplicateUserMessage = currentState.logs?.some(
                (log) =>
                  log.author === "user" &&
                  !log.temp && // Only check non-temp logs (already processed backend logs)
                  (log.user_message === parsed.data.user_message ||
                    log.content === parsed.data.user_message ||
                    log.text === parsed.data.user_message) &&
                  // Allow some time difference (within 5 seconds) to catch same message from different workers
                  Math.abs(
                    new Date(log.timestamp).getTime() -
                      new Date(parsed.data.timestamp).getTime(),
                  ) < 5000,
              );

              if (duplicateUserMessage) {
                console.log(
                  "[Socket] ⏭️ Skipping duplicate user message (same content):",
                  parsed.data.user_message?.substring(0, 50),
                );
                break; // Exit early, don't add duplicate
              }
            }

            // Skip unknown agent logs during streaming
            // Unknown logs should not be added to Redux to avoid cluttering the UI
            if (parsed.data.author === "unknown" || !parsed.data.author) {
              console.log(
                "[Socket] ⏭️ Skipping unknown agent log during streaming:",
                parsed.data.author,
              );
              break;
            }

            // General duplicate check for all logs (by ID or author+timestamp)
            const logExists = currentState.logs?.some(
              (log) =>
                log.id === parsed.data.id ||
                (log.author === parsed.data.author &&
                  log.timestamp === parsed.data.timestamp),
            );

            if (logExists) {
              console.log(
                "[Socket] ⏭️ Skipping duplicate log:",
                parsed.data.author,
              );
              break;
            }

            dispatch(addLog(parsed.data));
            break;

          case "log_with_metadata":
            // Validate data exists
            if (!parsed.data) {
              console.error(
                "[Socket] Missing data for log_with_metadata type:",
                parsed,
              );
              return;
            }

            // Check for duplicate
            const metadataLogExists = currentState.logs?.some(
              (log) =>
                log.id === parsed.data.id ||
                (log.author === parsed.data.author &&
                  log.timestamp === parsed.data.timestamp),
            );

            if (metadataLogExists) {
              console.log("[Socket] ⏭️ Skipping duplicate metadata log");
              break;
            }

            dispatch(addLog(parsed.data));
            if (parsed.metadata) {
              dispatch(setMetadata(parsed.metadata));
            }
            break;

          case "browser_worker":
            // Browser workers always update, so we process them
            if (parsed.updateType === "update") {
              console.log(
                "[Socket] Updating browser worker log at index:",
                parsed.logIndex,
              );
              dispatch(
                updateLog({
                  logIndex: parsed.logIndex,
                  logEntry: parsed.logEntry,
                }),
              );
            } else if (parsed.updateType === "create") {
              // Check if this browser worker already exists (from history)
              const workerExists = currentState.logs?.some(
                (log) => log.author === parsed.logEntry.author,
              );

              if (workerExists) {
                console.log(
                  "[Socket] ⏭️ Browser worker already exists from history, will update incrementally:",
                  parsed.logEntry.author,
                );

                // Find its index and update instead of creating
                const existingIndex = currentState.logs.findIndex(
                  (log) => log.author === parsed.logEntry.author,
                );

                if (existingIndex !== -1) {
                  dispatch(
                    updateLog({
                      logIndex: existingIndex,
                      logEntry: parsed.logEntry,
                    }),
                  );
                }
              } else {
                console.log(
                  "[Socket] Creating new browser worker log:",
                  parsed.logEntry.author,
                );
                dispatch(addLog(parsed.logEntry));
              }
            }

            if (parsed.isComplete) {
              console.log(
                "[Socket] ✅ Browser worker completed:",
                parsed.logEntry.author,
              );
            }
            break;

          case "slide":
            // Handle insertions (new slide at existing position - requires reordering)
            if (parsed.updateType === "insert") {
              console.log(
                "[Socket] Inserting slide at index:",
                parsed.insertIndex,
                "This will trigger reordering",
              );

              dispatch(
                insertSlide({
                  insertIndex: parsed.insertIndex,
                  slideEntry: parsed.slideEntry,
                }),
              );

              if (parsed.slideEntry.isComplete) {
                console.log(
                  "[Socket] ✅ Slide inserted and completed:",
                  parsed.slideEntry.slideNumber,
                );
              }
              break;
            }

            // Handle updates and creates (existing logic)
            // Check if slide already exists (from history)
            const slideExists = currentState.slides?.some(
              (slide) => slide.slideNumber === parsed.slideEntry.slideNumber,
            );

            console.log("[Socket] Processing slide:", {
              updateType: parsed.updateType,
              slideNumber: parsed.slideEntry.slideNumber,
              hasThinking: !!parsed.slideEntry.thinking,
              hasHtml: !!parsed.slideEntry.htmlContent,
              isComplete: parsed.slideEntry.isComplete,
              existsInHistory: slideExists,
            });

            if (slideExists && parsed.updateType === "create") {
              console.log(
                "[Socket] ⚠️ Slide exists from history, forcing update instead of create:",
                parsed.slideEntry.slideNumber,
              );

              // Find the existing slide index
              const existingSlideIndex = currentState.slides.findIndex(
                (slide) => slide.slideNumber === parsed.slideEntry.slideNumber,
              );

              dispatch(
                updateSlide({
                  type: "update", // Force update
                  slideIndex: existingSlideIndex,
                  slideEntry: parsed.slideEntry,
                }),
              );
            } else {
              // Normal flow - dispatch as parsed
              dispatch(
                updateSlide({
                  type: parsed.updateType,
                  slideIndex: parsed.slideIndex,
                  slideEntry: parsed.slideEntry,
                }),
              );
            }

            if (parsed.slideEntry.isComplete) {
              console.log(
                "[Socket] ✅ Slide completed:",
                parsed.slideEntry.slideNumber,
              );
            }
            break;

          default:
            console.warn("[Socket] Unknown parsed type:", parsed.type);
        }
      } catch (error) {
        console.error("[Socket] Error processing agent_output:", error);
        console.error("[Socket] Message that caused error:", message);
      }
    },
    [dispatch],
  );

  /**
   * Process buffered messages sequentially
   * FIXED: Stable dependencies
   */
  const processBuffer = useCallback(() => {
    if (isProcessingRef.current || messageBufferRef.current.length === 0) {
      return;
    }

    isProcessingRef.current = true;

    console.log(
      `[Socket] Processing ${messageBufferRef.current.length} buffered messages`,
    );

    while (messageBufferRef.current.length > 0) {
      const message = messageBufferRef.current.shift();

      try {
        processAgentOutputMessage(message);
      } catch (error) {
        console.error("[Socket] Error processing buffered message:", error);
      }
    }

    isProcessingRef.current = false;
  }, [processAgentOutputMessage]); // Now stable since processAgentOutputMessage is stable

  /**
   * Initialize WebSocket connection
   * FIXED: Stable dependencies - only pId, token, dispatch
   */
  useEffect(() => {
    // If pId or token is missing, clean up any existing socket and return
    // This is expected during cleanup/unmount, so we don't warn in that case
    if (!pId || !token) {
      // Only clean up if there's an existing socket
      if (socketRef.current) {
        console.log(
          "[Socket] 🧹 Cleaning up socket (pId/token missing or component unmounting)",
        );
        socketRef.current.removeAllListeners();
        socketRef.current.disconnect();
        socketRef.current = null;
        messageBufferRef.current = [];
      }
      return;
    }

    // Use base API URL (without prefix concatenation)
    // The prefix is handled via the socket.io path option
    const baseUrl = process.env.NEXT_PUBLIC_API_URL;
    if (!baseUrl) {
      console.error("[Socket] ❌ NEXT_PUBLIC_API_URL not configured");
      return;
    }

    console.log("[Socket] 🔌 Initializing NEW socket connection:", {
      pId,
      baseUrl,
    });

    const socket = io(baseUrl, {
      path: `${process.env.NEXT_PUBLIC_SLIDE_REDIRECT_PREFIX}/socket.io`, // Socket.io path with prefix
      transports: ["websocket", "polling"],
      autoConnect: false,
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000,
      forceNew: true,
      query: {
        p_id: pId,
        token: token,
      },
    });

    socketRef.current = socket;

    // All event handlers here...
    socket.on("connect", () => {
      console.log("[Socket] ✅ CONNECTED:", socket.id);
      dispatch(setStatus({ status: "streaming" }));
      setTimeout(() => processBuffer(), 100);
    });

    socket.on("connected", (payload) => {
      console.log("[Socket] 🎉 Server welcome:", payload);
      const sessionData = parseConnectedEvent(payload);
      dispatch(setSessionData(sessionData));
    });

    socket.on("agent_output", (message) => {
      console.log("[Socket] 📨 AGENT OUTPUT:", {
        author: message.author,
        type: message.type,
        event: message.event,
        status: message.status,
      });

      // Check for terminal/completion events
      // Terminal events can have: author === "terminal", type === "terminal", or event === "completed"
      const isTerminalEvent =
        message.author === "terminal" ||
        message.type === "terminal" ||
        message.event === "completed" ||
        (message.status === "completed" && message.author === "terminal");

      if (isTerminalEvent) {
        console.log(
          "[Socket] 🏁 Terminal/completion event detected, closing socket",
        );
        const terminalData = parseTerminalEvent(message);
        dispatch(
          setStatus({
            status: terminalData.status || "completed",
            presentationStatus: terminalData.status || "completed",
          }),
        );

        // Use socketRef.current to ensure we're disconnecting the correct socket instance
        const currentSocket = socketRef.current;
        if (currentSocket && currentSocket.connected) {
          console.log("[Socket] 🔌 Disconnecting socket due to completion");
          setTimeout(() => {
            if (currentSocket && currentSocket.connected) {
              currentSocket.disconnect();
              console.log("[Socket] ✅ Socket disconnected after completion");
            }
          }, 500); // Reduced delay for faster cleanup
        }
        return; // Don't process this message further
      }

      // Normal message processing
      messageBufferRef.current.push(message);
      processBuffer();
    });

    socket.on("message", (data) => {});

    socket.on("disconnect", (reason) => {
      console.log("[Socket] 🔌 Disconnected:", reason);
    });

    // Connect
    console.log("[Socket] 🚀 Connecting...");
    socket.connect();

    // Cleanup function - runs when component unmounts or dependencies change
    return () => {
      console.log("[Socket] 🧹 Cleanup - disconnecting socket");

      // Process any remaining buffered messages before disconnecting
      if (messageBufferRef.current.length > 0) {
        console.log(
          `[Socket] Processing ${messageBufferRef.current.length} buffered messages before cleanup`,
        );
        processBuffer();
      }

      // Clean up socket connection
      if (socketRef.current) {
        socketRef.current.removeAllListeners();
        socketRef.current.disconnect();
        socketRef.current = null;
        messageBufferRef.current = [];
        console.log("[Socket] ✅ Socket cleanup completed");
      }
    };
  }, [pId, token, dispatch]);

  /**
   * Subscribe to presentation updates
   * @param {string} p_id - Presentation ID to subscribe to
   */
  const subscribe = useCallback((p_id) => {
    const socket = socketRef.current;
    if (!socket?.connected) {
      console.warn("[Socket] ⚠️ Cannot subscribe - socket not connected");
      return;
    }

    console.log("[Socket] 📤 Subscribing to:", p_id);
    socket.emit("subscribe_presentation", { p_id });
  }, []);

  /**
   * Send ping to keep connection alive
   */
  const sendPing = useCallback(() => {
    const socket = socketRef.current;
    if (!socket?.connected) return;

    socket.emit("ping", { timestamp: new Date().toISOString() });
  }, []);

  /**
   * Manually disconnect socket
   */
  const disconnect = useCallback(() => {
    const socket = socketRef.current;
    if (socket) {
      console.log("[Socket] 🔌 Manual disconnect");
      socket.disconnect();
    }
  }, []);

  return {
    subscribe,
    sendPing,
    disconnect,
    socketRef,
    isConnected: socketRef.current?.connected || false,
  };
}
