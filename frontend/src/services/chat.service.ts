import { api } from './api';

export interface ChatRequest {
  message: string;
  session_id?: string;
  create_session?: boolean;
  grade_test?: boolean;
  test_submission?: any[];
  quiz_id?: string;
  grading_instructions?: string;
  files?: File[];
  study_material_id?: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  type?: string;
  data?: any;
  record_id?: string;
  outputs?: Array<{
    type: string;
    data: any;
    record_id?: string;
  }>;
}

export const ChatService = {
  async sendMessageStream(
    request: ChatRequest,
    onToken: (token: string) => void,
    onStructuredData: (data: any) => void,
    onSessionId: (sessionId: string) => void
  ) {
    const token = localStorage.getItem('token');
    const formData = new FormData();

    // Append fields to formData if they exist
    Object.entries(request).forEach(([key, value]) => {
      if (value !== undefined) {
        if (key === 'files' && Array.isArray(value)) {
          value.forEach((file) => formData.append('files', file));
        } else if (typeof value === 'object') {
          formData.append(key, JSON.stringify(value));
        } else {
          formData.append(key, String(value));
        }
      }
    });

    const response = await fetch(`${api.defaults.baseURL}/chat/`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to connect to chat');
    }

    const sessionId = response.headers.get('X-Session-Id');
    if (sessionId) {
      onSessionId(sessionId);
    }

    const reader = response.body?.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    if (!reader) return;

    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        const trimmed = buffer.trim();
        if (trimmed) {
          if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
            try {
              const parsed = JSON.parse(trimmed);
              onStructuredData(parsed);
            } catch (e) {
              onToken(trimmed);
            }
          } else {
            onToken(trimmed);
          }
        }
        break;
      }

      const chunk = decoder.decode(value, { stream: true });
      buffer += chunk;

      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed) continue;

        // Try to detect if the line is a JSON object for structured data
        if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
          try {
            const parsed = JSON.parse(trimmed);
            onStructuredData(parsed);
            continue;
          } catch (e) {
            // Not valid JSON, treat as token
          }
        }
        
        // It's a raw token, send it with the newline that was split
        onToken(line + '\n');
      }
    }

    // Process remaining buffer
    if (buffer) {
      if (buffer.trim().startsWith('{') && buffer.trim().endsWith('}')) {
        try {
          const parsed = JSON.parse(buffer);
          onStructuredData(parsed);
        } catch (e) {
          onToken(buffer);
        }
      } else {
        onToken(buffer);
      }
    }
  },

  async getSessions() {
    const response = await api.get('/chat/sessions/');
    return response.data;
  },

  async getSessionMessages(sessionId: string) {
    const response = await api.get(`/chat/sessions/messages/?session_id=${sessionId}`);
    return response.data;
  },

  async deleteSession(sessionId: string) {
    const response = await api.delete(`/chat/sessions/delete/?session_id=${sessionId}`);
    return response.data;
  }
};
