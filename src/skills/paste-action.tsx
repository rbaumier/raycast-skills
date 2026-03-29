/** Reusable paste action — pastes N selected skills via ⌘+Enter. */
import { Action, Icon } from "@raycast/api";

type PasteActionProps = {
  count: number;
  onPaste: () => Promise<void>;
};

export function PasteAction({ count, onPaste }: PasteActionProps) {
  return (
    <Action
      title={`Paste ${count} Skill${count !== 1 ? "s" : ""}`}
      icon={Icon.Clipboard}
      shortcut={{ modifiers: ["cmd"], key: "return" }}
      onAction={onPaste}
    />
  );
}
