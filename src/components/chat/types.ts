import { PromptType } from "../../services/prompt.services";

export type ModelOption =
  | "DeepSeek OCR"
  | "Gemma3"
  | "Hybrid (DeepSeek OCR + Gemma3)"
  | "Hybrid (Paddle OCR + Qwen3VL)"
  | "Granite Docling";

export const MODEL_OPTIONS: ModelOption[] = [
  "DeepSeek OCR",
  "Gemma3",
  "Hybrid (DeepSeek OCR + Gemma3)",
  "Hybrid (Paddle OCR + Qwen3VL)",
  "Granite Docling",
];

export const PROMPT_OPTIONS: PromptType[] = [
  "Parse the figure.",
  "Convert the document to markdown.",
  "Describe the image to detail.",
  "OCR the images.",
];
