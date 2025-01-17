import * as vscode from 'vscode';
import { ProjectsWebviewProvider } from './webviewProvider';

/**
 * Registers the commands for the extension.
 * @param {vscode.ExtensionContext} context - The extension context.
 * @param {ProjectsWebviewProvider} projectsProvider - The projects webview provider.
 */
export function registerCommands(context: vscode.ExtensionContext, projectsProvider: ProjectsWebviewProvider) {
    context.subscriptions.push(
        vscode.commands.registerCommand('awesome-projects.refreshProjects', () => {
            projectsProvider.refresh();
        })
    );
}
