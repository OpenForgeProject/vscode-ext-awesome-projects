import * as vscode from 'vscode';
import { ProjectsWebviewProvider } from './webviewProvider';

export interface Project {
    title: string;
    description: string;
    url: string;
}

/**
 * Activates the extension.
 * @param {vscode.ExtensionContext} context - The extension context.
 */
export function activate(context: vscode.ExtensionContext) {
    const projectsProvider = new ProjectsWebviewProvider(context.extensionUri, context);

    context.subscriptions.push(
        vscode.window.registerWebviewViewProvider(
            ProjectsWebviewProvider.viewType,
            projectsProvider
        ),
        vscode.commands.registerCommand('awesome-projects.refreshProjects', () => {
            projectsProvider.refresh();
        }),
        projectsProvider
    );
}

/**
 * Deactivates the extension.
 */
export function deactivate() {}
