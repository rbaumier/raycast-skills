import { Action, ActionPanel, Icon, List } from "@raycast/api";
import type { Categories } from "../data/data";
import { EditCategoriesSubmenu } from "../categories/edit-submenu";
import { PasteAction } from "./paste-action";

type SkillItemProps = {
  skill: string;
  selected: Set<string>;
  onToggle: (skill: string) => void;
  onPaste: () => Promise<void>;
  categories: Categories;
  onCategoriesChange: (categories: Categories) => void;
};

/** @description Single skill row with select, paste, and category actions. */
export function SkillItem({
  skill,
  selected,
  onToggle,
  onPaste,
  categories,
  onCategoriesChange,
}: SkillItemProps) {
  const isSelected = selected.has(skill);
  return (
    <List.Item
      id={skill}
      title={skill}
      icon={isSelected ? Icon.CheckCircle : Icon.Circle}
      accessories={isSelected ? [{ tag: { value: "selected" } }] : []}
      actions={
        <ActionPanel>
          <Action
            title={isSelected ? "Deselect" : "Select"}
            icon={Icon.CheckCircle}
            onAction={() => onToggle(skill)}
          />
          <PasteAction count={selected.size} onPaste={onPaste} />
          <EditCategoriesSubmenu
            skill={skill}
            categories={categories}
            onCategoriesChange={onCategoriesChange}
          />
        </ActionPanel>
      }
    />
  );
}
