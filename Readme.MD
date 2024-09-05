# OpenAI Assistants API Wrapper

## Table of Contents
- [OpenAI Assistants API Wrapper](#openai-assistants-api-wrapper)
  - [Table of Contents](#table-of-contents)
  - [Introduction](#introduction)
  - [Setup](#setup)
  - [API Endpoints](#api-endpoints)
    - [Assistants](#assistants)
    - [Threads](#threads)
    - [Messages](#messages)
    - [Runs](#runs)
    - [Vector Stores](#vector-stores)
    - [Files](#files)
    - [Run Steps](#run-steps)
    - [Streaming](#streaming)
    - [Function Calling (Tools)](#function-calling-tools)
  - [Configuration](#configuration)
  - [Error Handling](#error-handling)
  - [Security](#security)
  - [Usage Examples](#usage-examples)
    - [Assistants](#assistants-1)
      - [Create Assistant](#create-assistant)
      - [List Assistants](#list-assistants)
    - [Threads](#threads-1)
      - [Create Thread](#create-thread)
    - [Messages](#messages-1)
      - [Create Message](#create-message)
    - [Runs](#runs-1)
      - [Create Run](#create-run)
    - [Streaming](#streaming-1)
      - [Stream Run](#stream-run)
    - [Files](#files-1)
      - [Upload File](#upload-file)
    - [Configuration](#configuration-1)
      - [Update Rate Limit](#update-rate-limit)
      - [Update File Size Limit](#update-file-size-limit)
      - [Get API Defaults](#get-api-defaults)
      - [Set API Key](#set-api-key)

## Introduction

This API wrapper provides a comprehensive interface to interact with OpenAI's Assistants API. It offers endpoints for managing assistants, threads, messages, runs, vector stores, and file operations, making it easier to integrate OpenAI's powerful AI capabilities into your applications.

## Setup

1. Clone the repository:
   ```
   git clone https://github.com/your-repo/openai-assistants-api-wrapper.git
   cd openai-assistants-api-wrapper
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Set up environment variables in a `.env` file:
   ```
   OPENAI_API_KEY=your_openai_api_key
   PORT=3000
   DEFAULT_ASSISTANT_ID=your_default_assistant_id
   DEFAULT_THREAD_ID=your_default_thread_id
   DEFAULT_MESSAGE_ID=your_default_message_id
   DEFAULT_RUN_ID=your_default_run_id
   DEFAULT_FILE_ID=your_default_file_id
   DEFAULT_VECTOR_STORE_ID=your_default_vector_store_id
   ```

4. Start the server:
   ```
   npm start
   ```

## API Endpoints

### Assistants

- **Create Assistant**: `POST /create-assistant`
- **List Assistants**: `GET /list-assistants`
- **Retrieve Assistant**: `GET /retrieve-assistant/:assistant_id`
- **Update Assistant**: `PATCH /update-assistant/:assistant_id`
- **Delete Assistant**: `DELETE /delete-assistant/:assistant_id`

### Threads

- **Create Thread**: `POST /create-thread`
- **Retrieve Thread**: `GET /retrieve-thread/:thread_id`
- **Update Thread**: `PATCH /update-thread/:thread_id`
- **Delete Thread**: `DELETE /delete-thread/:thread_id`

### Messages

- **Create Message**: `POST /create-message/:thread_id`
- **List Messages**: `GET /list-messages/:thread_id`
- **Retrieve Message**: `GET /retrieve-message/:thread_id/:message_id`
- **Update Message**: `PATCH /update-message/:thread_id/:message_id`

### Runs

- **Create Run**: `POST /create-run/:thread_id`
- **Retrieve Run**: `GET /retrieve-run/:thread_id/:run_id`
- **Cancel Run**: `POST /cancel-run/:thread_id/:run_id`
- **Submit Tool Outputs**: `POST /submit-tool-outputs/:thread_id/:run_id`

### Vector Stores

- **Create Vector Store**: `POST /create-vector-store`
- **List Vector Stores**: `GET /list-vector-stores`
- **Retrieve Vector Store**: `GET /retrieve-vector-store/:vector_store_id`
- **Update Vector Store**: `PATCH /update-vector-store/:vector_store_id`
- **Delete Vector Store**: `DELETE /delete-vector-store/:vector_store_id`

### Files

- **Upload File**: `POST /upload-file`
- **List Files**: `GET /list-files`
- **Retrieve File**: `GET /retrieve-file/:file_id`
- **Delete File**: `DELETE /delete-file/:file_id`
- **Retrieve File Content**: `GET /retrieve-file-content/:file_id`

### Run Steps

- **List Run Steps**: `GET /list-run-steps/:thread_id/:run_id`
- **Retrieve Run Step**: `GET /retrieve-run-step/:thread_id/:run_id/:step_id`

### Streaming

- **Stream Run**: `POST /stream-run/:thread_id/:run_id`

### Function Calling (Tools)

- **Execute Tools**: `POST /execute-tools/:thread_id/:run_id`

## Configuration

- **Update Rate Limit**: `POST /update-rate-limit`
- **Update File Size Limit**: `POST /update-file-size`
- **Get API Defaults**: `GET /api-defaults`
- **Set API Key**: `POST /set-api-key`

## Error Handling

The API uses a global error handling middleware to catch and process errors. Errors are returned in the following format:

```json
{
  "error": {
    "message": "Error message"
  }
}
```

## Security

- Uses `helmet` for setting various HTTP headers
- Implements rate limiting to prevent abuse
- Sanitizes file uploads and limits file size
- Uses CORS for cross-origin resource sharing

For production deployment, implement additional security measures such as authentication and input validation.

## Usage Examples

Here are detailed examples of how to use the main endpoints:

### Assistants

#### Create Assistant

```javascript
const createAssistant = async () => {
  const response = await fetch('http://localhost:3000/create-assistant', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: "Math Tutor",
      instructions: "You are a helpful math tutor.",
      model: "gpt-4-1106-preview"
    })
  });
  const data = await response.json();
  console.log('Assistant created:', data);
};
```

#### List Assistants

```javascript
const listAssistants = async () => {
  const response = await fetch('http://localhost:3000/list-assistants');
  const data = await response.json();
  console.log('Assistants:', data);
};
```

### Threads

#### Create Thread

```javascript
const createThread = async () => {
  const response = await fetch('http://localhost:3000/create-thread', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      messages: [{ role: "user", content: "Hello, I need help with math." }]
    })
  });
  const data = await response.json();
  console.log('Thread created:', data);
};
```

### Messages

#### Create Message

```javascript
const createMessage = async (threadId) => {
  const response = await fetch(`http://localhost:3000/create-message/${threadId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      role: "user",
      content: "What is the formula for the area of a circle?"
    })
  });
  const data = await response.json();
  console.log('Message created:', data);
};
```

### Runs

#### Create Run

```javascript
const createRun = async (threadId, assistantId) => {
  const response = await fetch(`http://localhost:3000/create-run/${threadId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ assistant_id: assistantId })
  });
  const data = await response.json();
  console.log('Run created:', data);
};
```

### Streaming

#### Stream Run

```javascript
const streamRun = async (threadId, runId) => {
  const response = await fetch(`http://localhost:3000/stream-run/${threadId}/${runId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ stream: true })
  });

  const reader = response.body.getReader();
  const decoder = new TextDecoder();

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    console.log('Streamed data:', decoder.decode(value));
  }
};
```

### Files

#### Upload File

```javascript
const uploadFile = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('purpose', 'assistants');

  const response = await fetch('http://localhost:3000/upload-file', {
    method: 'POST',
    body: formData
  });
  const data = await response.json();
  console.log('File uploaded:', data);
};
```

### Configuration

#### Update Rate Limit

```javascript
const updateRateLimit = async () => {
  const response = await fetch('http://localhost:3000/update-rate-limit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ windowMs: 900000, max: 100 })
  });
  const data = await response.json();
  console.log('Rate limit updated:', data);
};
```

#### Update File Size Limit

```javascript
const updateFileSizeLimit = async (fileSize) => {
  const response = await fetch('http://localhost:3000/update-file-size', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ fileSize })
  });
  const data = await response.json();
  console.log('File size limit updated:', data);
};
```

#### Get API Defaults

```javascript
const getApiDefaults = async () => {
  const response = await fetch('http://localhost:3000/api-defaults');
  const data = await response.json();
  console.log('API defaults:', data);
};
```

#### Set API Key

```javascript
const setApiKey = async (apiKey) => {
  const response = await fetch('http://localhost:3000/set-api-key', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ apiKey })
  });
  const data = await response.json();
  console.log('API key set:', data);
};
```

Remember to replace placeholder values (like `asst_abc123`, `thread_abc123`, etc.) with actual IDs when using these requests.