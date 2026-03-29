import { describe, expect, it } from "vitest";
import { ACTION, type PickerState, initialState, pickerReducer } from "./state";

function stateWith(overrides: Partial<PickerState>): PickerState {
  return { ...initialState, ...overrides };
}

describe("pickerReducer", () => {
  describe("init", () => {
    it("loads skills and categories", () => {
      const result = pickerReducer(initialState, {
        type: ACTION.INIT,
        skills: ["react", "vue"],
        categories: { Frontend: ["react"] },
      });
      expect(result.skills).toEqual(["react", "vue"]);
      expect(result.categories).toEqual({ Frontend: ["react"] });
    });
  });

  describe("toggle-skill", () => {
    it("selects an unselected skill", () => {
      const result = pickerReducer(initialState, { type: ACTION.TOGGLE_SKILL, skill: "react" });
      expect(result.selected.has("react")).toBe(true);
    });

    it("deselects an already selected skill", () => {
      const state = stateWith({ selected: new Set(["react"]) });
      const result = pickerReducer(state, { type: ACTION.TOGGLE_SKILL, skill: "react" });
      expect(result.selected.has("react")).toBe(false);
    });
  });

  describe("toggle-all", () => {
    it("selects all skills in a folder", () => {
      const result = pickerReducer(initialState, {
        type: ACTION.TOGGLE_ALL,
        skills: ["react", "vue", "tailwind"],
      });
      expect(result.selected).toEqual(new Set(["react", "vue", "tailwind"]));
    });

    it("deselects all if all already selected", () => {
      const state = stateWith({ selected: new Set(["react", "vue"]) });
      const result = pickerReducer(state, { type: ACTION.TOGGLE_ALL, skills: ["react", "vue"] });
      expect(result.selected.size).toBe(0);
    });

    it("selection persists across folders", () => {
      const state = stateWith({ selected: new Set(["react"]) });
      const result = pickerReducer(state, {
        type: ACTION.TOGGLE_ALL,
        skills: ["database", "drizzle"],
      });
      expect(result.selected).toEqual(new Set(["react", "database", "drizzle"]));
    });
  });

  describe("open-category", () => {
    it("enters a folder and clears searchText", () => {
      const state = stateWith({ searchText: "rea" });
      const result = pickerReducer(state, { type: ACTION.OPEN_CATEGORY, name: "Frontend" });
      expect(result.navigation).toEqual({
        view: "category",
        name: "Frontend",
        savedSearchText: "rea",
      });
      expect(result.searchText).toBe("");
    });

    it("saves searchText before entering", () => {
      const state = stateWith({ searchText: "query" });
      const result = pickerReducer(state, { type: ACTION.OPEN_CATEGORY, name: "Backend" });
      expect(result.navigation).toMatchObject({ savedSearchText: "query" });
    });
  });

  describe("go-back", () => {
    it("restores saved searchText", () => {
      const state = stateWith({
        searchText: "inside",
        navigation: { view: "category", name: "Frontend", savedSearchText: "original" },
      });
      const result = pickerReducer(state, { type: ACTION.GO_BACK });
      expect(result.searchText).toBe("original");
    });

    it("sets lastCategory to restore focus", () => {
      const state = stateWith({
        navigation: { view: "category", name: "Frontend", savedSearchText: "" },
      });
      const result = pickerReducer(state, { type: ACTION.GO_BACK });
      expect(result.navigation).toEqual({ view: "root", lastCategory: "Frontend" });
    });

    it("no-op if already in root view", () => {
      const state = stateWith({ navigation: { view: "root", lastCategory: null } });
      const result = pickerReducer(state, { type: ACTION.GO_BACK });
      expect(result).toBe(state);
    });
  });

  describe("search", () => {
    it("resets lastCategory in root view", () => {
      const state = stateWith({ navigation: { view: "root", lastCategory: "Frontend" } });
      const result = pickerReducer(state, { type: ACTION.SEARCH, text: "re" });
      expect(result.searchText).toBe("re");
      expect(result.navigation).toEqual({ view: "root", lastCategory: null });
    });

    it("preserves navigation in category view", () => {
      const nav = { view: "category" as const, name: "Frontend", savedSearchText: "old" };
      const state = stateWith({ navigation: nav });
      const result = pickerReducer(state, { type: ACTION.SEARCH, text: "rea" });
      expect(result.searchText).toBe("rea");
      expect(result.navigation).toEqual(nav);
    });
  });

  describe("set-categories", () => {
    it("updates categories", () => {
      const next = { Dev: ["react"], Ops: ["docker"] };
      const result = pickerReducer(initialState, { type: ACTION.SET_CATEGORIES, categories: next });
      expect(result.categories).toEqual(next);
    });
  });
});
