// Lets TypeScript resolve side-effect CSS imports (e.g. `import "./globals.css"`).
// Next's built-in types only declare `*.module.css`.
declare module "*.css";
