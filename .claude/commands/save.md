# Trigger in Claude Code: /save
# Project: Correspondence (Root #23)
# Created: 21 July 2026

---

You are executing the **SAVE PROTOCOL** for the Correspondence project.
Run all steps in sequence. Report completion after each.

---

## STEP 1 -- SAVE TO DISK

1a. Write all pending file changes to disk. List every file with full path.
1b. Update CLAUDE.md if any of these changed:
    - File structure, stack, or provider integration status
    - Completed features (mark with date)
    - New outstanding tasks
1c. Show diff before saving CLAUDE.md.
1d. Confirm: "Step 1 complete. [N] files saved."

---

## STEP 2 -- GIT COMMIT AND PUSH

2a. Stage changed files (no .env or secrets):
    ```
    cd C:\Users\Lenovo\workspace-hub
    git add -A
    ```
2b. Commit with format: [YYYY-MM-DD] [Brief description]
2c. Push: git push origin main
2d. If push fails: report error, do not retry silently.
2e. Confirm: "Step 2 complete. Commit: [hash]."

---

## STEP 3 -- GIT STATUS

3a. Run git status and git log --oneline -5
3b. Report untracked/modified files, working tree clean status.
3c. Confirm: "Step 3 complete. Clean: [Yes/No]."

---

## STEP 4 -- OUTSTANDING ITEMS

4a. List incomplete tasks, flags, blockers from this session.
4b. Priority order: [BLOCKER] | [HIGH] | [MEDIUM] | [LOW]
4c. Confirm: "Step 4 complete. [N] items."

---

## STEP 5 -- NOTIFY VITALMATRIX

5a. Add a comment to VitalMatrix Command Hub (326c2e2d-3782-8163-90ef-ede29d72cb3c)
    summarising what was done in this correspondence session.
5b. Format: "Correspondence session [date]: [summary]"
5c. Confirm: "Step 5 complete. Notion updated."

---

## STEP 6 -- RESUME PROMPT

Generate a code block to paste at the start of the next session.
Include: what was done, files modified, outstanding items, next first task.
Label: "PASTE THIS AT START OF NEXT SESSION"

---

## SAVE PROTOCOL COMPLETE

"SAVE COMPLETE
Step 1 -- Disk: [DONE / issue]
Step 2 -- Git: [DONE / issue]
Step 3 -- Status: [CLEAN / untracked]
Step 4 -- Outstanding: [N items]
Step 5 -- Notion: [DONE / issue]
Step 6 -- Resume: [GENERATED]"
