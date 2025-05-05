// "use client";

// import * as React from "react";
// import type { Contact, Message, MessageType, Participant, Thread } from "./types";

// function noop(): void {}

// export type CreateThreadParams =
//   | { type: "direct"; recipientId: string }
//   | { type: "group"; recipientIds: string[] };

// export interface CreateMessageParams {
//   profileSynth?: any;
//   threadId: string;
//   type: MessageType; // "text" | "image" | "llm"
//   content: string;
//   chartData?:any[]
//   sql?: string; 
//   data?:{};     // Only used for LLM messages
//   profile?: any;
// }

// export interface ChatContextValue {
//   contacts: Contact[];
//   threads: Thread[];
//   messages: Map<string, Message[]>;
//   createThread: (params: CreateThreadParams) => string;
//   markAsRead: (threadId: string) => void;
//   createMessage: (params: CreateMessageParams) => void;
//   openDesktopSidebar: boolean;
//   setOpenDesktopSidebar: React.Dispatch<React.SetStateAction<boolean>>;
//   openMobileSidebar: boolean;
//   setOpenMobileSidebar: React.Dispatch<React.SetStateAction<boolean>>;
// }

// export const ChatContext = React.createContext<ChatContextValue>({
//   contacts: [],
//   threads: [],
//   messages: new Map(),
//   createThread: noop as () => string,
//   markAsRead: noop,
//   createMessage: noop,
//   openDesktopSidebar: true,
//   setOpenDesktopSidebar: noop,
//   openMobileSidebar: true,
//   setOpenMobileSidebar: noop,
// });

// export interface ChatProviderProps {
//   children: React.ReactNode;
//   contacts: Contact[];
//   threads: Thread[];
//   messages: Message[];
// }

// export function ChatProvider({
//   children,
//   contacts: initialContacts = [],
//   threads: initialThreads = [],
//   messages: initialMessages = [],
// }: ChatProviderProps): React.JSX.Element {
//   const [contacts, setContacts] = React.useState<Contact[]>([]);
//   const [threads, setThreads] = React.useState<Thread[]>([]);
//   const [messageMap, setMessageMap] = React.useState<Map<string, Message[]>>(new Map());

//   const [openDesktopSidebar, setOpenDesktopSidebar] = React.useState<boolean>(true);
//   const [openMobileSidebar, setOpenMobileSidebar] = React.useState<boolean>(false);

//   React.useEffect(() => {
//     setContacts(initialContacts);
//   }, [initialContacts]);

//   React.useEffect(() => {
//     setThreads(initialThreads);
//   }, [initialThreads]);

//   React.useEffect(() => {
//     const newMap = new Map<string, Message[]>();
//     initialMessages.forEach((msg) => {
//       if (!newMap.has(msg.threadId)) {
//         newMap.set(msg.threadId, []);
//       }
//       newMap.get(msg.threadId)?.push(msg);
//     });
//     setMessageMap(newMap);
//   }, [initialMessages]);

//   // Example placeholder for createThread and markAsRead
//   const createThread = React.useCallback((params: CreateThreadParams): string => {
//     // ... your logic
//     return "THREAD_ID";
//   }, []);

//   const markAsRead = React.useCallback((threadId: string) => {
//     // ... your logic
//   }, []);

//   /**
//    * Creates a new message. If type === "llm", we assign LLM author,
//    * otherwise the user.
//    */
//   let messageCounter = 0;

//   const createMessage = React.useCallback((params: CreateMessageParams): void => {
//     let author;
//     if (params.type === "llm") {
//       // LLM message
//       author = { id: "LLM-123", name: "OpenAI LLM", avatar: "/assets/robot-avatar.png" };
//     } else {
//       // User message
//       author = { id: "USR-000", name: "Sofia Rivers", avatar: "/assets/avatar.png" };
//     }

//     const newMessage: Message = {
//       id: `MSG-${Date.now()}-${messageCounter++}`,
//       threadId: params.threadId,
//       type: params.type,
//       author,
//       content: params.content,
//       createdAt: new Date(),
//       sql: params.sql,
//       // Include chartData if provided
//       chartData: params.chartData ?? [],
//       profile: params.profile,
//       profileSynth: params.profileSynth
//     };

//     setMessageMap((prev) => {
//       const copy = new Map(prev);
//       const msgs = copy.get(params.threadId) || [];
//       msgs.push(newMessage);
//       copy.set(params.threadId, msgs);
//       return copy;
//     });
//   }, []);

//   const value: ChatContextValue = {
//     contacts,
//     threads,
//     messages: messageMap,
//     createThread,
//     markAsRead,
//     createMessage,
//     openDesktopSidebar,
//     setOpenDesktopSidebar,
//     openMobileSidebar,
//     setOpenMobileSidebar,
//   };

//   return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
// }

"use client";

import * as React from "react";
import type { Contact, Message, MessageType, Thread } from "./types";

// A simple no-op function for defaults
function noop(): void {}

export type CreateThreadParams =
  | { type: "direct"; recipientId: string }
  | { type: "group"; recipientIds: string[] };

