import { getRepositories } from './services/github';
import { getCommitCount } from './services/commitService';
import { getPullRequestCount } from './services/pullRequestService';
import blessed from 'blessed';
import contrib from 'blessed-contrib';
import inquirer from 'inquirer';
import ora from 'ora';
import chalk from 'chalk';

let githubOrg: string;
let githubUsername: string;

const fetchRepoData = async (
  repoName: string,
  org: string,
  username: string,
) => {
  const repoSpinner = ora(
    chalk.blue(`Processing repository: ${repoName}`),
  ).start();
  try {
    const commitCount = await getCommitCount(org, username, repoName);
    const prCount = await getPullRequestCount(org, username, repoName);

    if (commitCount === 0 && prCount === 0) {
      repoSpinner.info(
        chalk.yellow(`➖ Skipped repository ${repoName} (no commits or PRs)`),
      );
      return null;
    }

    repoSpinner.succeed(
      chalk.green(`Fetched commit and PR data for ${repoName}`),
    );
    return { name: repoName, commits: commitCount, prs: prCount };
  } catch (error) {
    if (error instanceof Error) {
      repoSpinner.fail(
        chalk.red(
          `⚠️ Failed to fetch data for repository: ${repoName}. Error: ${error.message}`,
        ),
      );
    } else {
      repoSpinner.fail(
        chalk.red(
          `⚠️ Failed to fetch data for repository: ${repoName}. Unknown error occurred.`,
        ),
      );
    }
    return null;
  }
};

// Define displaySummary
const displaySummary = (
  repoData: { name: string; commits: number; prs: number }[],
  totalCommits: number,
  totalPRs: number,
) => {
  console.log(chalk.green('\nSummary of All Repositories:'));
  console.table(
    repoData.map((repo) => ({
      Repository: repo.name,
      'Number of Commits': repo.commits,
      'Number of PRs': repo.prs,
    })),
  );

  console.log(chalk.blue('\nTotal Summary:'));
  console.log(
    chalk.green(`Total Commits Across All Repositories: ${totalCommits}`),
  );
  console.log(
    chalk.green(`Total Pull Requests Across All Repositories: ${totalPRs}`),
  );
};

const countCommitsAndPRs = async () => {
  const spinner = ora(chalk.blue('Fetching repository information...')).start();
  const repositories = await getRepositories(githubOrg);
  if (repositories.length === 0) {
    spinner.fail(chalk.red('No repositories found or an error occurred.'));
    return;
  }
  spinner.succeed(chalk.green('Fetched repository information successfully.'));

  console.log(
    chalk.cyan(
      `Processing ${repositories.length} repositories concurrently...`,
    ),
  );

  // Use Promise.all to fetch commit and PR data for all repositories concurrently
  const repoPromises = repositories.map((repo: any) =>
    fetchRepoData(repo.name, githubOrg, githubUsername),
  );
  const repoDataResults = await Promise.all(repoPromises);

  // Filter out any failed or skipped repositories
  const repoData = repoDataResults.filter((data) => data !== null) as {
    name: string;
    commits: number;
    prs: number;
  }[];

  const totalCommits = repoData.reduce((acc, repo) => acc + repo.commits, 0);
  const totalPRs = repoData.reduce((acc, repo) => acc + repo.prs, 0);

  console.log(chalk.green('All repository data fetched successfully.'));

  // Sort repositories by commit count (descending)
  repoData.sort((a, b) => b.commits - a.commits);

  // Prepare data for bar chart (show the top 10 repos by commits)
  const top10Repos = repoData.slice(0, 10);
  const truncatedRepoNames = top10Repos.map((repo) =>
    repo.name.length > 10 ? repo.name.substring(0, 10) + '...' : repo.name,
  );
  const commitCounts = top10Repos.map((repo) => repo.commits);

  // Create a terminal dashboard
  const screen = blessed.screen();
  const grid = new contrib.grid({ rows: 12, cols: 12, screen: screen });

  // Create a bar chart for top 10 repositories by commit count
  const bar = grid.set(0, 0, 8, 12, contrib.bar, {
    label: 'Top 10 Repositories by Commit Count',
    barWidth: 6,
    barSpacing: 4,
    xOffset: 2,
    maxHeight: Math.max(...commitCounts) + 10,
  });

  bar.setData({
    titles: truncatedRepoNames,
    data: commitCounts,
  });

  // Add total count box
  const totalBox = grid.set(8, 0, 3, 12, contrib.log, {
    label: 'Total Summary',
    fg: 'green',
  });

  totalBox.log(
    chalk.green(`Total Commits Across All Repositories: ${totalCommits}`),
  );
  totalBox.log(
    chalk.green(`Total Pull Requests Across All Repositories: ${totalPRs}`),
  );

  // Add a legend for full repository names
  const legendBox = grid.set(11, 0, 1, 12, contrib.log, {
    label: 'Legend (Full Repository Names)',
    fg: 'cyan',
  });

  top10Repos.forEach((repo, index) => {
    legendBox.log(chalk.cyan(`${truncatedRepoNames[index]} -> ${repo.name}`));
  });

  // Allow the user to quit the dashboard
  screen.key(['escape', 'q', 'C-c'], () => {
    return process.exit(0);
  });

  screen.render();
};

