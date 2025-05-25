"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AIDocumentationGenerator = void 0;
const axios_1 = require("axios");
class AIDocumentationGenerator {
    constructor(provider, apiKey, ollamaHost = 'http://localhost:11434', ollamaModel = 'llama2') {
        this.provider = provider;
        this.apiKey = apiKey;
        this.ollamaHost = ollamaHost;
        this.ollamaModel = ollamaModel;
    }
    async generateDocumentation(code, language, options) {
        const prompt = this.buildPrompt(code, language, options);
        try {
            const response = await this.callAI(prompt);
            return this.parseAIResponse(response);
        }
        catch (error) {
            throw new Error(`Failed to generate documentation: ${error}`);
        }
    }
    buildPrompt(code, language, options) {
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
    async callAI(prompt) {
        switch (this.provider) {
            case 'openai':
                return await this.callOpenAI(prompt);
            case 'ollama':
                return await this.callOllama(prompt);
            default:
                throw new Error(`Unsupported AI provider: ${this.provider}`);
        }
    }
    async callOpenAI(prompt) {
        const response = await axios_1.default.post('https://api.openai.com/v1/chat/completions', {
            model: 'gpt-4',
            messages: [
                { role: 'system', content: 'You are a professional API documentation generator.' },
                { role: 'user', content: prompt }
            ],
            max_tokens: 4000,
            temperature: 0.1
        }, {
            headers: {
                'Authorization': `Bearer ${this.apiKey}`,
                'Content-Type': 'application/json'
            }
        });
        return response.data.choices[0].message.content;
    }
    async callOllama(prompt) {
        const response = await axios_1.default.post(`${this.ollamaHost}/api/generate`, {
            model: this.ollamaModel,
            prompt: prompt,
            stream: false,
            options: {
                temperature: 0.1,
                top_p: 0.9,
                max_tokens: 4000
            }
        }, {
            headers: {
                'Content-Type': 'application/json'
            },
            timeout: 120000 // 2 minutes timeout for large responses
        });
        return response.data.response;
    }
    parseAIResponse(response) {
        try {
            // Clean response to extract JSON
            const jsonMatch = response.match(/\{[\s\S]*\}/);
            if (!jsonMatch) {
                throw new Error('No valid JSON found in AI response');
            }
            return JSON.parse(jsonMatch[0]);
        }
        catch (error) {
            throw new Error(`Failed to parse AI response: ${error}`);
        }
    }
}
exports.AIDocumentationGenerator = AIDocumentationGenerator;
//# sourceMappingURL=aiDocGenerator.js.map