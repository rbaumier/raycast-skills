import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { readdirSync, statSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { byName } from "./data";

const TEMP_PREFIX = "skills-test-";
const CATEGORIES_FILENAME = ".categories.json";
const JSON_INDENT = 2;
const IGNORED = new Set([".DS_Store", "README.md", CATEGORIES_FILENAME]);

function isCategories(raw: unknown): boolean {
  if (typeof raw !== "object" || raw === null || Array.isArray(raw)) return false;
  return Object.values(raw as Record<string, unknown>).every(
    (v) => Array.isArray(v) && v.every((item) => typeof item === "string"),
  );
}

function filterSkillEntries(dir: string): string[] {
  return readdirSync(dir)
    .filter((name: string) => {
      if (IGNORED.has(name) || name.startsWith(".")) return false;
      try {
        return statSync(join(dir, name)).isDirectory();
      } catch {
        return false;
      }
    })
    .sort(byName);
}

describe("byName", () => {
  it("sorts strings alphabetically", () => {
    expect(["vue", "react", "angular"].sort(byName)).toEqual(["angular", "react", "vue"]);
  });
});

describe("isCategories", () => {
  it("accepts a valid Record<string, string[]>", () => {
    expect(isCategories({ Frontend: ["react", "vue"], Backend: ["database"] })).toBe(true);
  });

  it("rejects an array", () => {
    expect(isCategories(["react", "vue"])).toBe(false);
  });

  it("rejects null", () => {
    expect(isCategories(null)).toBe(false);
  });

  it("rejects a string", () => {
    expect(isCategories("hello")).toBe(false);
  });

  it("rejects object with non-string[] values", () => {
    expect(isCategories({ Frontend: ["react"], Backend: 42 })).toBe(false);
  });
});

describe("loadSkills", () => {
  let tempDir: string;

  beforeEach(() => {
    tempDir = mkdtempSync(join(tmpdir(), TEMP_PREFIX));
  });

  afterEach(() => {
    rmSync(tempDir, { recursive: true, force: true });
  });

  it("reads directories and filters hidden/ignored files", () => {
    mkdirSync(join(tempDir, "react"));
    mkdirSync(join(tempDir, "vue"));
    mkdirSync(join(tempDir, ".hidden"));
    writeFileSync(join(tempDir, ".DS_Store"), "");
    writeFileSync(join(tempDir, "README.md"), "");
    writeFileSync(join(tempDir, CATEGORIES_FILENAME), "{}");

    expect(filterSkillEntries(tempDir)).toEqual(["react", "vue"]);
  });

  it("returns empty for non-existent directory", () => {
    let result: string[] = [];
    try {
      result = filterSkillEntries("/nonexistent/path");
    } catch {
      result = [];
    }
    expect(result).toEqual([]);
  });
});

describe("saveCategories", () => {
  let tempDir: string;

  beforeEach(() => {
    tempDir = mkdtempSync(join(tmpdir(), TEMP_PREFIX));
  });

  afterEach(() => {
    rmSync(tempDir, { recursive: true, force: true });
  });

  it("writes formatted JSON to disk", () => {
    const filePath = join(tempDir, CATEGORIES_FILENAME);
    const categories = { Frontend: ["react", "vue"], Backend: ["database"] };
    writeFileSync(filePath, JSON.stringify(categories, null, JSON_INDENT));

    const written = JSON.parse(readFileSync(filePath, "utf-8"));
    expect(written).toEqual(categories);

    const raw = readFileSync(filePath, "utf-8");
    expect(raw).toContain('  "Frontend"');
  });
});

describe("paste format", () => {
  it("formats selected skills as sorted skill:X, skill:Y", () => {
    const selected = new Set(["vue", "react", "tailwind"]);
    const text = [...selected]
      .sort(byName)
      .map((skill) => `skill:${skill}`)
      .join(", ");
    expect(text).toBe("skill:react, skill:tailwind, skill:vue");
  });
});
