import { rmSync, existsSync } from "node:fs";

const targets = [
  "frontend/.next",
  "frontend/tsconfig.tsbuildinfo",
  "backend/dist",
  "backend/tsconfig.tsbuildinfo"
];

for (const target of targets) {
  if (existsSync(target)) {
    rmSync(target, { recursive: true, force: true });
  }
}
