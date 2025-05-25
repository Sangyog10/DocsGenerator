import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { AIDocumentationGenerator } from './aiDocGenerator';
import { DocumentationRenderer } from './documentationRenderer';

export function activate(context: vscode.ExtensionContext) {
    console.log('API Documentation Generator is now active');

    const disposable = vscode.commands.registerCommand('apiDocGenerator.generateDocs', async (uri: vscode.Uri) => {
        try {
            await generateDocumentation(uri);
        } catch (error) {
            vscode.window.showErrorMessage(`Error generating documentation: ${error}`);
        }
    });

    context.subscriptions.push(disposable);
}

async function generateDocumentation(uri: vscode.Uri) {
    const config = vscode.workspace.getConfiguration('apiDocGenerator');
    const aiProvider = config.get<string>('aiProvider', 'openai');
    const apiKey = config.get<string>('apiKey', '');
    const outputFormat = config.get<string>('outputFormat', 'markdown');
    const includeExamples = config.get<boolean>('includeExamples', true);

    // Validate API key
    if (!apiKey) {
        const result = await vscode.window.showErrorMessage(
            'API key not configured. Please set your AI provider API key in settings.',
            'Open Settings'
        );
        if (result === 'Open Settings') {
            vscode.commands.executeCommand('workbench.action.openSettings', 'apiDocGenerator.apiKey');
        }
        return;
    }

    // Show progress
    await vscode.window.withProgress({
        location: vscode.ProgressLocation.Notification,
        title: "Generating API Documentation",
        cancellable: true
    }, async (progress, token) => {
        progress.report({ increment: 0, message: "Analyzing files..." });

        // Get files to process
        const files = await getFilesToProcess(uri);
        if (files.length === 0) {
            vscode.window.showWarningMessage('No supported files found for documentation generation.');
            return;
        }

        progress.report({ increment: 20, message: `Processing ${files.length} files...` });

        // Initialize AI generator
        const aiGenerator = new AIDocumentationGenerator(aiProvider, apiKey);
        const renderer = new DocumentationRenderer();

        // Process files
        const documentationData = [];
        for (let i = 0; i < files.length; i++) {
            if (token.isCancellationRequested) {
                return;
            }

            const file = files[i];
            progress.report({ 
                increment: (60 / files.length), 
                message: `Analyzing ${path.basename(file)}...` 
            });

            const fileContent = fs.readFileSync(file, 'utf8');
            const fileExtension = path.extname(file);
            const language = getLanguageFromExtension(fileExtension);

            const docData = await aiGenerator.generateDocumentation(fileContent, language, {
                includeExamples,
                filePath: file
            });

            documentationData.push({
                ...docData,
                fileName: path.basename(file),
                filePath: file
            });
        }

        progress.report({ increment: 80, message: "Generating final documentation..." });

        // Generate final documentation
        const finalDoc = renderer.renderDocumentation(documentationData, outputFormat);

        // Save documentation
        const workspaceFolder = vscode.workspace.getWorkspaceFolder(uri);
        const outputPath = path.join(
            workspaceFolder?.uri.fsPath || path.dirname(uri.fsPath),
            'docs',
            `api-documentation.${outputFormat === 'html' ? 'html' : 'md'}`
        );

        // Ensure docs directory exists
        const docsDir = path.dirname(outputPath);
        if (!fs.existsSync(docsDir)) {
            fs.mkdirSync(docsDir, { recursive: true });
        }

        fs.writeFileSync(outputPath, finalDoc);

        progress.report({ increment: 100, message: "Documentation generated successfully!" });

        // Show success message and open file
        const result = await vscode.window.showInformationMessage(
            `API documentation generated successfully at ${outputPath}`,
            'Open Documentation',
            'Open Folder'
        );

        if (result === 'Open Documentation') {
            const doc = await vscode.workspace.openTextDocument(outputPath);
            await vscode.window.showTextDocument(doc);
        } else if (result === 'Open Folder') {
            vscode.commands.executeCommand('revealFileInOS', vscode.Uri.file(outputPath));
        }
    });
}

async function getFilesToProcess(uri: vscode.Uri): Promise<string[]> {
    const stat = fs.statSync(uri.fsPath);
    const supportedExtensions = ['.js', '.ts', '.py', '.java', '.cs', '.cpp', '.c', '.go', '.php', '.rb'];

    if (stat.isFile()) {
        const ext = path.extname(uri.fsPath);
        return supportedExtensions.includes(ext) ? [uri.fsPath] : [];
    }

    // If it's a directory, recursively find supported files
    const files: string[] = [];
    
    function walkDir(dir: string) {
        const items = fs.readdirSync(dir);
        for (const item of items) {
            const fullPath = path.join(dir, item);
            const stat = fs.statSync(fullPath);
            
            if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
                walkDir(fullPath);
            } else if (stat.isFile()) {
                const ext = path.extname(fullPath);
                if (supportedExtensions.includes(ext)) {
                    files.push(fullPath);
                }
            }
        }
    }

    walkDir(uri.fsPath);
    return files;
}

function getLanguageFromExtension(ext: string): string {
    const langMap: { [key: string]: string } = {
        '.js': 'javascript',
        '.ts': 'typescript',
        '.py': 'python',
        '.java': 'java',
        '.cs': 'csharp',
        '.cpp': 'cpp',
        '.c': 'c',
        '.go': 'go',
        '.php': 'php',
        '.rb': 'ruby'
    };
    return langMap[ext] || 'text';
}

export function deactivate() {}