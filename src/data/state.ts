/**
 * @description State machine for the skills picker.
 * Two views: "root" (category list) and "category" (skill list inside a folder).
 * Selection persists across navigation. Search text is saved/restored on drill-down.
 */
import type { Categories } from "./data";

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

export type PickerState = {
  selected: Set<string>;
  categories: Categories;
  skills: string[];
  searchText: string;
  navigation: Navigation;
};

export const initialState: PickerState = {
  selected: new Set(),
  categories: {},
  skills: [],
  searchText: "",
  navigation: { view: "root", lastCategory: null },
};

export const ACTION = {
  INIT: "init",
  TOGGLE_SKILL: "toggle-skill",
  TOGGLE_ALL: "toggle-all",
  SET_CATEGORIES: "set-categories",
  SEARCH: "search",
  OPEN_CATEGORY: "open-category",
  GO_BACK: "go-back",
} as const;

type InitAction = { type: typeof ACTION.INIT; skills: string[]; categories: Categories };
type ToggleSkillAction = { type: typeof ACTION.TOGGLE_SKILL; skill: string };
type ToggleAllAction = { type: typeof ACTION.TOGGLE_ALL; skills: string[] };
type SetCategoriesAction = { type: typeof ACTION.SET_CATEGORIES; categories: Categories };
type SearchAction = { type: typeof ACTION.SEARCH; text: string };
type OpenCategoryAction = { type: typeof ACTION.OPEN_CATEGORY; name: string };
type GoBackAction = { type: typeof ACTION.GO_BACK };

export type PickerAction =
  | InitAction
  | ToggleSkillAction
  | ToggleAllAction
  | SetCategoriesAction
  | SearchAction
  | OpenCategoryAction
  | GoBackAction;

/**
 * @description Toggles a single skill in the selection set.
 * @example handleToggleSkill(state, "react") // adds "react" if absent, removes if present
 */
function handleToggleSkill(state: PickerState, skill: string): PickerState {
  const next = new Set(state.selected);
  if (next.has(skill)) {
    next.delete(skill);
  } else {
    next.add(skill);
  }
  return { ...state, selected: next };
}

/**
 * @description Toggles all given skills: selects all if any is unselected, deselects all if all selected.
 * @example handleToggleAll(state, ["react", "vue"]) // selects both if not all selected
 */
function handleToggleAll(state: PickerState, skills: string[]): PickerState {
  const next = new Set(state.selected);
  const allSelected = skills.every((s) => next.has(s));
  const op = allSelected ? "delete" : "add";
  for (const skill of skills) {
    next[op](skill);
  }
  return { ...state, selected: next };
}

/**
 * @description Updates search text. Resets lastCategory in root view so selectedItemId doesn't stick.
 * @example handleSearch(state, "rea") // { ...state, searchText: "rea" }
 */
function handleSearch(state: PickerState, text: string): PickerState {
  return {
    ...state,
    searchText: text,
    navigation:
      state.navigation.view === "root" ? { view: "root", lastCategory: null } : state.navigation,
  };
}

/**
 * @description Returns to root view, restoring saved search text and setting lastCategory for focus.
 * @example handleGoBack(categoryState) // { ...state, navigation: { view: "root", lastCategory: "Frontend" } }
 */
function handleGoBack(state: PickerState): PickerState {
  const nav = state.navigation;
  if (nav.view !== "category") return state;
  return {
    ...state,
    searchText: nav.savedSearchText,
    navigation: { view: "root", lastCategory: nav.name },
  };
}

/**
 * @description Pure reducer for the picker state machine. Dispatches to handler functions per action type.
 * @example pickerReducer(state, { type: ACTION.TOGGLE_SKILL, skill: "react" })
 */
export function pickerReducer(state: PickerState, action: PickerAction): PickerState {
  switch (action.type) {
    case ACTION.INIT:
      return {
        ...state,
        skills: action.skills,
        categories: action.categories,
      };
    case ACTION.TOGGLE_SKILL:
      return handleToggleSkill(state, action.skill);
    case ACTION.TOGGLE_ALL:
      return handleToggleAll(state, action.skills);
    case ACTION.SET_CATEGORIES:
      return { ...state, categories: action.categories };
    case ACTION.SEARCH:
      return handleSearch(state, action.text);
    case ACTION.OPEN_CATEGORY:
      return {
        ...state,
        navigation: { view: "category", name: action.name, savedSearchText: state.searchText },
        searchText: "",
      };
    case ACTION.GO_BACK:
      return handleGoBack(state);
  }
}
