import { Action, ActionPanel, Form, useNavigation } from "@raycast/api";
import { type Categories, saveCategories } from "../data/data";

type RenameCategoryFormProps = {
  currentName: string;
  categories: Categories;
  onDone: (categories: Categories) => void;
};

/** @description Form to rename a category. Rejects if target name already exists. */
export function RenameCategoryForm({ currentName, categories, onDone }: RenameCategoryFormProps) {
  const { pop } = useNavigation();
  return (
    <Form
      actions={
        <ActionPanel>
          <Action.SubmitForm
            title="Rename"
            onSubmit={(values: { name: string }) => {
              const name = values.name.trim();
              if (!name || name === currentName) {
                pop();
                return;
              }
              if (name in categories) {
                pop();
                return;
              }
              const next = { ...categories };
              next[name] = next[currentName];
              delete next[currentName];
              saveCategories(next);
              onDone(next);
              pop();
            }}
          />
        </ActionPanel>
      }
    >
      <Form.TextField id="name" title="Category Name" defaultValue={currentName} />
    </Form>
  );
}
