import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { mkdtemp, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const cliPath = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../src/cli.js");

describe("agent-rules init", () => {
  it("generates AGENTS.md from package scripts", async () => {
    const dir = await mkdtemp(path.join(tmpdir(), "agent-rules-"));
    await writeFile(path.join(dir, "package.json"), JSON.stringify({
      scripts: {
        test: "node --test",
        lint: "eslint ."
      }
    }), "utf8");

    await run(["init", "--cwd", dir]);

    const output = await readFile(path.join(dir, "AGENTS.md"), "utf8");
    assert.match(output, /TypeScript\/JavaScript/);
    assert.match(output, /npm run test/);
    assert.match(output, /npm run lint/);
  });

  it("supports dry-run without writing files", async () => {
    const dir = await mkdtemp(path.join(tmpdir(), "agent-rules-"));
    const result = await run(["init", "--cwd", dir, "--dry-run"]);

    assert.match(result.stdout, /--- AGENTS.md ---/);
  });
});

function run(args) {
  return new Promise((resolve, reject) => {
    execFile("node", [cliPath, ...args], (error, stdout, stderr) => {
      if (error) {
        reject(new Error(`${stderr}\n${stdout}`));
        return;
      }
      resolve({ stdout, stderr });
    });
  });
}
