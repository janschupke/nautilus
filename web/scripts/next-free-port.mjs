#!/usr/bin/env node
import { spawn } from "node:child_process";
import net from "node:net";

const command = process.argv[2];
const passthroughArgs = process.argv.slice(3);

if (!["dev", "start"].includes(command)) {
  console.error(
    "Usage: node scripts/next-free-port.mjs <dev|start> [next args...]",
  );
  process.exit(1);
}

function hasExplicitPort(args) {
  return args.some(
    (arg) => arg === "-p" || arg === "--port" || arg.startsWith("--port="),
  );
}

function canListen(port) {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.once("error", () => resolve(false));
    server.once("listening", () => {
      server.close(() => resolve(true));
    });
    server.listen(port, "::");
  });
}

async function findFreePort(startPort) {
  for (let port = startPort; port < startPort + 100; port += 1) {
    if (await canListen(port)) {
      return port;
    }
  }

  throw new Error(`No free port found from ${startPort} to ${startPort + 99}`);
}

const requestedPort = Number.parseInt(process.env.PORT ?? "3000", 10);
const startPort = Number.isFinite(requestedPort) ? requestedPort : 3000;
const nextArgs = [command, ...passthroughArgs];
const env = { ...process.env };

if (!hasExplicitPort(passthroughArgs)) {
  const port = await findFreePort(startPort);
  nextArgs.push("--port", String(port));
  env.PORT = String(port);

  if (port !== startPort) {
    console.log(`Port ${startPort} is busy; using ${port}.`);
  }
}

const child = spawn("next", nextArgs, {
  stdio: "inherit",
  env,
  shell: process.platform === "win32",
});

child.on("exit", (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }

  process.exit(code ?? 0);
});
