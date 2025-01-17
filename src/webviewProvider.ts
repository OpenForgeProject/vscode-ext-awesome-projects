import * as vscode from 'vscode';
import { Project } from './extension';
import * as React from 'react';
import * as ReactDOMServer from 'react-dom/server';
import { loadResourceFile } from './utils/resourceLoader';
import Header from './template/header';
import Footer from './template/footer';

/**
 * Provides a webview for displaying projects.
 */
export class ProjectsWebviewProvider implements vscode.WebviewViewProvider {
    public static readonly viewType = 'awesomeProjectsView';
    private _view?: vscode.WebviewView;
    private _disposables: vscode.Disposable[] = [];

    /**
     * Creates an instance of ProjectsWebviewProvider.
     * @param {vscode.Uri} _extensionUri - The URI of the extension.
     * @param {vscode.ExtensionContext} _context - The extension context.
     */
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

    /**
     * Gets the current webview view.
     * @returns {vscode.WebviewView | undefined} The current webview view.
     */
    public getView(): vscode.WebviewView | undefined {
        return this._view;
    }

    /**
     * Resolves the webview view.
     * @param {vscode.WebviewView} webviewView - The webview view to resolve.
     * @param {vscode.WebviewViewResolveContext} _context - The context for resolving the webview view.
     * @param {vscode.CancellationToken} token - A cancellation token.
     */
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
    }

    /**
     * Refreshes the webview content.
     */
    public async refresh() {
        if (this._view) {
            vscode.window.showInformationMessage('The webview has been refreshed.');
            this._view.webview.html = await this._getHtmlForWebview(this._view.webview);
        }
    }

    /**
     * Disposes of the provider and its resources.
     */
    public dispose() {
        while (this._disposables.length) {
            const disposable = this._disposables.pop();
            if (disposable) {
                disposable.dispose();
            }
        }
    }

    /**
     * Gets the HTML content for the webview.
     * @param {vscode.Webview} webview - The webview to get HTML for.
     * @returns {Promise<string>} The HTML content for the webview.
     */
    private async _getHtmlForWebview(webview: vscode.Webview): Promise<string> {
        let cssContent;
        try {
            cssContent = await loadResourceFile(this._context, 'dist/css/styles.css');
        } catch (error) {
            console.error('Failed to load CSS:', error);
            cssContent = `
                body { padding: 0; margin: 0; }
            `;
        }

        const headerHtml = ReactDOMServer.renderToString(React.createElement(Header));
        const footerHtml = ReactDOMServer.renderToString(React.createElement(Footer));

        return `<!DOCTYPE html>
            <html>
                <head>
                    <style>${cssContent}</style>
                </head>
                <body>
                    ${headerHtml}
                    ${footerHtml}
                </body>
            </html>
        `;
    }
}
