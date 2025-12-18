# Contributing Guidelines

## Setup Development Environment

```bash
# Clone the repository
git clone https://github.com/deltaindo/picnew.git
cd picnew

# Install dependencies
cd backend && npm install && cd ..
cd frontend && npm install && cd ..

# Setup environment variables
cp .env.example .env
```

## Branching Strategy

- `main` - Production ready code
- `develop` - Development branch
- `feature/*` - Feature branches
- `bugfix/*` - Bug fix branches

## Commit Messages

```
feat: add new feature
fix: fix bug
docs: documentation changes
style: code style changes
refactor: refactor code
test: add tests
chore: maintenance
```

## Pull Request Process

1. Create feature branch from develop
2. Make changes and commit
3. Push to remote
4. Create pull request
5. Wait for review and approval
6. Merge to develop
7. When ready, merge develop to main
