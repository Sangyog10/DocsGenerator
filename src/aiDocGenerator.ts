import axios from 'axios';
import { DocumentationOptions, DocumentationData } from './types';


export class AIDocumentationGenerator {
    private apiKey: string;
    private provider: string;
    private ollamaHost: string;
    private ollamaModel: string;

    constructor(provider: string, apiKey: string, ollamaHost: string = 'http://localhost:11434', ollamaModel: string = 'llama2') {
        this.provider = provider;
        this.apiKey = process.env[apiKey] || apiKey;
        if (!this.apiKey) {
            throw new Error('API key is required for AI provider');
        }
        this.ollamaHost = ollamaHost;
        this.ollamaModel = ollamaModel;
    }

    async generateDocumentation(
        code: string, 
        language: string, 
        options: DocumentationOptions
    ): Promise<DocumentationData> {
        const prompt = this.buildPrompt(code, language, options);
        
        try {
            const response = await this.callAI(prompt);
            return this.parseAIResponse(response);
        } catch (error) {
            throw new Error(`Failed to generate documentation: ${error}`);
        }
    }

    private buildPrompt(code: string, language: string, options: DocumentationOptions): string {
        return `
You are a professional API documentation generator. Analyze the following ${language} code and generate comprehensive API documentation.

Code to analyze:
\`\`\`${language}
${code}
\`\`\`

Please provide a JSON response with the following structure:
{
  "overview": "Brief overview of the code's purpose and functionality",
  "functions": [
    {
      "name": "function name",
      "description": "detailed description",
      "parameters": [
        {
          "name": "param name",
          "type": "param type",
          "description": "param description",
          "optional": boolean,
          "defaultValue": "default value if any"
        }
      ],
      "returnType": "return type",
      "returnDescription": "description of return value",
      "examples": ["code example 1", "code example 2"],
      "complexity": "time/space complexity if applicable"
    }
  ],
  "classes": [
    {
      "name": "class name",
      "description": "class description",
      "constructor": {
        "parameters": [...],
        "description": "constructor description",
        "examples": ["example usage"]
      },
      "methods": [...functions format...],
      "properties": [
        {
          "name": "property name",
          "type": "property type",
          "description": "property description",
          "access": "public|private|protected",
          "readonly": boolean
        }
      ],
      "inheritance": ["parent classes/interfaces"]
    }
  ],
  "interfaces": [
    {
      "name": "interface name",
      "description": "interface description",
      "properties": [...properties format...],
      "methods": [...functions format...]
    }
  ],
  "constants": [
    {
      "name": "constant name",
      "type": "constant type",
      "value": "constant value",
      "description": "constant description"
    }
  ],
  "types": [
    {
      "name": "type name",
      "definition": "type definition",
      "description": "type description",
      "examples": ["usage examples"]
    }
  ]
}

Requirements:
- Be thorough and professional
- Include clear descriptions for all elements
- ${options.includeExamples ? 'Include practical code examples' : 'Skip code examples'}
- Focus on public APIs and interfaces
- Use proper technical terminology
- Explain complex concepts clearly

Respond only with valid JSON.
        `;
    }

    private async callAI(prompt: string): Promise<string> {
        switch (this.provider) {
            case 'openai':
                return await this.callOpenAI(prompt);
            case 'ollama':
                return await this.callOllama(prompt);
            default:
                throw new Error(`Unsupported AI provider: ${this.provider}`);
        }
    }

    private async callOpenAI(prompt: string): Promise<string> {
        const response = await axios.post(
            'https://api.openai.com/v1/chat/completions',
            {
                model: 'gpt-4',
                messages: [
                    { role: 'system', content: 'You are a professional API documentation generator.' },
                    { role: 'user', content: prompt }
                ],
                max_tokens: 4000,
                temperature: 0.1
            },
            {
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        return response.data.choices[0].message.content;
    }

    private async callOllama(prompt: string): Promise<string> {
        const response = await axios.post(
            `${this.ollamaHost}/api/generate`,
            {
                model: this.ollamaModel,
                prompt: prompt,
                stream: false,
                options: {
                    temperature: 0.1,
                    top_p: 0.9,
                    max_tokens: 4000
                }
            },
            {
                headers: {
                    'Content-Type': 'application/json'
                },
                timeout: 120000 // 2 minutes timeout for large responses
            }
        );

        return response.data.response;
    }

    private parseAIResponse(response: string): DocumentationData {
        try {
            const jsonMatch = response.match(/\{[\s\S]*\}/);
            if (!jsonMatch) {
                throw new Error('No valid JSON found in AI response');
            }

            return JSON.parse(jsonMatch[0]);
        } catch (error) {
            throw new Error(`Failed to parse AI response: ${error}`);
        }
    }
}