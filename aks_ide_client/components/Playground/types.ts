export type FileStructure = {
  [key: string]: FileStructure | { [absolutePath: string]: string } | string;
};

export type SaveStatus = "idle" | "saving" | "saved" | "error";

export type OpenFile = { name: string; absolutePath: string };

export const LANG_MAP: Record<string, string> = {
  js: "javascript", jsx: "javascript",
  ts: "typescript", tsx: "typescript",
  py: "python", java: "java", rs: "rust", go: "go",
  cpp: "cpp", c: "c", html: "html", css: "css",
  json: "json", md: "markdown", yaml: "yaml", yml: "yaml",
  sh: "shell", rb: "ruby",
};

export function getLanguage(fileName: string): string {
  const ext = fileName.split(".").pop()?.toLowerCase() ?? "";
  return LANG_MAP[ext] ?? "plaintext";
}
