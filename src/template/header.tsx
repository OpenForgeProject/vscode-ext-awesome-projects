import React from "react";

const Header: React.FC = () => {
  return (
    <header>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        className="logo"
        fill="currentColor"
      >
        <path stroke="none" d="M0 0h24v24H0z" fill="none" />
        <path d="M6.5 21a4.5 4.5 0 0 1 -4.5 -4.5v-2.518l.004 -.071l.014 -.103l.018 -.076l3.006 -10.02a1 1 0 0 1 .958 -.712h2a1 1 0 1 1 0 2h-1.257l-2.4 8h5.657a1 1 0 0 1 1 1v1h2v-1a1 1 0 0 1 1 -1h5.656l-2.4 -8h-1.256a1 1 0 0 1 -.993 -.883l-.007 -.117a1 1 0 0 1 1 -1h2a1 1 0 0 1 .958 .713l3.01 10.036l.022 .112l.008 .08l.002 2.559a4.5 4.5 0 0 1 -8.972 .5h-2.056a4.5 4.5 0 0 1 -4.472 4" />
      </svg>

      <h1>Awesome Projects</h1>
    </header>
  );
};

export default Header;
