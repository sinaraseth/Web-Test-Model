export type PromptType = 'Parse the figure.' | 'Convert the document to markdown.' | 'Describe the image to detail.' | 'OCR the images.';

export interface BasePrompt {
    type: PromptType;
    content: string;
}

export interface ImageParsePrompt extends BasePrompt {
    type: 'Parse the figure.';
    imageUrl?: string;
    imageBase64?: string;
}

export interface TextOnlyPrompt extends BasePrompt {
    type: 'Convert the document to markdown.';
}

export interface CodeAnalysisPrompt extends BasePrompt {
    type: 'Describe the image to detail.';
    language?: string;
    codeSnippet: string;
}

export interface GeneralPrompt extends BasePrompt {
    type: 'OCR the images.';
}

export type Prompt = ImageParsePrompt | TextOnlyPrompt | CodeAnalysisPrompt | GeneralPrompt;
