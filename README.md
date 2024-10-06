# Repo Scope

## Overview

Repo Scope is an interactive CLI tool designed to help users explore GitHub repositories for a specified organisation and user. It provides insightful summaries, including the number of commits and pull requests, and visualises data using an interactive terminal-based dashboard.

## Features

- View the top 10 repositories by commit count.
- View a summary of all repositories, including total commits and pull requests.
- Visualise data using an interactive bar chart in the terminal.
- Provide user-friendly prompts to gather GitHub organisation and user information.

## Prerequisites

- **Node.js**: Version 14 or higher.
- **NPM**: Version 6 or higher.
- **GitHub Personal Access Token**: Required for interacting with the GitHub API.

## Installation

1. Clone the repository:
2. Navigate to the project directory:
3. Install the dependencies:

## Setting Up Environment Variables

1. Create a `.env` file in the root of your project:
2. Add the following to your `.env` file:

   Replace `your_github_token_here` with your actual GitHub personal access token. Make sure the token has appropriate permissions to access the repositories.

## Usage

1. Run the CLI tool:
2. Follow the prompts:
   - Enter the GitHub organisation name.
   - Enter the GitHub username.
3. Select an action from the menu:
   - **View Top 10 Repositories by Commit Count**: Displays a bar chart of the top 10 repositories by commit count.
   - **View Commit and PR Summary for All Repositories**: Displays a summary table of all repositories, including commit and pull request counts.
   - **Exit**: Exit the tool.

## Scripts

- **start**: Run the CLI tool interactively.
- **lint**: Run ESLint to check for linting issues.
- **lint\:fix**: Run ESLint to automatically fix fixable issues.

## Development Setup

1. Install development dependencies:
2. Set up Git hooks using Husky:
3. The project uses Prettier for code formatting, ESLint for linting, and Husky for pre-commit checks.

## Technologies Used

- **TypeScript**: For type-safe JavaScript.
- **Node.js**: JavaScript runtime environment.
- **Inquirer.js**: Provides interactive prompts for user input.
- **Blessed and Blessed-Contrib**: For creating interactive terminal-based UIs.
- **Chalk**: For colourising terminal output.
- **Axios**: For making HTTP requests to the GitHub API.
- **Ora**: For spinners indicating progress.

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository.
2. Create a new branch (`git checkout -b feature-branch`).
3. Make your changes and commit them (`git commit -m 'Add new feature'`).
4. Push to the branch (`git push origin feature-branch`).
5. Open a Pull Request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Troubleshooting

- **Error: Please ensure you have set the GITHUB\_TOKEN in your .env file**
   - Ensure you have created a `.env` file in the root directory and added your GitHub personal access token.

## Contact

For questions or support, please open an issue in this repository.

