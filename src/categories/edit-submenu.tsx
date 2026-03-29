/** Toggle checkmarks to add/remove a skill from categories. */
import { Action, ActionPanel, Icon, useNavigation } from "@raycast/api";
import { type Categories, byName, saveCategories } from "../data/data";
import { NewCategoryForm } from "./new-category-form";

type EditCategoriesSubmenuProps = {
  skill: string;
  categories: Categories;
  onCategoriesChange: (categories: Categories) => void;
};

export function EditCategoriesSubmenu({ skill, categories, onCategoriesChange }: EditCategoriesSubmenuProps) {
  const { push } = useNavigation();
  const categoryNames = Object.keys(categories).sort(byName);

  function toggleCategory(cat: string) {
    const next = { ...categories };
    const list = next[cat] ?? [];
    if (list.includes(skill)) {
      next[cat] = list.filter((name) => name !== skill);
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
