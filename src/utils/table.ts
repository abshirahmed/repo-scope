import Table from 'cli-table3';

export const displayCommitTable = (repoData: { name: string; commits: number; prs: number }[]) => {
    const table = new Table({
        head: ['Repository', 'Commits', 'Pull Requests'],
        colWidths: [40, 10, 15]
    });

    repoData.forEach(repo => {
        table.push([repo.name, repo.commits, repo.prs]);
    });

    console.log(table.toString());
};
