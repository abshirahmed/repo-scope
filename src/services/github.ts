import axios from 'axios';
import { GITHUB_TOKEN } from '../config/environment';

const githubApiUrl = 'https://api.github.com';
const headers = {
    Authorization: `token ${GITHUB_TOKEN}`,
    'Content-Type': 'application/json'
};

export const getRepositories = async (org: string) => {
    const reposUrl = `${githubApiUrl}/orgs/${org}/repos?per_page=100`;
    try {
        const response = await axios.get(reposUrl, { headers });
        return response.data;
    } catch (error) {
        console.error('Error fetching repositories:', error);
        return [];
    }
};