const main = async () => {
  console.log(
    chalk.magenta(
      'Welcome to Repo-Scope! A CLI tool to explore GitHub repositories, commits, and pull requests.',
    ),
  );

  let shouldContinue = true;

  try {
    do {
      const orgAndUser = await inquirer.prompt([
        {
          type: 'input',
          name: 'org',
          message:
            'Enter the GitHub organisation name (leave blank to reuse previous value):',
          default: githubOrg || '',
          validate: (input) =>
            input.trim() !== '' ||
            !!githubOrg ||
            'Organisation name cannot be empty.',
        },
        {
          type: 'input',
          name: 'username',
          message:
            'Enter the GitHub username (leave blank to reuse previous value):',
          default: githubUsername || '',
          validate: (input) =>
            input.trim() !== '' ||
            !!githubUsername ||
            'Username cannot be empty.',
        },
      ]);

      githubOrg = orgAndUser.org.trim() || githubOrg;
      githubUsername = orgAndUser.username.trim() || githubUsername;

      // Prompt user for actions
      const answers = await inquirer.prompt([
        {
          type: 'list',
          name: 'action',
          message: 'What would you like to do?',
          choices: [
            'View Top 10 Repositories by Commit Count',
            'View Commit and PR Summary for All Repositories',
            'Exit',
          ],
        },
      ]);

      switch (answers.action) {
        case 'View Top 10 Repositories by Commit Count':
          await countCommitsAndPRs(); // Show visual dashboard
          break;

        case 'View Commit and PR Summary for All Repositories': {
          const spinner = ora(
            chalk.blue('Fetching repository information...'),
          ).start();
          const repositories = await getRepositories(githubOrg);
          if (repositories.length === 0) {
            spinner.fail(
              chalk.red('No repositories found or an error occurred.'),
            );
            break;
          }
          spinner.succeed(
            chalk.green('Fetched repository information successfully.'),
          );

          console.log(
            chalk.cyan(
              `Processing ${repositories.length} repositories concurrently...`,
            ),
          );

          const repoPromises = repositories.map((repo: any) =>
            fetchRepoData(repo.name, githubOrg, githubUsername),
          );
          const repoDataResults = await Promise.all(repoPromises);

          // Filter out any failed or skipped repositories
          const repoData = repoDataResults.filter((data) => data !== null) as {
            name: string;
            commits: number;
            prs: number;
          }[];

          const totalCommits = repoData.reduce(
            (acc, repo) => acc + repo.commits,
            0,
          );
          const totalPRs = repoData.reduce((acc, repo) => acc + repo.prs, 0);

          displaySummary(repoData, totalCommits, totalPRs); // Show summary in table format
          break;
        }

        case 'Exit':
          console.log(chalk.green('Goodbye!'));
          shouldContinue = false;
          break;
      }

      if (shouldContinue) {
        console.log(chalk.magenta('\nReturning to the main menu...\n'));
      }
    } while (shouldContinue);
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes('User force closed')) {
        console.log(chalk.yellow('\nUser exited the prompt. Goodbye!'));
      } else {
        console.error(
          chalk.red('An unexpected error occurred:'),
          error.message,
        );
      }
    } else {
      console.error(chalk.red('An unexpected unknown error occurred.'));
    }
  }
};

// Handle graceful shutdown on Ctrl+C or any interruption
process.on('SIGINT', () => {
  console.log(chalk.yellow('\nGracefully shutting down. Goodbye!'));
  process.exit(0);
});

// Run the CLI tool
main();
