import { DocumentationData } from './types'

export class DocumentationRenderer {
    renderDocumentation(docs: DocumentationData[], format: string): string {
        switch (format) {
            case 'markdown':
                return this.renderMarkdown(docs);
            case 'html':
                return this.renderHTML(docs);
            case 'json':
                return this.renderJSON(docs);
            default:
                return this.renderMarkdown(docs);
        }
    }

    private renderMarkdown(docs: DocumentationData[]): string {
        let output = '# API Documentation\n\n';
        output += `Generated on: ${new Date().toISOString()}\n\n`;

        for (const doc of docs) {
            output += `## File: ${doc.fileName}\n\n`;
            
            if (doc.overview) {
                output += `### Overview\n${doc.overview}\n\n`;
            }

            // Functions
            if (doc.functions?.length > 0) {
                output += '### Functions\n\n';
                for (const func of doc.functions) {
                    output += `#### ${func.name}\n\n`;
                    output += `${func.description}\n\n`;
                    
                    if (func.parameters?.length > 0) {
                        output += '**Parameters:**\n\n';
                        for (const param of func.parameters) {
                            const optional = param.optional ? ' (optional)' : '';
                            const defaultVal = param.defaultValue ? ` = ${param.defaultValue}` : '';
                            output += `- \`${param.name}\` (${param.type}${optional}${defaultVal}): ${param.description}\n`;
                        }
                        output += '\n';
                    }

                    output += `**Returns:** \`${func.returnType}\`\n`;
                    if (func.returnDescription) {
                        output += `${func.returnDescription}\n`;
                    }
                    output += '\n';

                    if (func.examples?.length > 0) {
                        output += '**Examples:**\n\n';
                        for (const example of func.examples) {
                            output += `\`\`\`javascript\n${example}\n\`\`\`\n\n`;
                        }
                    }

                    if (func.complexity) {
                        output += `**Complexity:** ${func.complexity}\n\n`;
                    }

                    output += '---\n\n';
                }
            }

            // Classes
            if (doc.classes?.length > 0) {
                output += '### Classes\n\n';
                for (const cls of doc.classes) {
                    output += `#### ${cls.name}\n\n`;
                    output += `${cls.description}\n\n`;

                    if (cls.inheritance?.length > 0) {
                        output += `**Extends:** ${cls.inheritance.join(', ')}\n\n`;
                    }

                    if (cls.constructor) {
                        output += '**Constructor:**\n\n';
                        output += `${cls.constructor.description}\n\n`;
                        
                        if (cls.constructor.parameters?.length > 0) {
                            output += 'Parameters:\n';
                            for (const param of cls.constructor.parameters) {
                                output += `- \`${param.name}\` (${param.type}): ${param.description}\n`;
                            }
                            output += '\n';
                        }
                    }

                    if (cls.properties?.length > 0) {
                        output += '**Properties:**\n\n';
                        for (const prop of cls.properties) {
                            const access = prop.access !== 'public' ? `${prop.access} ` : '';
                            const readonly = prop.readonly ? 'readonly ' : '';
                            output += `- ${access}${readonly}\`${prop.name}\` (${prop.type}): ${prop.description}\n`;
                        }
                        output += '\n';
                    }

                    if (cls.methods?.length > 0) {
                        output += '**Methods:**\n\n';
                        for (const method of cls.methods) {
                            output += `##### ${method.name}\n\n`;
                            output += `${method.description}\n\n`;
                            // Add parameter and return info similar to functions
                        }
                    }

                    output += '---\n\n';
                }
            }

            // Interfaces, Constants, Types would follow similar patterns...
        }

        return output;
    }

    private renderHTML(docs: DocumentationData[]): string {
        let html = `
<!DOCTYPE html>
<html>
<head>
    <title>API Documentation</title>
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 40px; }
        h1, h2, h3 { color: #2c3e50; }
        .function, .class { border: 1px solid #ddd; padding: 20px; margin: 20px 0; border-radius: 5px; }
        .parameters { background: #f8f9fa; padding: 15px; border-radius: 3px; }
        code { background: #f1f2f6; padding: 2px 4px; border-radius: 3px; }
        pre { background: #2f3542; color: #f1f2f6; padding: 15px; border-radius: 5px; overflow-x: auto; }
    </style>
</head>
<body>
    <h1>API Documentation</h1>
    <p><em>Generated on: ${new Date().toISOString()}</em></p>
        `;

        // Convert markdown-like content to HTML
        // This would need more detailed implementation for full HTML rendering

        html += '</body></html>';
        return html;
    }

    private renderJSON(docs: DocumentationData[]): string {
        return JSON.stringify(docs, null, 2);
    }
}