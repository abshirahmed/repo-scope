import axios, { isAxiosError } from 'axios';
import { GITHUB_TOKEN } from '../config/environment';

const githubApiUrl = 'https://api.github.com';
const headers = {
  Authorization: `token ${GITHUB_TOKEN}`,
  'Content-Type': 'application/json',
};

export const getCommitCount = async (
  org: string,
  username: string,
  repoName: string,
) => {
  let page = 1;
  let totalCommits = 0;
  const perPage = 100; // Maximum allowed per page by the API
  let hasMoreCommits = true;

  while (hasMoreCommits) {
    const commitsUrl = `${githubApiUrl}/repos/${org}/${repoName}/commits?author=${username}&per_page=${perPage}&page=${page}`;
    try {
      const response = await axios.get(commitsUrl, { headers });
      const commits = response.data;

      if (commits.length === 0) {
        hasMoreCommits = false; // No more commits to fetch, exit loop
      } else {
        totalCommits += commits.length;
        page++; // Move to the next page
      }
    } catch (error) {
      // Handle 409 error specifically when the repository is empty
      if (
        isAxiosError(error) &&
        error.response &&
        error.response.status === 409 &&
        error.response.data.message === 'Git Repository is empty.'
      ) {
        console.log(`Repository ${repoName} is empty, skipping...`);
        return 0; // Return 0 for empty repositories
      } else {
        console.error(
          `Error fetching commits for repository ${repoName} on page ${page}`,
          error,
        );
      }
      break; // Exit the loop in case of other errors
    }
  }

  return totalCommits;
};
