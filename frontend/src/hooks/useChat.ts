import { useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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
                return [
                  ...prev.slice(0, lastIndex),
                  {
                    ...prev[lastIndex],
                    type: structuredData.type,
                    data: structuredData.data,
                    record_id: structuredData.record_id,
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
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: "Sorry, I encountered an error. Please try again.",
          },
        ]);
      } finally {
        setIsStreaming(false);
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

  const sessionsQuery = useQuery({
    queryKey: ["chat-sessions"],
    queryFn: () => ChatService.getSessions(),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => ChatService.deleteSession(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chat-sessions"] });
    },
  });

  return {
    sessions: sessionsQuery.data?.user_sessions || [],
    isLoading: sessionsQuery.isLoading,
    deleteSession: deleteMutation.mutate,
  };
};
