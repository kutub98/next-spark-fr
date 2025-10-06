const API_KEY = "AIzaSyBNKy4yFLNfsTbUIJzRpQu3RxP7Ey0Bg4E";
const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`;

// Import pdfjs-dist for browser-compatible PDF text extraction
import { pdfjsLib } from "./pdfjs-config";

export interface ExtractedQuestion {
  text: string;
  type: "MCQ" | "Short" | "Written";
  options?: string[];
  correctAnswer?: string;
  marks: number;
  difficulty: "easy" | "medium" | "hard";
  wordLimit?: number;
  timeLimit?: number;
}

export interface ImportResult {
  success: boolean;
  questions: ExtractedQuestion[];
  errors: string[];
  totalProcessed: number;
}

export class GeminiOCRService {
  private static async extractTextFromFile(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = async (e) => {
        try {
          const arrayBuffer = e.target?.result as ArrayBuffer;

          if (file.type.startsWith("image/")) {
            // For images, use a more reliable base64 encoding
            const uint8Array = new Uint8Array(arrayBuffer);
            const base64 = this.arrayBufferToBase64(uint8Array);
            resolve(base64);
          } else if (file.type === "application/pdf") {
            // For PDFs, use a more reliable base64 encoding
            const uint8Array = new Uint8Array(arrayBuffer);
            const base64 = this.arrayBufferToBase64(uint8Array);
            resolve(base64);
          } else {
            // For text files
            const text = new TextDecoder().decode(arrayBuffer);
            resolve(text);
          }
        } catch (error) {
          console.error("Error processing file:", error);
          reject(
            new Error(
              `Failed to process file: ${
                error instanceof Error ? error.message : "Unknown error"
              }`
            )
          );
        }
      };

      reader.onerror = () => {
        console.error("FileReader error");
        reject(new Error("Failed to read file"));
      };

      reader.onabort = () => {
        console.error("FileReader aborted");
        reject(new Error("File reading was aborted"));
      };

      try {
        reader.readAsArrayBuffer(file);
      } catch (error) {
        console.error("Error starting file read:", error);
        reject(
          new Error(
            `Failed to start reading file: ${
              error instanceof Error ? error.message : "Unknown error"
            }`
          )
        );
      }
    });
  }

  private static arrayBufferToBase64(buffer: Uint8Array): string {
    // More reliable base64 encoding method
    let binary = "";
    const len = buffer.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(buffer[i]);
    }
    return btoa(binary);
  }

  private static isValidBase64(str: string): boolean {
    try {
      // Check if string is valid base64
      const base64Regex = /^[A-Za-z0-9+/]*={0,2}$/;
      if (!base64Regex.test(str)) {
        return false;
      }

      // Try to decode and re-encode to verify
      const decoded = atob(str);
      const reEncoded = btoa(decoded);
      return reEncoded === str;
    } catch {
      return false;
    }
  }

  private static async extractTextFromPDFAsText(file: File): Promise<string> {
    // Use pdfjs-dist for browser-compatible PDF text extraction
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = async (e) => {
        try {
          const arrayBuffer = e.target?.result as ArrayBuffer;
          const uint8Array = new Uint8Array(arrayBuffer);

          console.log("Loading PDF document with pdfjs-dist...");

          // Load PDF document with better error handling
          const loadingTask = pdfjsLib.getDocument({
            data: uint8Array,
            verbosity: 0, // Reduce console output
            disableAutoFetch: false,
            disableStream: false,
          });

          const pdf = await loadingTask.promise;
          console.log(`PDF loaded successfully. Pages: ${pdf.numPages}`);

          let fullText = "";
          let pagesProcessed = 0;

          // Extract text from all pages with progress tracking
          for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
            try {
              console.log(`Processing page ${pageNum}/${pdf.numPages}...`);
              const page = await pdf.getPage(pageNum);
              const textContent = await page.getTextContent();

              const pageText = textContent.items
                .map((item) => {
                  if ("str" in item) {
                    return item.str;
                  }
                  return "";
                })
                .join(" ")
                .trim();

              if (pageText) {
                fullText += `Page ${pageNum}:\n${pageText}\n\n`;
                pagesProcessed++;
              }
            } catch (pageError) {
              console.warn(`Error processing page ${pageNum}:`, pageError);
              // Continue with other pages even if one fails
            }
          }

          console.log(`Successfully processed ${pagesProcessed} pages`);

          if (!fullText || fullText.trim().length === 0) {
            reject(
              new Error(
                "No text content found in PDF. The PDF might be image-based or corrupted."
              )
            );
          } else {
            console.log(`Extracted text length: ${fullText.length} characters`);
            resolve(fullText.trim());
          }
        } catch (error) {
          console.error("PDF parsing error:", error);
          if (error instanceof Error) {
            if (error.message.includes("Invalid PDF")) {
              reject(
                new Error(
                  "Invalid PDF file. Please check if the file is corrupted."
                )
              );
            } else if (error.message.includes("Password")) {
              reject(
                new Error(
                  "PDF is password protected. Please provide an unprotected PDF."
                )
              );
            } else {
              reject(
                new Error(`Failed to extract text from PDF: ${error.message}`)
              );
            }
          } else {
            reject(
              new Error("Failed to extract text from PDF using pdfjs-dist")
            );
          }
        }
      };

      reader.onerror = () => reject(new Error("Failed to read PDF file"));
      reader.readAsArrayBuffer(file);
    });
  }

  private static async extractTextFromPDFDirect(file: File): Promise<string> {
    // Simple fallback: try to read PDF as text (this won't work for most PDFs but worth trying)
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        try {
          const arrayBuffer = e.target?.result as ArrayBuffer;
          const text = new TextDecoder().decode(arrayBuffer);

          // Check if the text contains readable content (not just binary data)
          if (text.length < 100 || !/[a-zA-Z]{3,}/.test(text)) {
            reject(new Error("PDF appears to be image-based or binary-only"));
          } else {
            resolve(text);
          }
        } catch {
          reject(
            new Error("Failed to extract text from PDF using direct method")
          );
        }
      };

      reader.onerror = () => reject(new Error("Failed to read PDF file"));
      reader.readAsText(file);
    });
  }

  private static async validatePDFFile(
    file: File
  ): Promise<{ isValid: boolean; error?: string }> {
    return new Promise((resolve) => {
      // Check file size
      if (file.size > 50 * 1024 * 1024) {
        // 50MB
        resolve({ isValid: false, error: "PDF file is too large (max 50MB)" });
        return;
      }

      // Check file type
      if (file.type !== "application/pdf") {
        resolve({ isValid: false, error: "File is not a PDF" });
        return;
      }

      // Try to read the first few bytes to check if it's a valid PDF
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const arrayBuffer = e.target?.result as ArrayBuffer;
          const uint8Array = new Uint8Array(arrayBuffer.slice(0, 8));
          const header = Array.from(uint8Array)
            .map((byte) => String.fromCharCode(byte))
            .join("");

          if (!header.startsWith("%PDF-")) {
            resolve({
              isValid: false,
              error: "File does not appear to be a valid PDF",
            });
            return;
          }

          resolve({ isValid: true });
        } catch {
          resolve({ isValid: false, error: "Unable to validate PDF file" });
        }
      };

      reader.onerror = () =>
        resolve({ isValid: false, error: "Unable to read PDF file" });
      reader.readAsArrayBuffer(file.slice(0, 1024)); // Read only first 1KB
    });
  }

  private static async processLargeContent(
    content: string,
    fileType: string,
    isTextContent: boolean = false
  ): Promise<string> {
    // If content is too large, split it into chunks and process separately
    const maxChunkSize = 10000; // 10KB chunks for text processing
    const chunks = this.splitTextIntoChunks(content, maxChunkSize);

    if (chunks.length === 1) {
      // Content is small enough, process normally
      return this.callGeminiAPI(content, fileType, isTextContent);
    }

    console.log(`Processing large content in ${chunks.length} chunks`);

    const allQuestions: ExtractedQuestion[] = [];
    const allErrors: string[] = [];

    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      console.log(`Processing chunk ${i + 1}/${chunks.length}`);

      try {
        const response = await this.callGeminiAPI(chunk, fileType, true);
        const questions = this.parseGeminiResponse(response);
        allQuestions.push(...questions);
      } catch (error) {
        console.error(`Error processing chunk ${i + 1}:`, error);
        allErrors.push(
          `Chunk ${i + 1}: ${
            error instanceof Error ? error.message : "Unknown error"
          }`
        );
      }

      // Add delay between chunks to prevent rate limiting
      if (i < chunks.length - 1) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }

    if (allQuestions.length === 0) {
      throw new Error("No questions found in any chunk of the document");
    }

    // Return the combined questions as JSON
    return JSON.stringify({ questions: allQuestions });
  }

  private static splitTextIntoChunks(
    text: string,
    maxChunkSize: number
  ): string[] {
    const chunks: string[] = [];
    const sentences = text.split(/[.!?]+/);
    let currentChunk = "";

    for (const sentence of sentences) {
      const trimmedSentence = sentence.trim();
      if (!trimmedSentence) continue;

      if (currentChunk.length + trimmedSentence.length + 1 <= maxChunkSize) {
        currentChunk += (currentChunk ? ". " : "") + trimmedSentence;
      } else {
        if (currentChunk) {
          chunks.push(currentChunk + ".");
          currentChunk = trimmedSentence;
        } else {
          // Single sentence is too long, split by words
          const words = trimmedSentence.split(" ");
          let wordChunk = "";
          for (const word of words) {
            if (wordChunk.length + word.length + 1 <= maxChunkSize) {
              wordChunk += (wordChunk ? " " : "") + word;
            } else {
              if (wordChunk) chunks.push(wordChunk);
              wordChunk = word;
            }
          }
          if (wordChunk) currentChunk = wordChunk;
        }
      }
    }

    if (currentChunk) {
      chunks.push(currentChunk + (currentChunk.endsWith(".") ? "" : "."));
    }

    return chunks.filter((chunk) => chunk.trim().length > 0);
  }

  private static async callGeminiAPI(
    content: string,
    fileType: string,
    isTextContent: boolean = false
  ): Promise<string> {
    const isImage = fileType.startsWith("image/");
    const isPDF = fileType === "application/pdf";
    const isDoc = fileType.includes("document") || fileType.includes("word");

    let prompt = "";

    if (isImage || isPDF || isDoc) {
      prompt = `
        Analyze this ${
          isImage ? "image" : isPDF ? "PDF" : "document"
        } and extract all questions. 
        
        IMPORTANT INSTRUCTIONS:
        1. Look for questions with question marks (?) or numbered items (1., 2., etc.)
        2. Identify question type based on format:
           - MCQ: Questions with multiple choice options (A, B, C, D or 1, 2, 3, 4)
           - Short: Questions requiring brief answers (1-2 sentences)
           - Written: Questions requiring detailed essays or long-form answers
        
        For each question, extract:
        1. Question text (clean, without numbering)
        2. Question type (MCQ, Short, or Written)
        3. For MCQ: Extract all options and identify correct answer
        4. For Short/Written: Extract expected answer if provided
        5. Marks (look for "marks", "points", or default to 1)
        6. Difficulty (easy/medium/hard based on complexity)
        7. For Written: word limit (default 50) and time limit (default 30 min)
        
        Return ONLY valid JSON in this exact format:
        {
          "questions": [
            {
              "text": "Clean question text without numbering",
              "type": "MCQ|Short|Written",
              "options": ["Option A", "Option B", "Option C", "Option D"],
              "correctAnswer": "Correct option or expected answer",
              "marks": 1,
              "difficulty": "easy|medium|hard",
              "wordLimit": 50,
              "timeLimit": 30
            }
          ]
        }
        
        Ensure all questions are properly formatted and valid. Return only JSON.
      `;
    } else {
      prompt = `
        Extract all questions from this text content. 
        
        IMPORTANT INSTRUCTIONS:
        1. Look for questions with question marks (?) or numbered items (1., 2., etc.)
        2. Identify question type based on format:
           - MCQ: Questions with multiple choice options (A, B, C, D or 1, 2, 3, 4)
           - Short: Questions requiring brief answers (1-2 sentences)
           - Written: Questions requiring detailed essays or long-form answers
        
        For each question, extract:
        1. Question text (clean, without numbering)
        2. Question type (MCQ, Short, or Written)
        3. For MCQ: Extract all options and identify correct answer
        4. For Short/Written: Extract expected answer if provided
        5. Marks (look for "marks", "points", or default to 1)
        6. Difficulty (easy/medium/hard based on complexity)
        7. For Written: word limit (default 50) and time limit (default 30 min)
        
        Return ONLY valid JSON in this exact format:
        {
          "questions": [
            {
              "text": "Clean question text without numbering",
              "type": "MCQ|Short|Written",
              "options": ["Option A", "Option B", "Option C", "Option D"],
              "correctAnswer": "Correct option or expected answer",
              "marks": 1,
              "difficulty": "easy|medium|hard",
              "wordLimit": 50,
              "timeLimit": 30
            }
          ]
        }
        
        Ensure all questions are properly formatted and valid. Return only JSON.
      `;
    }

    // Check content size and handle large files
    const maxContentSize = 15 * 1024 * 1024; // 15MB limit for Gemini
    if (content.length > maxContentSize) {
      throw new Error(
        `Content too large (${(content.length / 1024 / 1024).toFixed(
          2
        )}MB). Maximum 15MB allowed. Please use a smaller file.`
      );
    }

    // Check if content is too small or empty
    if (content.length < 50) {
      throw new Error(
        "Content too short. The file might be empty or contain no readable text."
      );
    }

    // Additional validation for base64 content
    if (isImage || isPDF) {
      // Validate base64 content
      if (!this.isValidBase64(content)) {
        throw new Error("Invalid file content. The file may be corrupted.");
      }

      // Check if base64 content is reasonable size
      const expectedSize = Math.ceil(content.length * 0.75); // Base64 is ~33% larger than binary
      if (expectedSize > 20 * 1024 * 1024) {
        // 20MB binary limit
        throw new Error(
          "File too large for processing. Please use a smaller file."
        );
      }
    }

    const requestBody = {
      contents: [
        {
          parts: [
            // Only include inline_data for images or PDFs when content is base64
            ...(isImage || (isPDF && !isTextContent)
              ? [
                  {
                    inline_data: {
                      mime_type: fileType,
                      data: content,
                    },
                  },
                ]
              : []),
            {
              text:
                prompt +
                (isImage || (isPDF && !isTextContent)
                  ? ""
                  : `\n\nText to analyze:\n${content}`),
            },
          ],
        },
      ],
      generationConfig: {
        temperature: 0.1,
        topK: 32,
        topP: 1,
        maxOutputTokens: 4096, // Reduced to prevent large responses
      },
    };

    // Log request size for debugging
    const requestSize = JSON.stringify(requestBody).length;
    console.log(`Request size: ${(requestSize / 1024 / 1024).toFixed(2)}MB`);
    console.log(`Content size: ${(content.length / 1024 / 1024).toFixed(2)}MB`);
    console.log(`File type: ${fileType}`);
    console.log(`Is text content: ${isTextContent}`);
    console.log(`Content preview: ${content.substring(0, 100)}...`);

    try {
      // Add timeout to prevent hanging requests
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 second timeout

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("API Error Response:", errorText);
        console.error("Request size:", requestSize);
        console.error("Content size:", content.length);
        console.error("File type:", fileType);

        let errorMessage = `API request failed: ${response.status} ${response.statusText}`;

        try {
          const errorData = JSON.parse(errorText);
          if (errorData.error) {
            const geminiError = errorData.error.message || errorData.error;
            console.error("Gemini API Error:", geminiError);

            // Provide more specific error messages based on Gemini API errors
            if (
              geminiError.includes("SAFETY") ||
              geminiError.includes("safety")
            ) {
              errorMessage =
                "Content blocked by safety filters. Please try with different content.";
            } else if (
              geminiError.includes("INVALID_ARGUMENT") ||
              geminiError.includes("invalid")
            ) {
              errorMessage =
                "Invalid file format or corrupted file. Please try with a different file.";
            } else if (
              geminiError.includes("SIZE") ||
              geminiError.includes("size")
            ) {
              errorMessage = "File too large. Please use a smaller file.";
            } else if (
              geminiError.includes("QUOTA") ||
              geminiError.includes("quota")
            ) {
              errorMessage = "API quota exceeded. Please try again later.";
            } else {
              errorMessage += ` - ${geminiError}`;
            }
          }
        } catch {
          // If we can't parse the error, use the raw text
          errorMessage += ` - ${errorText}`;
        }

        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log("Gemini API Response:", data);

      if (data.candidates && data.candidates[0] && data.candidates[0].content) {
        const responseText = data.candidates[0].content.parts[0].text;
        console.log("Extracted text:", responseText);
        return responseText;
      } else {
        console.error("Invalid response structure:", data);
        throw new Error("Invalid response format from Gemini API");
      }
    } catch (error) {
      console.error("Gemini API Error:", error);
      if (error instanceof Error && error.name === "AbortError") {
        throw new Error(
          "Request timeout - the file may be too large or complex"
        );
      }
      throw new Error(
        `Failed to process with Gemini API: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  private static parseGeminiResponse(response: string): ExtractedQuestion[] {
    try {
      // Clean the response to extract JSON - look for the complete JSON object
      let jsonStr = response.trim();

      // Remove any markdown code blocks
      jsonStr = jsonStr.replace(/```json\s*/g, "").replace(/```\s*/g, "");

      // Find the JSON object boundaries more carefully
      const startIndex = jsonStr.indexOf("{");
      const lastIndex = jsonStr.lastIndexOf("}");

      if (startIndex === -1 || lastIndex === -1 || startIndex >= lastIndex) {
        throw new Error("No valid JSON object found in response");
      }

      jsonStr = jsonStr.substring(startIndex, lastIndex + 1);

      // Parse the JSON
      const parsed = JSON.parse(jsonStr);

      if (!parsed.questions || !Array.isArray(parsed.questions)) {
        throw new Error("Invalid response format: questions array not found");
      }

      // Validate and map questions with proper error handling
      const questions: ExtractedQuestion[] = [];

      for (let i = 0; i < parsed.questions.length; i++) {
        const q = parsed.questions[i];

        // Validate required fields
        if (!q.text || typeof q.text !== "string") {
          console.warn(`Question ${i + 1}: Missing or invalid text, skipping`);
          continue;
        }

        if (!q.type || !["MCQ", "Short", "Written"].includes(q.type)) {
          console.warn(
            `Question ${i + 1}: Invalid type '${q.type}', defaulting to MCQ`
          );
          q.type = "MCQ";
        }

        if (
          !q.difficulty ||
          !["easy", "medium", "hard"].includes(q.difficulty)
        ) {
          console.warn(
            `Question ${i + 1}: Invalid difficulty '${
              q.difficulty
            }', defaulting to medium`
          );
          q.difficulty = "medium";
        }

        // Validate marks
        const marks = parseInt(q.marks) || 1;
        if (marks < 1) {
          console.warn(
            `Question ${i + 1}: Invalid marks ${q.marks}, defaulting to 1`
          );
          q.marks = 1;
        }

        // Validate options for MCQ
        let options: string[] = [];
        if (q.type === "MCQ") {
          if (Array.isArray(q.options) && q.options.length >= 2) {
            options = q.options.filter(
              (opt: unknown) => typeof opt === "string" && opt.trim().length > 0
            );
          }
          if (options.length < 2) {
            console.warn(
              `Question ${i + 1}: MCQ needs at least 2 valid options, skipping`
            );
            continue;
          }
        }

        // Ensure correctAnswer is valid for MCQ questions
        let correctAnswer = q.correctAnswer || "";
        if (q.type === "MCQ" && options.length > 0) {
          if (!correctAnswer || !options.includes(correctAnswer)) {
            // If correctAnswer is not provided or not in options, use the first option
            correctAnswer = options[0];
          }
        }

        questions.push({
          text: q.text.trim(),
          type: q.type,
          options: options,
          correctAnswer: correctAnswer,
          marks: marks,
          difficulty: q.difficulty,
          wordLimit:
            parseInt(q.wordLimit) || (q.type === "Written" ? 50 : undefined),
          timeLimit:
            parseInt(q.timeLimit) || (q.type === "Written" ? 30 : undefined),
        });
      }

      if (questions.length === 0) {
        throw new Error("No questions found in the document");
      }

      return questions;
    } catch (error) {
      console.error("Error parsing Gemini response:", error);
      console.error("Response content:", response);
      throw new Error(
        `Failed to parse response: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  static async processFile(file: File): Promise<ImportResult> {
    const result: ImportResult = {
      success: false,
      questions: [],
      errors: [],
      totalProcessed: 0,
    };

    try {
      console.log(
        `Processing file: ${file.name} (${file.type}, ${(
          file.size /
          1024 /
          1024
        ).toFixed(2)}MB)`
      );

      // Validate file type
      const allowedTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/gif",
        "image/webp",
        "application/pdf",
        "text/plain",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "application/vnd.ms-word",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ];

      if (!allowedTypes.includes(file.type)) {
        result.errors.push(`Unsupported file type: ${file.type}`);
        return result;
      }

      // Check for extremely large files that might cause memory issues (50MB limit)
      const maxSize = 50 * 1024 * 1024; // 50MB
      if (file.size > maxSize) {
        result.errors.push(
          `File size too large (${(file.size / 1024 / 1024).toFixed(
            2
          )}MB). Maximum 50MB allowed to prevent memory issues.`
        );
        return result;
      }

      // Additional check for very large files that might cause memory issues
      if (file.size > 500 * 1024) {
        // 500KB
        console.warn(
          `Large file detected: ${file.name} (${(
            file.size /
            1024 /
            1024
          ).toFixed(2)}MB). Processing may take longer.`
        );
      }

      // Extract content from file
      console.log("Extracting content from file...");
      let content: string;
      let processingType = file.type; // Track the processing type

      if (file.type === "application/pdf") {
        // For PDFs, validate first then try multiple extraction methods
        console.log("Processing PDF file...");

        // Validate PDF file first
        const validation = await this.validatePDFFile(file);
        if (!validation.isValid) {
          result.errors.push(`PDF validation failed: ${validation.error}`);
          return result;
        }

        // Method 1: Try pdfjs-dist text extraction (most reliable for text-based PDFs)
        try {
          console.log("Attempting PDF text extraction with pdfjs-dist...");
          content = await this.extractTextFromPDFAsText(file);
          console.log(
            `PDF text extracted successfully, length: ${content.length} characters`
          );

          // If text extraction worked, use it for API call
          if (content && content.length > 50) {
            // Use text content for API call instead of base64
            console.log("Using extracted text for API call");
            // Mark this as text content for the API call
            processingType = "text/plain"; // Change processing type to text for API processing
          } else {
            throw new Error("Extracted text too short, trying base64 method");
          }
        } catch (pdfjsError) {
          console.warn("PDF text extraction failed:", pdfjsError);

          // Method 2: Try base64 method for image-based PDFs
          try {
            console.log("Attempting PDF base64 extraction...");
            content = await this.extractTextFromFile(file);
            console.log(
              `PDF base64 extracted, length: ${content.length} characters`
            );
          } catch (base64Error) {
            console.warn("PDF base64 extraction failed:", base64Error);

            // Method 3: Try direct text extraction (fallback)
            try {
              console.log("Attempting PDF direct text extraction...");
              content = await this.extractTextFromPDFDirect(file);
              console.log(
                `PDF direct text extracted, length: ${content.length} characters`
              );
            } catch (directError) {
              console.error("All PDF extraction methods failed:", directError);

              // Provide specific error messages based on the failure
              let errorMessage = "Failed to extract content from PDF. ";
              if (pdfjsError instanceof Error) {
                if (pdfjsError.message.includes("password protected")) {
                  errorMessage +=
                    "The PDF is password protected. Please provide an unprotected PDF.";
                } else if (pdfjsError.message.includes("Invalid PDF")) {
                  errorMessage +=
                    "The PDF file appears to be corrupted or invalid.";
                } else if (pdfjsError.message.includes("image-based")) {
                  errorMessage +=
                    "The PDF contains only images. Please use an OCR tool to convert images to text first.";
                } else {
                  errorMessage +=
                    "Please try with a different PDF file or convert to text format.";
                }
              } else {
                errorMessage +=
                  "Please try with a different PDF file or convert to text format.";
              }

              result.errors.push(errorMessage);
              return result;
            }
          }
        }
      } else {
        // For other files, use the original method
        content = await Promise.race([
          this.extractTextFromFile(file),
          new Promise<string>((_, reject) =>
            setTimeout(
              () => reject(new Error("File processing timeout")),
              30000
            )
          ),
        ]);
        console.log(`Content extracted, length: ${content.length} characters`);
      }

      if (!content) {
        result.errors.push("No content extracted from file");
        return result;
      }

      // Process content (with chunking for large files)
      console.log("Processing content...");
      let geminiResponse: string;

      try {
        // Determine if content is text or base64
        const isTextContent = processingType === "text/plain";
        geminiResponse = await this.processLargeContent(
          content,
          processingType,
          isTextContent
        );
      } catch (apiError) {
        console.error("Content processing failed:", apiError);
        throw apiError;
      }

      console.log("Gemini API response received, parsing...");
      // Parse response
      try {
        const questions = this.parseGeminiResponse(geminiResponse);
        result.questions = questions;
        result.totalProcessed = questions.length;
        result.success = true;
        console.log(
          `Successfully processed ${questions.length} questions from ${file.name}`
        );
      } catch (parseError) {
        if (
          parseError instanceof Error &&
          parseError.message.includes("No questions found")
        ) {
          result.success = true; // Mark as successful even if no questions found
          result.questions = [];
          result.totalProcessed = 0;
          result.errors.push(`No questions found in ${file.name}`);
        } else {
          throw parseError; // Re-throw other parsing errors
        }
      }
    } catch (error) {
      console.error(`Error processing file ${file.name}:`, error);

      if (error instanceof Error) {
        if (error.message.includes("Maximum call stack size exceeded")) {
          result.errors.push(
            `File ${file.name} is too complex or large. Please try with a smaller file or split the content.`
          );
        } else if (error.message.includes("timeout")) {
          result.errors.push(
            `File ${file.name} processing timed out. Please try with a smaller file.`
          );
        } else if (error.message.includes("400")) {
          result.errors.push(
            `File ${file.name} could not be processed. Please check if the file is corrupted or try a different file.`
          );
        } else {
          result.errors.push(`Error processing ${file.name}: ${error.message}`);
        }
      } else {
        result.errors.push(
          `Unknown error occurred while processing ${file.name}`
        );
      }
    }

    return result;
  }

  static async processMultipleFiles(files: File[]): Promise<ImportResult> {
    const result: ImportResult = {
      success: false,
      questions: [],
      errors: [],
      totalProcessed: 0,
    };

    // Limit the number of files to prevent overwhelming the API
    if (files.length > 10) {
      result.errors.push(
        "Too many files selected. Please select maximum 10 files at once."
      );
      return result;
    }

    const allQuestions: ExtractedQuestion[] = [];
    const allErrors: string[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      try {
        console.log(`Processing file ${i + 1}/${files.length}: ${file.name}`);
        const fileResult = await this.processFile(file);
        allQuestions.push(...fileResult.questions);
        allErrors.push(...fileResult.errors);

        // Add delay between files to prevent rate limiting
        if (i < files.length - 1) {
          await new Promise((resolve) => setTimeout(resolve, 2000));
        }
      } catch (error) {
        console.error(`Error processing file ${file.name}:`, error);
        allErrors.push(
          `Error processing ${file.name}: ${
            error instanceof Error ? error.message : "Unknown error"
          }`
        );
      }
    }

    result.questions = allQuestions;
    result.errors = allErrors;
    result.totalProcessed = allQuestions.length;
    result.success = allQuestions.length > 0;

    return result;
  }
}
