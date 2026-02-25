import { Action, ActionPanel, Clipboard, Icon, List, closeMainWindow, showHUD } from "@raycast/api";
import { readdirSync, statSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import { useState } from "react";

const SKILLS_DIR = join(homedir(), ".claude", "skills");

const IGNORED = new Set([".DS_Store", "README.md"]);

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

export default function PickSkills() {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const skills = loadSkills();

  function toggle(skill: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(skill)) {
        next.delete(skill);
      } else {
        next.add(skill);
      }
      return next;
    });
  }

  async function pasteSelected() {
    const list = skills.filter((s) => selected.has(s));
    if (list.length === 0) return;
    const text = list.map((s) => `skill:${s}`).join(", ");
    await Clipboard.paste(text);
    await closeMainWindow();
    await showHUD(`Pasted ${list.length} skill${list.length > 1 ? "s" : ""}`);
  }

  return (
    <List searchBarPlaceholder="Filter skills...">
      {skills.map((skill) => {
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
              </ActionPanel>
            }
          />
        );
      })}
    </List>
  );
}
