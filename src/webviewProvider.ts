import * as vscode from 'vscode';
import { Project } from './extension';
import { loadResourceFile } from './utils/resourceLoader';
import { generateGradient, getContrastColor } from './utils/colorUtils';
import * as React from 'react';
import * as ReactDOMServer from 'react-dom/server';
import Header from './template/header';

export class ProjectsWebviewProvider implements vscode.WebviewViewProvider {
    public static readonly viewType = 'awesomeProjectsView';
    private _view?: vscode.WebviewView;
    private _disposables: vscode.Disposable[] = [];

    constructor(
        private readonly _extensionUri: vscode.Uri,
        private readonly _context: vscode.ExtensionContext
    ) {
        this._disposables.push(
            vscode.workspace.onDidChangeConfiguration(e => {
                if (e.affectsConfiguration('awesomeProjects.projects')) {
                    this.refresh();
                }
            })
        );
    }

    public getView(): vscode.WebviewView | undefined {
        return this._view;
    }

    public async resolveWebviewView(
        webviewView: vscode.WebviewView,
        _context: vscode.WebviewViewResolveContext,
        token: vscode.CancellationToken,
    ) {
        this._view = webviewView;
        webviewView.webview.options = {
            enableScripts: true,
            localResourceRoots: [this._extensionUri]
        };

        webviewView.webview.html = await this._getHtmlForWebview(webviewView.webview);

        webviewView.webview.onDidReceiveMessage(message => {
            switch (message.command) {
                case 'addProject':
                    vscode.window.showOpenDialog({
                        canSelectFolders: true,
                        canSelectMany: false
                    }).then(async folderUri => {
                        if (folderUri && folderUri[0]) {
                            try {
                                const projectPath = folderUri[0].fsPath;
                                const configuration = vscode.workspace.getConfiguration('awesomeProjects');
                                const projects: Project[] = configuration.get('projects') || [];

                                const newProject: Project = {
                                    path: projectPath,
                                    name: await vscode.window.showInputBox({
                                        prompt: 'Enter project name',
                                        value: projectPath.split('/').pop()
                                    }) || projectPath.split('/').pop() || ''
                                };

                                await configuration.update(
                                    'projects',
                                    [...projects, newProject],
                                    vscode.ConfigurationTarget.Global
                                );

                                const updatedProjects = configuration.get<Project[]>('projects');
                                if (updatedProjects?.some(p => p.path === newProject.path)) {
                                    this.refresh();
                                } else {
                                    throw new Error('Failed to save project to settings');
                                }
                            } catch (error) {
                                vscode.window.showErrorMessage(`Failed to add project: ${error}`);
                            }
                        }
                    });
                    break;
                case 'openProject':
                    vscode.commands.executeCommand('vscode.openFolder', vscode.Uri.file(message.project));
                    break;
                case 'projectSelected':
                    vscode.window.showInformationMessage(`Project selected: ${message.path}`);
                    break;
                case 'updateProject':
                    this._updateProject(message.projectPath, message.updates);
                    break;
                case 'openUrl':
                    vscode.env.openExternal(vscode.Uri.parse(message.url));
                    break;
                case 'openInFinder':
                    vscode.commands.executeCommand('revealFileInOS', vscode.Uri.file(message.path));
                    break;
                case 'deleteProject':
                    vscode.window.showWarningMessage('Do you really want to delete this project?', 'Yes', 'No')
                        .then(selection => {
                            if (selection === 'Yes') {
                                this._deleteProject(message.projectPath);
                            }
                        });
                    break;
                case 'reorderProjects':
                    this._reorderProjects(message.oldIndex, message.newIndex);
                    break;
                case 'showInFileManager':
                    vscode.commands.executeCommand('awesome-projects.showInFileManager', message.project);
                    break;
            }
        });
    }

    private async _updateProject(projectPath: string, updates: Partial<Project>) {
        try {
            if (updates.color) {
                const isValidHex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
                if (!isValidHex.test(updates.color)) {
                    throw new Error('Invalid color format');
                }
            }

            const urlFields: (keyof Pick<Project, 'productionUrl' | 'devUrl' | 'stagingUrl' | 'managementUrl'>)[] = [
                'productionUrl',
                'devUrl',
                'stagingUrl',
                'managementUrl'
            ];

            urlFields.forEach(field => {
                const value = updates[field];
                if (typeof value === 'string' && value && !/^https?:\/\//i.test(value)) {
                    updates[field] = `https://${value}`;
                }
            });

            const configuration = vscode.workspace.getConfiguration('awesomeProjects');
            const projects = [...(configuration.get<Project[]>('projects') || [])];
            const projectIndex = projects.findIndex(p => p.path === projectPath);

            if (projectIndex !== -1) {
                projects[projectIndex] = { ...projects[projectIndex], ...updates };
                await configuration.update('projects', projects, vscode.ConfigurationTarget.Global);
                this.refresh();
            }
        } catch (error) {
            vscode.window.showErrorMessage(`Failed to update project: ${error}`);
        }
    }

    private async _deleteProject(projectPath: string) {
        try {
            const configuration = vscode.workspace.getConfiguration('awesomeProjects');
            const projects = [...(configuration.get<Project[]>('projects') || [])];
            const projectIndex = projects.findIndex(p => p.path === projectPath);

            if (projectIndex !== -1) {
                projects.splice(projectIndex, 1);
                await configuration.update('projects', projects, vscode.ConfigurationTarget.Global);
                this.refresh();
            }
        } catch (error) {
            vscode.window.showErrorMessage(`Failed to delete project: ${error}`);
        }
    }

    private async _reorderProjects(oldIndex: number, newIndex: number) {
        try {
            this._setLoading(true);
            const configuration = vscode.workspace.getConfiguration('awesomeProjects');
            const projects = [...(configuration.get<Project[]>('projects') || [])];
            const [movedProject] = projects.splice(oldIndex, 1);
            projects.splice(newIndex, 0, movedProject);
            await configuration.update('projects', projects, vscode.ConfigurationTarget.Global);
            this.refresh();
        } catch (error) {
            vscode.window.showErrorMessage(`Failed to reorder projects: ${error}`);
        } finally {
            this._setLoading(false);
        }
    }

    private _setLoading(isLoading: boolean) {
        if (this._view) {
            this._view.webview.postMessage({ command: 'setLoading', isLoading });
        }
    }

    public async refresh() {
        if (this._view) {
            this._view.webview.html = await this._getHtmlForWebview(this._view.webview);
        }
    }

    public dispose() {
        while (this._disposables.length) {
            const disposable = this._disposables.pop();
            if (disposable) {
                disposable.dispose();
            }
        }
    }

    private async _getHtmlForWebview(webview: vscode.Webview) {
        let cssContent;
        try {
            cssContent = await loadResourceFile(this._context, 'dist/css/styles.css');
        } catch (error) {
            console.error('Failed to load CSS:', error);
            cssContent = `
                body { padding: 0; margin: 0; }
                .section { margin-bottom: 20px; }
            `;
        }

        const configuration = vscode.workspace.getConfiguration('awesomeProjects');
        const projects = configuration.get<Project[]>('projects') || [];
        const useFavicons = configuration.get<boolean>('useFavicons') ?? true;
        let version = require('../package.json').version;
        if (parseFloat(version) < 1.0) {
            version += ' Preview - Please report Issues';
        }

        const headerHtml = ReactDOMServer.renderToString(React.createElement(Header));

        return `<!DOCTYPE html>
            <html></html>
            <head>
                <style>${cssContent}</style>
            </head>
            <body>

                ${headerHtml}


            </body>
            </html>`;
    }
}
