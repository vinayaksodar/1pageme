# Contributing to 1PageMe

First off, thank you for considering contributing to 1PageMe! It's people like you that make it such a great tool.

## How Can I Contribute?

### Reporting Bugs

- **Check the existing issues** to see if the bug has already been reported.
- If not, **open a new issue**. Provide a clear title and description, as much relevant information as possible, and a code sample or an executable test case demonstrating the expected behavior that is not occurring.

### Suggesting Enhancements

- **Open a new issue** with the tag "enhancement".
- Describe the feature you'd like to see and why it would be useful.

### Pull Requests

1. Fork the repository and create your branch from `main`.
2. If you've added code that should be tested, add tests.
3. If you've changed APIs, update the documentation.
4. Ensure the test suite passes (`npm run typecheck` and `npm run lint`).
5. Make sure your code lints and follows the project's coding style (`npm run format`).
6. Issue that pull request!

## Style Guide

### Git Commit Messages

- Use the present tense ("Add feature" not "Added feature")
- Use the imperative mood ("Move cursor to..." not "Moves cursor to...")
- Limit the first line to 72 characters or less
- Reference issues and pull requests liberally after the first line
- We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification.

### Coding Style

- We use [Prettier](https://prettier.io/) for code formatting.
- We use [ESLint](https://eslint.org/) for linting.
- Follow the existing architectural patterns (Zustand for state, structured blocks for rich text, Tailwind for styling).

## Community

- Participation in this project is governed by the [Code of Conduct](CODE_OF_CONDUCT.md).

Happy coding!
