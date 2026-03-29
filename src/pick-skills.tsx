/**
 * Claude Skills Picker — main command entry point.
 *
 * Thin shell: initializes state, wires up the reducer, and delegates
 * rendering to RootView or CategoryView based on navigation state.
 */
import { Clipboard, closeMainWindow, showHUD } from "@raycast/api";
import { useEffect, useMemo, useReducer } from "react";
import { byName, loadCategories, loadSkills } from "./data/data";
import { initialState, pickerReducer } from "./data/state";
import { CategoryView } from "./categories/category-view";
import { RootView } from "./root-view";

export function PickSkills() {
  const [state, dispatch] = useReducer(pickerReducer, initialState);
  const { selected, categories, skills, skillsSet, searchText, navigation } = state;

  useEffect(() => {
    dispatch({ type: "init", skills: loadSkills(), categories: loadCategories() });
  }, []);

  // --- Derived data ---

  const categoryNames = useMemo(() => Object.keys(categories).sort(byName), [categories]);

  const categorizedSkillSet = useMemo(() => {
    return new Set(categoryNames.flatMap((cat) => (categories[cat] ?? []).filter((skill) => skillsSet.has(skill))));
  }, [categories, categoryNames, skillsSet]);

  const uncategorized = useMemo(() => {
    return skills.filter((skill) => !categorizedSkillSet.has(skill));
  }, [skills, categorizedSkillSet]);

  // --- Handlers ---

  const updateCategories = (c: typeof categories) => dispatch({ type: "set-categories", categories: c });

  async function pasteSelected() {
    if (selected.size === 0) return;
    const text = [...selected].sort(byName).map((skill) => `skill:${skill}`).join(", ");
    await Clipboard.paste(text);
    await closeMainWindow();
    await showHUD(`Pasted ${selected.size} skill${selected.size > 1 ? "s" : ""}`);
  }

  // --- Routing ---

  if (navigation.view === "category") {
    return (
      <CategoryView
        name={navigation.name}
        categories={categories}
        skillsSet={skillsSet}
        selected={selected}
        searchText={searchText}
        dispatch={dispatch}
        updateCategories={updateCategories}
        onPaste={pasteSelected}
      />
    );
  }

  return (
    <RootView
      categoryNames={categoryNames}
      categories={categories}
      skills={skills}
      skillsSet={skillsSet}
      selected={selected}
      searchText={searchText}
      lastCategory={navigation.lastCategory}
      categorizedSkillSet={categorizedSkillSet}
      uncategorized={uncategorized}
      dispatch={dispatch}
      updateCategories={updateCategories}
      onPaste={pasteSelected}
    />
  );
}

// Raycast requires default export for commands
export default PickSkills; // eslint-disable-line import/no-default-export
