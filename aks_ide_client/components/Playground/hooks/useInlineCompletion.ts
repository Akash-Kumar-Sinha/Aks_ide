"use client";

import { useEffect, useRef } from "react";
import { useMonaco } from "@monaco-editor/react";
import type * as Monaco from "monaco-editor";
import socket from "@/utils/Socket";

interface Options {
  email: string | undefined;
  language: string;
  filename: string;
}

interface CompletionResult {
  request_id: string;
  text: string;
}

export function useInlineCompletion({ email, language, filename }: Options) {
  const monaco = useMonaco();
  const disposableRef = useRef<Monaco.IDisposable | null>(null);

  useEffect(() => {
    disposableRef.current?.dispose();
    disposableRef.current = null;

    if (!monaco) return;
    if (!email) return;
    if (!language || language === "plaintext") return;

    disposableRef.current = monaco.languages.registerInlineCompletionsProvider(
      language,
      {
        provideInlineCompletions: async (model, position, context, token) => {
          if (token.isCancellationRequested) return { items: [] };

          const fullRange = model.getFullModelRange();
          const prefix = model.getValueInRange({
            startLineNumber: 1,
            startColumn: 1,
            endLineNumber: position.lineNumber,
            endColumn: position.column,
          });
          const suffix = model.getValueInRange({
            startLineNumber: position.lineNumber,
            startColumn: position.column,
            endLineNumber: fullRange.endLineNumber,
            endColumn: model.getLineMaxColumn(fullRange.endLineNumber),
          });

          if (!prefix.trimEnd()) return { items: [] };

          const requestId = crypto.randomUUID();

          const text = await new Promise<string>((resolve) => {
            const TIMEOUT_MS = 5000;

            const timer = setTimeout(() => {
              console.warn("[completion] TIMEOUT — no response within 5s for", requestId);
              socket.off("completion_result", onResult);
              resolve("");
            }, TIMEOUT_MS);

            const onResult = (data: CompletionResult) => {
              if (data.request_id !== requestId) return;
              clearTimeout(timer);
              socket.off("completion_result", onResult);
              resolve(data.text ?? "");
            };

            socket.on("completion_result", onResult);

            socket.emit("code_completion", {
              email,
              request_id: requestId,
              prefix,
              suffix,
              language,
              filename,
            });
          });

          if (!text) return { items: [] };
          if (token.isCancellationRequested) return { items: [] };

          return {
            items: [
              {
                insertText: text,
                range: {
                  startLineNumber: position.lineNumber,
                  startColumn: position.column,
                  endLineNumber: position.lineNumber,
                  endColumn: position.column,
                },
              },
            ],
          };
        },
        freeInlineCompletions: () => {},
      }
    );

    return () => {
      disposableRef.current?.dispose();
      disposableRef.current = null;
    };
  }, [monaco, email, language, filename]);
}
