import { useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import {
  ChatService,
  ChatMessage,
  ChatRequest,
} from "../services/chat.service";

export const useChat = () => {
  const queryClient = useQueryClient();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);

  console.log("Session ID in useChat:", sessionId);

  const sendMessage = useCallback(
    async (request: ChatRequest) => {
      setIsStreaming(true);

      // Add user message to UI immediately
      const userMsg: ChatMessage = { role: "user", content: request.message };
      setMessages((prev) => [...prev, userMsg]);

      // Prepare assistant message
      let assistantContent = "";
      setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

      try {
        const isNewSession = !(sessionId || request.session_id);

        await ChatService.sendMessageStream(
          {
            ...request,
            session_id: sessionId || request.session_id,
            create_session: isNewSession,
          },
          (token) => {
            assistantContent += token;
            setMessages((prev) => {
              const lastIndex = prev.length - 1;
              if (lastIndex >= 0 && prev[lastIndex].role === "assistant") {
                return [
                  ...prev.slice(0, lastIndex),
                  { ...prev[lastIndex], content: assistantContent },
                ];
              }
              return prev;
            });
          },
          (structuredData) => {
            setMessages((prev) => {
              const lastIndex = prev.length - 1;
              if (lastIndex >= 0 && prev[lastIndex].role === "assistant") {
                const currentMsg = prev[lastIndex];
                const newOutput = {
                  type: structuredData.type,
                  data: structuredData.data,
                  record_id: structuredData.record_id,
                };
                const existingOutputs = currentMsg.outputs || [];
                const nextOutputs = [...existingOutputs, newOutput];

                return [
                  ...prev.slice(0, lastIndex),
                  {
                    ...prev[lastIndex],
                    type: structuredData.type,
                    data: structuredData.data,
                    record_id: structuredData.record_id,
                    outputs: nextOutputs,
                  },
                ];
              }
              return prev;
            });
          },
          (newSessionId) => {
            if (!sessionId && newSessionId) {
              setSessionId(newSessionId);
              // Invalidate the sessions list to reflect the new chat in sidebar
              queryClient.invalidateQueries({ queryKey: ["chat-sessions"] });
            }
          },
        );
      } catch (error) {
        console.error("Chat error:", error);
        setMessages((prev) => {
          const lastIndex = prev.length - 1;
          if (lastIndex >= 0 && prev[lastIndex].role === "assistant" && prev[lastIndex].content === "") {
            return [
              ...prev.slice(0, lastIndex),
              {
                role: "assistant",
                content: "Sorry, I encountered an error. Please try again.",
              },
            ];
          }
          return [
            ...prev,
            {
              role: "assistant",
              content: "Sorry, I encountered an error. Please try again.",
            },
          ];
        });
      } finally {
        setIsStreaming(false);
        queryClient.invalidateQueries({ queryKey: ["chat-sessions"] });
      }
    },
    [sessionId],
  );

  const loadSession = useCallback(async (id: string) => {
    setIsStreaming(true);
    try {
      const response = await ChatService.getSessionMessages(id);
      setMessages(response.session_messages || []);
      setSessionId(id);
    } catch (error) {
      console.error("Failed to load session:", error);
    } finally {
      setIsStreaming(false);
    }
  }, []);

  return {
    messages,
    isStreaming,
    sendMessage,
    loadSession,
    sessionId,
    setMessages,
    setSessionId,
  };
};

export const useSessions = () => {
  const queryClient = useQueryClient();
  const [hiddenIds, setHiddenIds] = useState<Set<string>>(new Set());

  const sessionsQuery = useQuery({
    queryKey: ["chat-sessions"],
    queryFn: () => ChatService.getSessions(),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => ChatService.deleteSession(id),
    onMutate: async (id: string) => {
      // Small delay before "hiding" it optimistically
      const timeoutId = setTimeout(() => {
        setHiddenIds(prev => new Set(prev).add(id));
      }, 500);
      return { timeoutId };
    },
    onError: (err: any, id: string, context: any) => {
      if (context?.timeoutId) clearTimeout(context.timeoutId);
      setHiddenIds(prev => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
      toast.error("Failed to delete chat session. Please try again.");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chat-sessions"] });
      toast.success("Chat deleted successfully");
    },
    onSettled: (data: any, error: any, id: string, context: any) => {
      if (context?.timeoutId) clearTimeout(context.timeoutId);
      // Clean up the hidden ID once the real data refresh is likely done
      setTimeout(() => {
        setHiddenIds(prev => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
      }, 1000);
    }
  });

  const sessions = sessionsQuery.data?.user_sessions || [];
  const visibleSessions = sessions.filter((s: any) => !hiddenIds.has(s.id));

  return {
    sessions: visibleSessions,
    isLoading: sessionsQuery.isLoading,
    deleteSession: deleteMutation.mutate,
    isDeleting: deleteMutation.isPending,
    deletingId: deleteMutation.variables
  };
};
