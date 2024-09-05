import express from "express";
import dotenv from "dotenv";
import multer from "multer";
import fs from "fs";
import path from "path";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import { v4 as uuidv4 } from "uuid";
import cors from "cors";
import { fileURLToPath } from "url";
import { dirname } from "path";
import FormData from "form-data";
import { setApiKey } from "./apiKeyManager.js";
import createOpenAIInstance from "./openaiInstance.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config();

const app = express();

app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

// Initialize OpenAI instance
let openai = createOpenAIInstance();

let currentRateLimit = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
};

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Security enhancements
app.use(helmet());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

let currentFileSize = 10 * 1024 * 1024; // 10MB limit

// Update the rate limiter to use the dynamic values
const getLimiter = () =>
  rateLimit({
    windowMs: currentRateLimit.windowMs,
    max: currentRateLimit.max,
  });

// Update the multer setup to use the dynamic file size
const getUpload = () =>
  multer({
    storage: storage,
    limits: { fileSize: currentFileSize },
    fileFilter: (req, file, cb) => {
      const allowedTypes = [
        "image/jpeg",
        "image/png",
        "application/pdf",
        "text/plain", // This is the MIME type for .txt files
        "application/msword", // .doc
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx
        "application/json",
      ];
      if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(
          new Error(
            `Invalid file type. Only JPEG, PNG, PDF, TXT, DOC, DOCX, and JSON are allowed. Received: ${file.mimetype}`
          )
        );
      }
    },
  });

// Add new routes to update rate limit and file size
app.post("/update-rate-limit", (req, res) => {
  const { windowMs, max } = req.body;
  currentRateLimit = { windowMs, max };
  res.json({ message: "Rate limit updated successfully", currentRateLimit });
});

app.post("/update-file-size", (req, res) => {
  const { fileSize } = req.body;
  currentFileSize = fileSize * 1024 * 1024; // Convert MB to bytes
  res.json({
    message: "File size limit updated successfully",
    currentFileSize,
  });
});

// Update the /api-defaults route to include rate limit and file size
app.get("/api-defaults", (req, res) => {
  const defaults = {
    assistantId: process.env.DEFAULT_ASSISTANT_ID || "",
    threadId: process.env.DEFAULT_THREAD_ID || "",
    messageId: process.env.DEFAULT_MESSAGE_ID || "",
    runId: process.env.DEFAULT_RUN_ID || "",
    fileId: process.env.DEFAULT_FILE_ID || "",
    vectorStoreId: process.env.DEFAULT_VECTOR_STORE_ID || "",
    defaultBody: {
      createAssistant: JSON.stringify(
        {
          name: "My Assistant",
          instructions: "You are a helpful assistant.",
          model: "gpt-4-1106-preview",
        },
        null,
        2
      ),
      createThread: JSON.stringify(
        {
          messages: [{ role: "user", content: "Hello, assistant!" }],
        },
        null,
        2
      ),
      createMessage: JSON.stringify(
        {
          role: "user",
          content: "Hello, how are you?",
        },
        null,
        2
      ),
      createRun: JSON.stringify(
        {
          assistant_id:
            process.env.DEFAULT_ASSISTANT_ID || "your_assistant_id_here",
        },
        null,
        2
      ),
      createVectorStore: JSON.stringify(
        {
          name: "My Vector Store",
          description: "A sample vector store",
        },
        null,
        2
      ),
    },
    rateLimit: currentRateLimit,
    fileSize: currentFileSize / (1024 * 1024), // Convert bytes to MB
  };
  res.json(defaults);
});

// Update existing routes to use the dynamic limiter and upload
app.use(getLimiter());

