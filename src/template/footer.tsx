import React from "react";

const Footer: React.FC = () => {
  return (
    <footer>
        <a href="https://github.com/OpenForgeProject/vscode-ext-awesome-projects/issues/new?template=bug_report.md" target="_blank" rel="noopener noreferrer" aria-label="Report an Issue">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" viewBox="0 0 24 24">
                <path stroke="none" d="M0 0h24v24H0z"/>
                <path d="M9 9V8a3 3 0 0 1 6 0v1M8 9h8a6 6 0 0 1 1 3v3a5 5 0 0 1-10 0v-3a6 6 0 0 1 1-3M3 13h4M17 13h4M12 20v-6M4 19l3.35-2M20 19l-3.35-2M4 7l3.75 2.4M20 7l-3.75 2.4"/>
            </svg>
            Report an Issue
        </a>
        <a href="https://github.com/OpenForgeProject/vscode-ext-awesome-projects/issues/new?template=feature_request.md" target="_blank" rel="noopener noreferrer" aria-label="Request a Feature">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" viewBox="0 0 24 24">
                <path stroke="none" d="M0 0h24v24H0z"/>
                <path d="M20.985 12.528a9 9 0 1 0-8.45 8.456M16 19h6M19 16v6M9 10h.01M15 10h.01"/>
                <path d="M9.5 15c.658.64 1.56 1 2.5 1s1.842-.36 2.5-1"/>
            </svg>
            You miss a Feature? Request it!
        </a>
        <a href="https://github.com/sponsors/dermatz" className='sponsor' target="_blank" rel="noopener noreferrer" aria-label="Buy me a Coffee">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" viewBox="0 0 24 24">
                <path stroke="none" d="M0 0h24v24H0z"/>
                <path d="m13 19-1 1-7.5-7.428A5 5 0 1 1 12 6.006a5 5 0 0 1 8.785 4.444M21 15h-2.5a1.5 1.5 0 0 0 0 3h1a1.5 1.5 0 0 1 0 3H17M19 21v1m0-8v1"/>
            </svg>
            <strong>Happy?</strong> Buy me a Coffee
        </a>
    </footer>
  );
};

export default Footer;
