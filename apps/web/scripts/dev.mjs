import { spawn } from "node:child_process";
import { createRequire } from "node:module";
import net from "node:net";
import path from "node:path";
import { fileURLToPath } from "node:url";

const appRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const port = Number(process.env.PORT ?? 3000);
const require = createRequire(path.join(appRoot, "package.json"));
const nextBin = require.resolve("next/dist/bin/next");

function isPortFree(p) {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.unref();
    server.on("error", () => resolve(false));
    server.listen(p, () => {
      server.close(() => resolve(true));
    });
  });
}

const free = await isPortFree(port);
if (!free) {
  console.error(`
Port ${port} is already in use.

pnpm dev will NOT start a second server on another port (that often looks like "wrong code" in the browser).

Fix:
  lsof -ti :${port} | xargs kill
  pnpm dev
`);
  process.exit(1);
}

const child = spawn(process.execPath, [nextBin, "dev", "-p", String(port)], {
  stdio: "inherit",
  cwd: appRoot,
});

child.on("exit", (code) => process.exit(code ?? 0));