// Set up multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, "uploads");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir);
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${uuidv4()}${path.extname(file.originalname)}`);
  },
});

// Error handling middleware
const errorHandler = (error, req, res, next) => {
  console.error(error);
  res.status(error.status || 500).json({
    error: {
      message: error.message || "Internal Server Error",
    },
  });
};

// Async handler to catch errors in async routes
const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

// Assistants
app.post(
  "/create-assistant",
  asyncHandler(async (req, res) => {
    const response = await openai.post("/assistants", req.body);
    res.json(response.data);
  })
);

app.get(
  "/list-assistants",
  asyncHandler(async (req, res) => {
    const response = await openai.get("/assistants", { params: req.query });
    res.json(response.data);
  })
);

app.get(
  "/retrieve-assistant/:assistant_id",
  asyncHandler(async (req, res) => {
    const response = await openai.get(`/assistants/${req.params.assistant_id}`);
    res.json(response.data);
  })
);

app.patch(
  "/update-assistant/:assistant_id",
  asyncHandler(async (req, res) => {
    const response = await openai.post(
      `/assistants/${req.params.assistant_id}`,
      req.body
    );
    res.json(response.data);
  })
);

app.delete(
  "/delete-assistant/:assistant_id",
  asyncHandler(async (req, res) => {
    const response = await openai.delete(
      `/assistants/${req.params.assistant_id}`
    );
    res.json(response.data);
  })
);

// Threads
app.post(
  "/create-thread",
  asyncHandler(async (req, res) => {
    const response = await openai.post("/threads", req.body);
    res.json(response.data);
  })
);

app.get(
  "/retrieve-thread/:thread_id",
  asyncHandler(async (req, res) => {
    const response = await openai.get(`/threads/${req.params.thread_id}`);
    res.json(response.data);
  })
);

app.patch(
  "/update-thread/:thread_id",
  asyncHandler(async (req, res) => {
    const response = await openai.post(
      `/threads/${req.params.thread_id}`,
      req.body
    );
    res.json(response.data);
  })
);

app.delete(
  "/delete-thread/:thread_id",
  asyncHandler(async (req, res) => {
    const response = await openai.delete(`/threads/${req.params.thread_id}`);
    res.json(response.data);
  })
);

// Messages
app.post(
  "/create-message/:thread_id",
  asyncHandler(async (req, res) => {
    const response = await openai.post(
      `/threads/${req.params.thread_id}/messages`,
      req.body
    );
    res.json(response.data);
  })
);

app.get(
  "/list-messages/:thread_id",
  asyncHandler(async (req, res) => {
    const response = await openai.get(
      `/threads/${req.params.thread_id}/messages`,
      { params: req.query }
    );
    res.json(response.data);
  })
);

app.get(
  "/retrieve-message/:thread_id/:message_id",
  asyncHandler(async (req, res) => {
    const response = await openai.get(
      `/threads/${req.params.thread_id}/messages/${req.params.message_id}`
    );
    res.json(response.data);
  })
);

app.patch(
  "/update-message/:thread_id/:message_id",
  asyncHandler(async (req, res) => {
    const response = await openai.post(
      `/threads/${req.params.thread_id}/messages/${req.params.message_id}`,
      req.body
    );
    res.json(response.data);
  })
);

// Runs
app.post(
  "/create-run/:thread_id",
  asyncHandler(async (req, res) => {
    const response = await openai.post(
      `/threads/${req.params.thread_id}/runs`,
      req.body
    );
    res.json(response.data);
  })
);

app.get(
  "/retrieve-run/:thread_id/:run_id",
  asyncHandler(async (req, res) => {
    const response = await openai.get(
      `/threads/${req.params.thread_id}/runs/${req.params.run_id}`
    );
    res.json(response.data);
  })
);

app.post(
  "/cancel-run/:thread_id/:run_id",
  asyncHandler(async (req, res) => {
    const response = await openai.post(
      `/threads/${req.params.thread_id}/runs/${req.params.run_id}/cancel`
    );
    res.json(response.data);
  })
);

app.post(
  "/submit-tool-outputs/:thread_id/:run_id",
  asyncHandler(async (req, res) => {
    const response = await openai.post(
      `/threads/${req.params.thread_id}/runs/${req.params.run_id}/submit_tool_outputs`,
      req.body
    );
    res.json(response.data);
  })
);

// Vector Stores
app.post(
  "/create-vector-store",
  asyncHandler(async (req, res) => {
    const response = await openai.post("/vector_stores", req.body);
    res.json(response.data);
  })
);

app.get(
  "/list-vector-stores",
  asyncHandler(async (req, res) => {
    const response = await openai.get("/vector_stores", { params: req.query });
    res.json(response.data);
  })
);

app.get(
  "/retrieve-vector-store/:vector_store_id",
  asyncHandler(async (req, res) => {
    const response = await openai.get(
      `/vector_stores/${req.params.vector_store_id}`
    );
    res.json(response.data);
  })
);

app.patch(
  "/update-vector-store/:vector_store_id",
  asyncHandler(async (req, res) => {
    const response = await openai.post(
      `/vector_stores/${req.params.vector_store_id}`,
      req.body
    );
    res.json(response.data);
  })
);

app.delete(
  "/delete-vector-store/:vector_store_id",
  asyncHandler(async (req, res) => {
    const response = await openai.delete(
      `/vector_stores/${req.params.vector_store_id}`
    );
    res.json(response.data);
  })
);

// Streaming
app.post(
  "/stream-run/:thread_id/:run_id",
  asyncHandler(async (req, res) => {
    const { thread_id, run_id } = req.params;

    res.writeHead(200, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    });

    async function pollRunStatus() {
      while (true) {
        const runResponse = await openai.get(
          `/threads/${thread_id}/runs/${run_id}`
        );
        const run = runResponse.data;

        res.write(
          `data: ${JSON.stringify({ type: "status", content: run.status })}\n\n`
        );

        if (run.status === "completed") {
          const messagesResponse = await openai.get(
            `/threads/${thread_id}/messages`
          );
          const messages = messagesResponse.data.data;
          const latestMessage = messages[0];
          res.write(
            `data: ${JSON.stringify({
              type: "message",
              content: latestMessage.content[0].text.value,
            })}\n\n`
          );
          break;
        } else if (
          run.status === "failed" ||
          run.status === "cancelled" ||
          run.status === "expired"
        ) {
          res.write(
            `data: ${JSON.stringify({
              type: "error",
              content: `Run ${run.status}`,
            })}\n\n`
          );
          break;
        }

        await new Promise((resolve) => setTimeout(resolve, 1000)); // Poll every second
      }
    }

    await pollRunStatus();
    res.write("data: [DONE]\n\n");
    res.end();
  })
);

// Enhanced file operations
app.post(
  "/upload-file",
  getUpload().single("file"),
  asyncHandler(async (req, res) => {
    if (!req.file) {
      throw new Error("No file uploaded");
    }

    console.log("File uploaded:", req.file);

    const form = new FormData();
    form.append("file", fs.createReadStream(req.file.path), {
      filename: req.file.originalname,
      contentType: req.file.mimetype,
    });
    form.append("purpose", req.body.purpose || "assistants");

    try {
      const response = await openai.post("/files", form, {
        headers: {
          ...form.getHeaders(),
          Authorization: `Bearer ${OPENAI_API_KEY}`,
        },
      });

      // Delete the temporary file after upload
      fs.unlinkSync(req.file.path);

      res.json(response.data);
    } catch (error) {
      console.error(
        "Error uploading file to OpenAI:",
        error.response ? error.response.data : error.message
      );
      throw new Error("Failed to upload file to OpenAI");
    }
  })
);

app.get(
  "/list-files",
  asyncHandler(async (req, res) => {
    const response = await openai.get("/files", { params: req.query });
    res.json(response.data);
  })
);

app.get(
  "/retrieve-file/:file_id",
  asyncHandler(async (req, res) => {
    const response = await openai.get(`/files/${req.params.file_id}`);
    res.json(response.data);
  })
);

app.delete(
  "/delete-file/:file_id",
  asyncHandler(async (req, res) => {
    const response = await openai.delete(`/files/${req.params.file_id}`);
    res.json(response.data);
  })
);

app.get(
  "/retrieve-file-content/:file_id",
  asyncHandler(async (req, res) => {
    const response = await openai.get(`/files/${req.params.file_id}/content`);
    res.json(response.data);
  })
);

// Run Steps
app.get(
  "/list-run-steps/:thread_id/:run_id",
  asyncHandler(async (req, res) => {
    const response = await openai.get(
      `/threads/${req.params.thread_id}/runs/${req.params.run_id}/steps`,
      { params: req.query }
    );
    res.json(response.data);
  })
);

app.get(
  "/retrieve-run-step/:thread_id/:run_id/:step_id",
  asyncHandler(async (req, res) => {
    const response = await openai.get(
      `/threads/${req.params.thread_id}/runs/${req.params.run_id}/steps/${req.params.step_id}`
    );
    res.json(response.data);
  })
);

// Function calling (Tools)
const handleToolCalls = async (tool_calls) => {
  return Promise.all(
    tool_calls.map(async (call) => {
      const { id, function: func, arguments: args } = call;
      let output;

      try {
        // Dynamically call the function based on the function name
        if (typeof global[func.name] === "function") {
          output = await global[func.name](JSON.parse(args));
        } else {
          output = { error: `Unknown function: ${func.name}` };
        }
      } catch (error) {
        output = { error: `Error executing ${func.name}: ${error.message}` };
      }

      return { tool_call_id: id, output: JSON.stringify(output) };
    })
  );
};

app.post(
  "/execute-tools/:thread_id/:run_id",
  asyncHandler(async (req, res) => {
    const { thread_id, run_id } = req.params;
    const { tool_calls } = req.body;

    const toolOutputs = await handleToolCalls(tool_calls);

    const response = await openai.post(
      `/threads/${thread_id}/runs/${run_id}/submit_tool_outputs`,
      { tool_outputs: toolOutputs }
    );

    res.json(response.data);
  })
);

app.post("/set-api-key", (req, res) => {
  const { apiKey } = req.body;
  if (!apiKey) {
    return res.status(400).json({ error: "API key is required" });
  }
  setApiKey(apiKey);
  // Recreate the OpenAI instance with the new API key
  openai = createOpenAIInstance();
  res.json({ message: "API key set successfully" });
});

// Use error handling middleware
app.use(errorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
