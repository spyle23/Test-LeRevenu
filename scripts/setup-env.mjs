#!/usr/bin/env node
// Creates the local env files from their examples, with freshly generated secrets.
// Existing files are never overwritten.
import { randomBytes } from "node:crypto";
import { copyFileSync, existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const secret = () => randomBytes(24).toString("base64url");

const files = [
  [".env.example", ".env"],
  ["backend/.env.example", "backend/.env"],
  ["frontend/.env.example", "frontend/.env.local"],
];

for (const [example, target] of files) {
  const destination = join(root, target);
  if (existsSync(destination)) {
    console.log(`= ${target} already exists, left untouched`);
    continue;
  }

  copyFileSync(join(root, example), destination);
  const content = readFileSync(destination, "utf8").replace(/change-me(-\d+)?/g, secret);
  writeFileSync(destination, content);
  console.log(`+ ${target}`);
}
