/**
 * Data layer for skills and categories.
 *
 * Skills are directories in ~/.claude/skills/.
 * Categories are stored as a JSON map in ~/.claude/skills/.categories.json.
 * A skill can belong to multiple categories. Uncategorized skills have no entry.
 */
import { readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import { Result } from "better-result";

// --- Types ---

export type Categories = Record<string, string[]>;

// --- Constants ---

export const SKILLS_DIR = join(homedir(), ".claude", "skills");
const CATEGORIES_FILE = join(SKILLS_DIR, ".categories.json");
const IGNORED = new Set([".DS_Store", "README.md", ".categories.json"]);
const JSON_INDENT = 2;

/** Alphabetical comparator for sorting strings by locale. */
export const byName = (a: string, b: string) => a.localeCompare(b);

// --- Validation ---

/** Validates that parsed JSON conforms to the Categories shape. */
function isCategories(raw: unknown): raw is Categories {
  if (typeof raw !== "object" || raw === null || Array.isArray(raw)) return false;
  return Object.values(raw as Record<string, unknown>).every(
    (v) => Array.isArray(v) && v.every((item) => typeof item === "string"),
  );
}

// --- Data access ---

/** Reads skill directories from disk, filtering hidden/ignored entries. */
export function loadSkills(): string[] {
  const result = Result.try(() =>
    readdirSync(SKILLS_DIR)
      .filter((name) => {
        if (IGNORED.has(name) || name.startsWith(".")) return false;
        return Result.try(() => statSync(join(SKILLS_DIR, name)).isDirectory()).unwrapOr(false);
      })
      .sort(byName),
  );
  return result.unwrapOr([]);
}

/** Reads and validates the categories JSON file. Returns empty map on any failure. */
export function loadCategories(): Categories {
  const result = Result.try(() => {
    const raw: unknown = JSON.parse(readFileSync(CATEGORIES_FILE, "utf-8"));
    if (!isCategories(raw)) return {};
    return raw;
  });
  return result.unwrapOr({});
}

/** Persists categories to disk. Fails silently — stale data until next open. */
export function saveCategories(categories: Categories): void {
  Result.try(() => writeFileSync(CATEGORIES_FILE, JSON.stringify(categories, null, JSON_INDENT)));
}
