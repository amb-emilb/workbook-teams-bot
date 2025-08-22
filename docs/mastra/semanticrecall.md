Semantic Recall
If you ask your friend what they did last weekend, they will search in their memory for events associated with “last weekend” and then tell you what they did. That’s sort of like how semantic recall works in Mastra.

📹 Watch: What semantic recall is, how it works, and how to configure it in Mastra → YouTube (5 minutes) 

How Semantic Recall Works
Semantic recall is RAG-based search that helps agents maintain context across longer interactions when messages are no longer within recent conversation history.

It uses vector embeddings of messages for similarity search, integrates with various vector stores, and has configurable context windows around retrieved messages.


Diagram showing Mastra Memory semantic recall
When it’s enabled, new messages are used to query a vector DB for semantically similar messages.

After getting a response from the LLM, all new messages (user, assistant, and tool calls/results) are inserted into the vector DB to be recalled in later interactions.

Quick Start
Semantic recall is enabled by default, so if you give your agent memory it will be included:

import { Agent } from "@mastra/core/agent";
import { Memory } from "@mastra/memory";
import { openai } from "@ai-sdk/openai";
 
const agent = new Agent({
  name: "SupportAgent",
  instructions: "You are a helpful support agent.",
  model: openai("gpt-4o"),
  memory: new Memory(),
});
Recall configuration
The three main parameters that control semantic recall behavior are:

topK: How many semantically similar messages to retrieve
messageRange: How much surrounding context to include with each match
scope: Whether to search within the current thread or across all threads owned by a resource. Using scope: 'resource' allows the agent to recall information from any of the user’s past conversations.
const agent = new Agent({
  memory: new Memory({
    options: {
      semanticRecall: {
        topK: 3, // Retrieve 3 most similar messages
        messageRange: 2, // Include 2 messages before and after each match
        scope: 'resource', // Search across all threads for this user
      },
    },
  }),
});
Note: currently, scope: 'resource' for semantic recall is supported by the following storage adapters: LibSQL, Postgres, and Upstash.

Storage configuration
Semantic recall relies on a storage and vector db to store messages and their embeddings.

import { Memory } from "@mastra/memory";
import { Agent } from "@mastra/core/agent";
import { LibSQLStore, LibSQLVector } from "@mastra/libsql";
 
const agent = new Agent({
  memory: new Memory({
    // this is the default storage db if omitted
    storage: new LibSQLStore({
      url: "file:./local.db",
    }),
    // this is the default vector db if omitted
    vector: new LibSQLVector({
      connectionUrl: "file:./local.db",
    }),
  }),
});
Storage/vector code Examples:

LibSQL
Postgres
Upstash
Embedder configuration
Semantic recall relies on an embedding model to convert messages into embeddings. You can specify any embedding model  compatible with the AI SDK.

To use FastEmbed (a local embedding model), install @mastra/fastembed:


npm install @mastra/fastembed
Then configure it in your memory:

import { Memory } from "@mastra/memory";
import { Agent } from "@mastra/core/agent";
import { fastembed } from "@mastra/fastembed";
 
const agent = new Agent({
  memory: new Memory({
    // ... other memory options
    embedder: fastembed,
  }),
});
Alternatively, use a different provider like OpenAI:

import { Memory } from "@mastra/memory";
import { Agent } from "@mastra/core/agent";
import { openai } from "@ai-sdk/openai";
 
const agent = new Agent({
  memory: new Memory({
    // ... other memory options
    embedder: openai.embedding("text-embedding-3-small"),
  }),
});
Disabling
There is a performance impact to using semantic recall. New messages are converted into embeddings and used to query a vector database before new messages are sent to the LLM.

Semantic recall is enabled by default but can be disabled when not needed:

const agent = new Agent({
  memory: new Memory({
    options: {
      semanticRecall: false,
    },
  }),
});
You might want to disable semantic recall in scenarios like:

When conversation history provide sufficient context for the current conversation.
In performance-sensitive applications, like realtime two-way audio, where the added latency of creating embeddings and running vector queries is noticeable.
Viewing Recalled Messages
When tracing is enabled, any messages retrieved via semantic recall will appear in the agent’s trace output, alongside recent conversation history (if configured).

For more info on viewing message traces, see Viewing Retrieved Messages.

Overview
Working Memory