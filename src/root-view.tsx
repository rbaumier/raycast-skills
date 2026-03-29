/** Root view — category folders + uncategorized skills, with search across all. */
import { List } from "@raycast/api";
import type { Categories } from "./data/data";
import type { PickerAction } from "./data/state";
import { CategoryItem } from "./categories/category-item";
import { SkillItem } from "./skills/skill-item";

type RootViewProps = {
  categoryNames: string[];
  categories: Categories;
  skills: string[];
  skillsSet: Set<string>;
  selected: Set<string>;
  searchText: string;
  lastCategory: string | null;
  categorizedSkillSet: Set<string>;
  uncategorized: string[];
  dispatch: (action: PickerAction) => void;
  updateCategories: (categories: Categories) => void;
  onPaste: () => Promise<void>;
};

export function RootView({
  categoryNames, categories, skills, skillsSet, selected, searchText, lastCategory,
  categorizedSkillSet, uncategorized, dispatch, updateCategories, onPaste,
}: RootViewProps) {
  const isSearching = searchText.length > 0;
  const searchLower = searchText.toLowerCase();

  const categorizedSearchResults = isSearching
    ? skills.filter((skill) => skill.toLowerCase().includes(searchLower) && categorizedSkillSet.has(skill))
    : [];

  const filteredUncategorized = isSearching
    ? uncategorized.filter((skill) => skill.toLowerCase().includes(searchLower))
    : uncategorized;

  return (
    <List
      searchBarPlaceholder="Filter skills..."
      selectedItemId={lastCategory ? `cat-${lastCategory}` : undefined}
      searchText={searchText}
      onSearchTextChange={(text) => dispatch({ type: "search", text })}
      filtering={!isSearching}
    >
      {categoryNames.map((cat) => {
        const catSkills = (categories[cat] ?? []).filter((skill) => skillsSet.has(skill));
        if (catSkills.length === 0) return null;
        if (isSearching && !cat.toLowerCase().includes(searchLower)) return null;
        return (
          <CategoryItem
            key={`cat-${cat}`}
            cat={cat}
            catSkills={catSkills}
            selected={selected}
            dispatch={dispatch}
            categories={categories}
            updateCategories={updateCategories}
            onPaste={onPaste}
          />
        );
      })}

      {isSearching && categorizedSearchResults.length > 0 && (
        <List.Section title="Skills">
          {categorizedSearchResults.map((skill) => (
            <SkillItem
              key={`search-${skill}`}
              skill={skill}
              selected={selected}
              onToggle={(s) => dispatch({ type: "toggle-skill", skill: s })}
              onPaste={onPaste}
              categories={categories}
              onCategoriesChange={updateCategories}
            />
          ))}
        </List.Section>
      )}

      {filteredUncategorized.length > 0 && (
        <List.Section title="Uncategorized">
          {filteredUncategorized.map((skill) => (
            <SkillItem
              key={skill}
              skill={skill}
              selected={selected}
              onToggle={(s) => dispatch({ type: "toggle-skill", skill: s })}
              onPaste={onPaste}
              categories={categories}
              onCategoriesChange={updateCategories}
            />
          ))}
        </List.Section>
      )}
    </List>
  );
}
