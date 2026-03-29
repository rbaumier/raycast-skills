import { Action, ActionPanel, Icon, List, useNavigation } from "@raycast/api";
import { type Categories, saveCategories } from "../data/data";
import { ACTION, type PickerAction } from "../data/state";
import { PasteAction } from "../skills/paste-action";
import { RenameCategoryForm } from "./rename-form";

type CategoryItemProps = {
  cat: string;
  catSkills: string[];
  selected: Set<string>;
  dispatch: (action: PickerAction) => void;
  categories: Categories;
  updateCategories: (categories: Categories) => void;
  onPaste: () => Promise<void>;
};

/** @description Folder row in root view — category name, skill count, select/open/rename/delete actions. */
export function CategoryItem({
  cat,
  catSkills,
  selected,
  dispatch,
  categories,
  updateCategories,
  onPaste,
}: CategoryItemProps) {
  const { push } = useNavigation();
  const allSelected = catSkills.every((skill) => selected.has(skill));
  const selectedCount = catSkills.filter((skill) => selected.has(skill)).length;

  return (
    <List.Item
      id={`cat-${cat}`}
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
            onAction={() => dispatch({ type: ACTION.TOGGLE_ALL, skills: catSkills })}
          />
          <PasteAction count={selected.size} onPaste={onPaste} />
          <Action
            title="Open"
            icon={Icon.ArrowRight}
            shortcut={{ modifiers: [], key: "arrowRight" }}
            onAction={() => dispatch({ type: ACTION.OPEN_CATEGORY, name: cat })}
          />
          <Action
            title="Rename Category"
            icon={Icon.Pencil}
            shortcut={{ modifiers: ["cmd"], key: "r" }}
            onAction={() =>
              push(
                <RenameCategoryForm
                  currentName={cat}
                  categories={categories}
                  onDone={updateCategories}
                />,
              )
            }
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
              updateCategories(next);
            }}
          />
        </ActionPanel>
      }
    />
  );
}
