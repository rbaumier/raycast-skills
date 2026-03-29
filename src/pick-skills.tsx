import { Action, ActionPanel, Clipboard, Form, Icon, List, closeMainWindow, showHUD, useNavigation } from "@raycast/api";
import { readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import { useEffect, useState } from "react";

const SKILLS_DIR = join(homedir(), ".claude", "skills");
const CATEGORIES_FILE = join(SKILLS_DIR, ".categories.json");
const IGNORED = new Set([".DS_Store", "README.md", ".categories.json"]);

type Categories = Record<string, string[]>;

function loadSkills(): string[] {
  try {
    return readdirSync(SKILLS_DIR)
      .filter((name) => {
        if (IGNORED.has(name) || name.startsWith(".")) return false;
        try {
          return statSync(join(SKILLS_DIR, name)).isDirectory();
        } catch {
          return false;
        }
      })
      .sort((a, b) => a.localeCompare(b));
  } catch {
    return [];
  }
}

function loadCategories(): Categories {
  try {
    return JSON.parse(readFileSync(CATEGORIES_FILE, "utf-8"));
  } catch {
    return {};
  }
}

function saveCategories(categories: Categories) {
  writeFileSync(CATEGORIES_FILE, JSON.stringify(categories, null, 2));
}

function getUncategorized(skills: string[], categories: Categories): string[] {
  const categorized = new Set(Object.values(categories).flat());
  return skills.filter((s) => !categorized.has(s));
}

// --- Forms ---

function NewCategoryForm({ skill, categories, onDone }: { skill: string; categories: Categories; onDone: (c: Categories) => void }) {
  const { pop } = useNavigation();
  return (
    <Form
      actions={
        <ActionPanel>
          <Action.SubmitForm
            title="Create Category"
            onSubmit={(values: { name: string }) => {
              const name = values.name.trim();
              if (!name) { pop(); return; }
              const next = { ...categories };
              next[name] = [...(next[name] ?? []), skill];
              saveCategories(next);
              onDone(next);
              pop();
            }}
          />
        </ActionPanel>
      }
    >
      <Form.TextField id="name" title="Category Name" />
    </Form>
  );
}

function RenameCategoryForm({ currentName, categories, onDone }: { currentName: string; categories: Categories; onDone: (c: Categories) => void }) {
  const { pop } = useNavigation();
  return (
    <Form
      actions={
        <ActionPanel>
          <Action.SubmitForm
            title="Rename"
            onSubmit={(values: { name: string }) => {
              const name = values.name.trim();
              if (!name || name === currentName) { pop(); return; }
              const next = { ...categories };
              next[name] = next[currentName];
              delete next[currentName];
              saveCategories(next);
              onDone(next);
              pop();
            }}
          />
        </ActionPanel>
      }
    >
      <Form.TextField id="name" title="Category Name" defaultValue={currentName} />
    </Form>
  );
}

// --- Submenu ---

function EditCategoriesSubmenu({ skill, categories, onCategoriesChange }: { skill: string; categories: Categories; onCategoriesChange: (c: Categories) => void }) {
  const { push } = useNavigation();
  const categoryNames = Object.keys(categories).sort((a, b) => a.localeCompare(b));

  function toggleCategory(cat: string) {
    const next = { ...categories };
    const list = next[cat] ?? [];
    if (list.includes(skill)) {
      next[cat] = list.filter((s) => s !== skill);
      if (next[cat].length === 0) delete next[cat];
    } else {
      next[cat] = [...list, skill];
    }
    saveCategories(next);
    onCategoriesChange(next);
  }

  return (
    <ActionPanel.Submenu title="Edit Categories" icon={Icon.Folder} shortcut={{ modifiers: ["cmd"], key: "e" }}>
      {categoryNames.map((cat) => {
        const isIn = (categories[cat] ?? []).includes(skill);
        return <Action key={cat} title={cat} icon={isIn ? Icon.CheckCircle : Icon.Circle} onAction={() => toggleCategory(cat)} />;
      })}
      <Action
        title="New Category..."
        icon={Icon.PlusCircle}
        shortcut={{ modifiers: ["cmd"], key: "n" }}
        onAction={() => push(<NewCategoryForm skill={skill} categories={categories} onDone={onCategoriesChange} />)}
      />
    </ActionPanel.Submenu>
  );
}

// --- Main ---

export default function PickSkills() {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [categories, setCategories] = useState<Categories>({});
  const [currentCategory, setCurrentCategory] = useState<string | null>(null);
  const [lastCategory, setLastCategory] = useState<string | null>(null);
  const skills = loadSkills();
  const { push } = useNavigation();

  useEffect(() => {
    setCategories(loadCategories());
  }, []);

  function toggle(skill: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(skill) ? next.delete(skill) : next.add(skill);
      return next;
    });
  }

  function toggleAll(skillNames: string[]) {
    setSelected((prev) => {
      const next = new Set(prev);
      const allSelected = skillNames.every((s) => next.has(s));
      for (const s of skillNames) {
        allSelected ? next.delete(s) : next.add(s);
      }
      return next;
    });
  }

  async function pasteSelected() {
    if (selected.size === 0) return;
    const text = [...selected].sort((a, b) => a.localeCompare(b)).map((s) => `skill:${s}`).join(", ");
    await Clipboard.paste(text);
    await closeMainWindow();
    await showHUD(`Pasted ${selected.size} skill${selected.size > 1 ? "s" : ""}`);
  }

  const categoryNames = Object.keys(categories).sort((a, b) => a.localeCompare(b));
  const uncategorized = getUncategorized(skills, categories);

  // --- Inside a category ---
  if (currentCategory) {
    const catSkills = (categories[currentCategory] ?? []).filter((s) => skills.includes(s)).sort((a, b) => a.localeCompare(b));
    return (
      <List searchBarPlaceholder={`Filter skills in ${currentCategory}...`} navigationTitle={currentCategory}>
        {catSkills.map((skill) => {
          const isSelected = selected.has(skill);
          return (
            <List.Item
              key={skill}
              title={skill}
              icon={isSelected ? Icon.CheckCircle : Icon.Circle}
              accessories={isSelected ? [{ tag: { value: "selected" } }] : []}
              actions={
                <ActionPanel>
                  <Action title={isSelected ? "Deselect" : "Select"} icon={Icon.CheckCircle} onAction={() => toggle(skill)} />
                  <Action
                    title={`Paste ${selected.size} Skill${selected.size !== 1 ? "s" : ""}`}
                    icon={Icon.Clipboard}
                    shortcut={{ modifiers: ["cmd"], key: "return" }}
                    onAction={pasteSelected}
                  />
                  <Action
                    title="Go Back"
                    icon={Icon.ArrowLeft}
                    shortcut={{ modifiers: [], key: "arrowLeft" }}
                    onAction={() => {
                      setLastCategory(currentCategory);
                      setCurrentCategory(null);
                    }}
                  />
                  <EditCategoriesSubmenu skill={skill} categories={categories} onCategoriesChange={setCategories} />
                </ActionPanel>
              }
            />
          );
        })}
      </List>
    );
  }

  // --- Root view ---
  return (
    <List searchBarPlaceholder="Filter skills..." selectedItemId={lastCategory ? `cat-${lastCategory}` : undefined}>
      {categoryNames.map((cat) => {
        const catSkills = (categories[cat] ?? []).filter((s) => skills.includes(s));
        if (catSkills.length === 0) return null;
        const allSelected = catSkills.every((s) => selected.has(s));
        const selectedCount = catSkills.filter((s) => selected.has(s)).length;
        return (
          <List.Item
            key={`cat-${cat}`}
            title={cat}
            icon={Icon.Folder}
            subtitle={`${catSkills.length} skill${catSkills.length > 1 ? "s" : ""}`}
            accessories={selectedCount > 0 ? [{ tag: { value: `${selectedCount} selected` } }] : []}
            actions={
              <ActionPanel>
                <Action
                  title={allSelected ? "Deselect All" : "Select All"}
                  icon={Icon.CheckCircle}
                  onAction={() => toggleAll(catSkills)}
                />
                <Action
                  title={`Paste ${selected.size} Skill${selected.size !== 1 ? "s" : ""}`}
                  icon={Icon.Clipboard}
                  shortcut={{ modifiers: ["cmd"], key: "return" }}
                  onAction={pasteSelected}
                />
                <Action
                  title="Open"
                  icon={Icon.ArrowRight}
                  shortcut={{ modifiers: [], key: "arrowRight" }}
                  onAction={() => setCurrentCategory(cat)}
                />
                <Action
                  title="Rename Category"
                  icon={Icon.Pencil}
                  shortcut={{ modifiers: ["cmd"], key: "r" }}
                  onAction={() => push(<RenameCategoryForm currentName={cat} categories={categories} onDone={setCategories} />)}
                />
                <Action
                  title="Delete Category"
                  icon={Icon.Trash}
                  style={Action.Style.Destructive}
                  shortcut={{ modifiers: ["cmd"], key: "d" }}
                  onAction={() => {
                    const next = { ...categories };
                    delete next[cat];
                    saveCategories(next);
                    setCategories(next);
                  }}
                />
              </ActionPanel>
            }
          />
        );
      })}

      {uncategorized.length > 0 && (
        <List.Section title="Uncategorized">
          {uncategorized.map((skill) => {
            const isSelected = selected.has(skill);
            return (
              <List.Item
                key={skill}
                title={skill}
                icon={isSelected ? Icon.CheckCircle : Icon.Circle}
                accessories={isSelected ? [{ tag: { value: "selected" } }] : []}
                actions={
                  <ActionPanel>
                    <Action title={isSelected ? "Deselect" : "Select"} icon={Icon.CheckCircle} onAction={() => toggle(skill)} />
                    <Action
                      title={`Paste ${selected.size} Skill${selected.size !== 1 ? "s" : ""}`}
                      icon={Icon.Clipboard}
                      shortcut={{ modifiers: ["cmd"], key: "return" }}
                      onAction={pasteSelected}
                    />
                    <EditCategoriesSubmenu skill={skill} categories={categories} onCategoriesChange={setCategories} />
                  </ActionPanel>
                }
              />
            );
          })}
        </List.Section>
      )}
    </List>
  );
}
