/**
 * State machine for the skills picker.
 *
 * Two views: "root" (category list) and "category" (skill list inside a folder).
 * Selection persists across navigation. Search text is saved/restored on drill-down.
 */
import type { Categories } from "./data";

// --- Navigation ---

type RootView = {
  view: "root";
  lastCategory: string | null;
};

type CategoryView = {
  view: "category";
  name: string;
  savedSearchText: string;
};

type Navigation = RootView | CategoryView;

// --- State ---

export type PickerState = {
  selected: Set<string>;
  categories: Categories;
  skills: string[];
  /** Pre-computed Set for O(1) skill lookups in filters. */
  skillsSet: Set<string>;
  searchText: string;
  navigation: Navigation;
};

export const initialState: PickerState = {
  selected: new Set(),
  categories: {},
  skills: [],
  skillsSet: new Set(),
  searchText: "",
  navigation: { view: "root", lastCategory: null },
};

// --- Actions ---

type InitAction = { type: "init"; skills: string[]; categories: Categories };
type ToggleSkillAction = { type: "toggle-skill"; skill: string };
type ToggleAllAction = { type: "toggle-all"; skills: string[] };
type SetCategoriesAction = { type: "set-categories"; categories: Categories };
type SearchAction = { type: "search"; text: string };
type OpenCategoryAction = { type: "open-category"; name: string };
type GoBackAction = { type: "go-back" };

export type PickerAction =
  | InitAction
  | ToggleSkillAction
  | ToggleAllAction
  | SetCategoriesAction
  | SearchAction
  | OpenCategoryAction
  | GoBackAction;

// --- Reducer ---

export function pickerReducer(state: PickerState, action: PickerAction): PickerState {
  switch (action.type) {
    case "init":
      return { ...state, skills: action.skills, skillsSet: new Set(action.skills), categories: action.categories };

    case "toggle-skill": {
      const next = new Set(state.selected);
      if (next.has(action.skill)) { next.delete(action.skill); } else { next.add(action.skill); }
      return { ...state, selected: next };
    }

    case "toggle-all": {
      const next = new Set(state.selected);
      const allSelected = action.skills.every((skill) => next.has(skill));
      for (const skill of action.skills) {
        if (allSelected) { next.delete(skill); } else { next.add(skill); }
      }
      return { ...state, selected: next };
    }

    case "set-categories":
      return { ...state, categories: action.categories };

    case "search":
      return {
        ...state,
        searchText: action.text,
        // Reset lastCategory on root search so selectedItemId doesn't stick
        navigation: state.navigation.view === "root"
          ? { view: "root", lastCategory: null }
          : state.navigation,
      };

    case "open-category":
      return {
        ...state,
        navigation: { view: "category", name: action.name, savedSearchText: state.searchText },
        searchText: "",
      };

    case "go-back": {
      const nav = state.navigation;
      if (nav.view !== "category") return state;
      return {
        ...state,
        searchText: nav.savedSearchText,
        navigation: { view: "root", lastCategory: nav.name },
      };
    }
  }
}
