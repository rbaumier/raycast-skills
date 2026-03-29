# Claude Skills Picker

A Raycast extension to browse, organize, and paste [Claude Code](https://docs.anthropic.com/en/docs/claude-code) skills as a comma-separated list into any app.

## The Problem

Claude Code skills live as folders in `~/.claude/skills/`. When you have 50+ skills, remembering their exact names and typing `skill:react, skill:tailwind, skill:coding-standards` by hand is tedious and error-prone.

## The Solution

Open Raycast, search skills visually, select what you need, paste. Done.

```
skill:react, skill:tailwind, skill:coding-standards
```

## Features

### Folder Navigation

Organize skills into custom categories. A skill can belong to multiple categories.

| Action | Shortcut | Description |
|--------|----------|-------------|
| Select/Deselect all in folder | `Enter` | Toggle all skills in a category |
| Open folder | `->` | Drill into a category |
| Go back | `<-` | Return to root (focus restored) |

### Skill Selection

Pick skills across folders. Selection persists as you navigate.

| Action | Shortcut | Description |
|--------|----------|-------------|
| Select/Deselect skill | `Enter` | Toggle individual skill |
| Paste selected | `Cmd + Enter` | Paste all selected as `skill:x, skill:y` |

### Category Management

| Action | Shortcut | Description |
|--------|----------|-------------|
| Edit categories | `Cmd + E` | Add/remove skill from categories |
| New category | `Cmd + N` | Create a new category (inside Edit Categories) |
| Rename category | `Cmd + R` | Rename an existing category |
| Delete category | `Cmd + D` | Remove a category (skills are not deleted) |

## Setup

```bash
git clone <repo-url> && cd raycast-skills
npm install
```

Import into Raycast:

```
open raycast://extensions/import?path=$(pwd)
```

## How Categories Work

Categories are stored in `~/.claude/skills/.categories.json`:

```json
{
  "Frontend - React": ["react", "tailwind", "shadcn", "ui-ux"],
  "Backend": ["database", "drizzle-orm", "security-defensive"],
  "Testing": ["testing", "e2e", "tdd"]
}
```

- A skill can appear in multiple categories
- Skills not in any category appear under "Uncategorized"
- Deleting a category does not delete the skills themselves
- The file is human-editable

## Stack

- [Raycast API](https://developers.raycast.com/) v1.93+
- React, TypeScript
- No external dependencies beyond Raycast SDK
