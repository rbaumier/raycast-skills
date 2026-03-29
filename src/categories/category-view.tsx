/** Drill-down view showing skills inside a single category. */
import { Action, ActionPanel, Icon, List } from "@raycast/api";
import { type Categories, byName } from "../data/data";
import type { PickerAction } from "../data/state";
import { EditCategoriesSubmenu } from "./edit-submenu";
import { PasteAction } from "../skills/paste-action";

type CategoryViewProps = {
  name: string;
  categories: Categories;
  skillsSet: Set<string>;
  selected: Set<string>;
  searchText: string;
  dispatch: (action: PickerAction) => void;
  updateCategories: (categories: Categories) => void;
  onPaste: () => Promise<void>;
};

export function CategoryView({ name, categories, skillsSet, selected, searchText, dispatch, updateCategories, onPaste }: CategoryViewProps) {
  const catSkills = (categories[name] ?? []).filter((skill) => skillsSet.has(skill)).sort(byName);

  return (
    <List
      searchBarPlaceholder={`Filter skills in ${name}...`}
      navigationTitle={name}
      searchText={searchText}
      onSearchTextChange={(text) => dispatch({ type: "search", text })}
    >
      {catSkills.map((skill) => {
        const isSelected = selected.has(skill);
        return (
          <List.Item
            id={skill}
            key={skill}
            title={skill}
            icon={isSelected ? Icon.CheckCircle : Icon.Circle}
            accessories={isSelected ? [{ tag: { value: "selected" } }] : []}
            actions={
              <ActionPanel>
                <Action title={isSelected ? "Deselect" : "Select"} icon={Icon.CheckCircle} onAction={() => dispatch({ type: "toggle-skill", skill })} />
                <PasteAction count={selected.size} onPaste={onPaste} />
                <Action title="Go Back" icon={Icon.ArrowLeft} shortcut={{ modifiers: [], key: "arrowLeft" }} onAction={() => dispatch({ type: "go-back" })} />
                <EditCategoriesSubmenu skill={skill} categories={categories} onCategoriesChange={updateCategories} />
              </ActionPanel>
            }
          />
        );
      })}
    </List>
  );
}
