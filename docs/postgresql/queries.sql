  1. See Your Chat Messages Your Conversations!

  SELECT
      "createdAt",
      role,
      LEFT(content, 100) as message_preview,
      thread_id,
      "resourceId"
  FROM mastra_messages
  ORDER BY "createdAt" DESC
  LIMIT 20;

  2. See Your Conversation Threads

  SELECT
      id,
      "createdAt",
      "updatedAt",
      title,
      "resourceId",
      metadata
  FROM mastra_threads
  ORDER BY "updatedAt" DESC
  LIMIT 10;

  3. See User Resources (run this first to see the structure):

  SELECT column_name, data_type
  FROM information_schema.columns
  WHERE table_name = 'mastra_resources'
  ORDER BY ordinal_position;

  4. Count Total Messages

  SELECT COUNT(*) as total_messages FROM mastra_messages;

  5. See Who's Been Chatting

  SELECT
      "resourceId",
      COUNT(*) as message_count,
      MAX("createdAt") as last_message
  FROM mastra_messages
  GROUP BY "resourceId"
  ORDER BY last_message DESC;