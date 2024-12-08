import React, { useState, useEffect } from 'react';
import axios from 'axios';

const RepoList = ({ onRepoSelect }) => {
    const [repos, setRepos] = useState([]);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchRepos = async () => {
            try {
                const response = await axios.get('/graphql', {
                    headers: {
                        Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
                    },
                });
                setRepos(response.data.data.listRepositories);
            } catch (error) {
                setError(error);
                console.error('Error fetching repositories:', error);
            }
        };

        fetchRepos();
    }, []);

    return (
        <div>
            <h2>Repositories</h2>
            {error && <p>Error: {error.message}</p>}
            <ul>
                {repos.map(repo => (
                    <li key={repo.id} onClick={() => onRepoSelect(repo.name)}>
                        {repo.name}
                    </li>
                ))}
            </ul>
        </div>
    );
};
export default RepoList;
