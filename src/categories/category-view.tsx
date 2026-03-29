import { Action, ActionPanel, Icon, List } from "@raycast/api";
import { type Categories, byName } from "../data/data";
import { ACTION, type PickerAction } from "../data/state";
import { EditCategoriesSubmenu } from "./edit-submenu";
import { PasteAction } from "../skills/paste-action";

type CategoryViewProps = {
  name: string;
  categories: Categories;
  skills: string[];
  selected: Set<string>;
  searchText: string;
  dispatch: (action: PickerAction) => void;
  updateCategories: (categories: Categories) => void;
  onPaste: () => Promise<void>;
};

/** @description Drill-down view showing skills inside a single category with back navigation. */
export function CategoryView({
  name,
  categories,
  skills,
  selected,
  searchText,
  dispatch,
  updateCategories,
  onPaste,
}: CategoryViewProps) {
  const catSkills = (categories[name] ?? []).filter((skill) => skills.includes(skill)).sort(byName);

  return (
    <List
      searchBarPlaceholder={`Filter skills in ${name}...`}
      navigationTitle={name}
      searchText={searchText}
      onSearchTextChange={(text) => dispatch({ type: ACTION.SEARCH, text })}
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
                <Action
                  title={isSelected ? "Deselect" : "Select"}
                  icon={Icon.CheckCircle}
                  onAction={() => dispatch({ type: ACTION.TOGGLE_SKILL, skill })}
                />
                <PasteAction count={selected.size} onPaste={onPaste} />
                <Action
                  title="Go Back"
                  icon={Icon.ArrowLeft}
                  shortcut={{ modifiers: [], key: "arrowLeft" }}
                  onAction={() => dispatch({ type: ACTION.GO_BACK })}
                />
                <EditCategoriesSubmenu
                  skill={skill}
                  categories={categories}
                  onCategoriesChange={updateCategories}
                />
              </ActionPanel>
            }
          />
        );
      })}
    </List>
  );
}
