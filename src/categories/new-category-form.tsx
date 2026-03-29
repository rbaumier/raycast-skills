/** Form to create a new category and assign a skill to it. */
import { Action, ActionPanel, Form, useNavigation } from "@raycast/api";
import { type Categories, saveCategories } from "../data/data";

type NewCategoryFormProps = {
  skill: string;
  categories: Categories;
  onDone: (categories: Categories) => void;
};

export function NewCategoryForm({ skill, categories, onDone }: NewCategoryFormProps) {
  const { pop } = useNavigation();
  return (
    <Form
      actions={
        <ActionPanel>
          <Action.SubmitForm
            title="Create Category"
            onSubmit={(values: { name: string }) => {
              const name = values.name.trim();
              if (!name) { pop(); return; }
              const next = { ...categories };
              const list = next[name] ?? [];
              if (!list.includes(skill)) {
                next[name] = [...list, skill];
              }
              saveCategories(next);
              onDone(next);
              pop();
            }}
          />
        </ActionPanel>
      }
    >
      <Form.TextField id="name" title="Category Name" />
    </Form>
  );
}