export interface CreateMessageParams {
  threadId: string;
  type: MessageType; // "text" | "image" | "llm"
  content: string;
  chartData?: any[];
  sql?: string;
  profile?: any;
  profileSynth?: any;
  data?: {}; // optional
  generatedCode?: string;
  parameterizedSummary?: string;
}

export interface ChatContextValue {
  contacts: Contact[];
  threads: Thread[];
  messages: Map<string, Message[]>;
  createThread: (params: CreateThreadParams) => string;
  markAsRead: (threadId: string) => void;
  createMessage: (params: CreateMessageParams) => void;
  updateMessage: (messageId: string, changes: Partial<Message>) => void;
  openDesktopSidebar: boolean;
  setOpenDesktopSidebar: React.Dispatch<React.SetStateAction<boolean>>;
  openMobileSidebar: boolean;
  setOpenMobileSidebar: React.Dispatch<React.SetStateAction<boolean>>;
}

export const ChatContext = React.createContext<ChatContextValue>({
  contacts: [],
  threads: [],
  messages: new Map(),
  createThread: noop as () => string,
  markAsRead: noop,
  createMessage: noop,
  updateMessage: noop,
  openDesktopSidebar: true,
  setOpenDesktopSidebar: noop,
  openMobileSidebar: true,
  setOpenMobileSidebar: noop,
});

export interface ChatProviderProps {
  children: React.ReactNode;
  contacts: Contact[];
  threads: Thread[];
  messages: Message[];
}

export function ChatProvider({
  children,
  contacts: initialContacts = [],
  threads: initialThreads = [],
  messages: initialMessages = [],
}: ChatProviderProps): React.JSX.Element {
  const [contacts, setContacts] = React.useState<Contact[]>([]);
  const [threads, setThreads] = React.useState<Thread[]>([]);
  const [messageMap, setMessageMap] = React.useState<Map<string, Message[]>>(new Map());

  const [openDesktopSidebar, setOpenDesktopSidebar] = React.useState<boolean>(true);
  const [openMobileSidebar, setOpenMobileSidebar] = React.useState<boolean>(false);

  React.useEffect(() => {
    setContacts(initialContacts);
  }, [initialContacts]);

  React.useEffect(() => {
    setThreads(initialThreads);
  }, [initialThreads]);

  React.useEffect(() => {
    // Convert the array of messages into a Map, keyed by threadId
    const newMap = new Map<string, Message[]>();
    initialMessages.forEach((msg) => {
      if (!newMap.has(msg.threadId)) {
        newMap.set(msg.threadId, []);
      }
      newMap.get(msg.threadId)?.push(msg);
    });
    setMessageMap(newMap);
  }, [initialMessages]);

  // Placeholders for thread creation / marking read
  const createThread = React.useCallback((params: CreateThreadParams): string => {
    // ...
    return "THREAD_ID";
  }, []);

  const markAsRead = React.useCallback((threadId: string) => {
    // ...
  }, []);

  let messageCounter = 0;

  /**
   * Add a new message to the thread.
   */
  const createMessage = React.useCallback((params: CreateMessageParams): void => {
    let author;
    if (params.type === "llm") {
      author = { id: "LLM-123", name: "OpenAI LLM", avatar: "/assets/robot-avatar.png" };
    } else {
      author = { id: "USR-000", name: "Sofia Rivers", avatar: "/assets/avatar.png" };
    }

    const newMessage: Message = {
      id: `MSG-${Date.now()}-${messageCounter++}`,
      threadId: params.threadId,
      type: params.type,
      author,
      content: params.content,
      createdAt: new Date(),
      sql: params.sql,
      chartData: params.chartData ?? [],
      profile: params.profile,
      profileSynth: params.profileSynth,
      // new fields
      generated_code: params.sql || "",
      parameterizedSummary: params.parameterizedSummary || "",
    };

    setMessageMap((prev) => {
      const copy = new Map(prev);
      const msgs = copy.get(params.threadId) || [];
      msgs.push(newMessage);
      copy.set(params.threadId, msgs);
      return copy;
    });
  }, []);

  /**
   * Update an existing message by ID with partial changes (like new chartData).
   */
  const updateMessage = React.useCallback((messageId: string, changes: Partial<Message>) => {
    setMessageMap((prev) => {
      const copy = new Map(prev);

      for (const [threadId, msgs] of copy.entries()) {
        const index = msgs.findIndex((m) => m.id === messageId);
        if (index !== -1) {
          const oldMsg = msgs[index];
          const updatedMsg = { ...oldMsg, ...changes };
          const updatedArray = [...msgs];
          updatedArray[index] = updatedMsg;
          copy.set(threadId, updatedArray);
          break;
        }
      }
      return copy;
    });
  }, []);

  const value: ChatContextValue = {
    contacts,
    threads,
    messages: messageMap,
    createThread,
    markAsRead,
    createMessage,
    updateMessage,
    openDesktopSidebar,
    setOpenDesktopSidebar,
    openMobileSidebar,
    setOpenMobileSidebar,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}

