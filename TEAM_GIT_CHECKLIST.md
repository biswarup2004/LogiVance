# Team Git Checklist

## Branch Strategy
- `main`: release-ready code only.
- `develop`: shared integration branch.
- `frontend/<name-or-task>`: Aditya's feature branches.
- `backend/<name-or-task>`: friend's feature branches.

## One-Time Setup
```powershell
git init
git switch -c develop
git commit --allow-empty -m "chore: initialize develop branch"
git remote add origin <your-repo-url>
git push -u origin develop
```

## Daily Start (Both)
```powershell
git switch develop
git pull origin develop
```

## Aditya Frontend Flow
```powershell
git switch -c frontend/<task-name>
# make changes in frontend/
git add frontend
git commit -m "feat(frontend): <what changed>"
git push -u origin frontend/<task-name>
```

Then open PR:
- Source: `frontend/<task-name>`
- Target: `develop`

## Friend Backend Flow
```powershell
git switch -c backend/<task-name>
# make changes in backend/
git add backend
git commit -m "feat(backend): <what changed>"
git push -u origin backend/<task-name>
```

Then open PR:
- Source: `backend/<task-name>`
- Target: `develop`

## Safety Checks Before Every Commit
```powershell
git branch --show-current
git status
```

- Confirm branch name is correct (`frontend/...` or `backend/...`).
- Confirm staged files are only your area (`frontend/` or `backend/`).

## Integration and Release
- Merge all approved frontend/backend PRs into `develop`.
- Run combined integration and testing from `develop`.
- After final testing passes, merge `develop` into `main`.

## Commit Message Pattern
- `feat(frontend): ...`
- `fix(frontend): ...`
- `feat(backend): ...`
- `fix(backend): ...`
- `chore: ...`
