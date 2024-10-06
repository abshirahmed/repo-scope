import axios from 'axios';
import { GITHUB_TOKEN } from '../config/environment';

const githubApiUrl = 'https://api.github.com';
const headers = {
  Authorization: `token ${GITHUB_TOKEN}`,
  'Content-Type': 'application/json',
};

export const getPullRequestCount = async (
  org: string,
  username: string,
  repoName: string,
) => {
  let page = 1;
  let totalPRs = 0;
  const perPage = 100; // Maximum allowed per page by the API
  let hasMorePRs = true;

  while (hasMorePRs) {
    const prsUrl = `${githubApiUrl}/repos/${org}/${repoName}/pulls?state=all&creator=${username}&per_page=${perPage}&page=${page}`;
    try {
      const response = await axios.get(prsUrl, { headers });
      const pullRequests = response.data;

      if (pullRequests.length === 0) {
        hasMorePRs = false; // No more PRs to fetch, exit loop
      } else {
        totalPRs += pullRequests.length;
        page++; // Move to the next page
      }
    } catch (error) {
      console.error(
        `Error fetching PRs for repository ${repoName} on page ${page}`,
        error,
      );
      break; // Exit the loop in case of errors
    }
  }

  return totalPRs;
};
