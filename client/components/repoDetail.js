import React, { useState, useEffect } from 'react';
import axios from 'axios';

const RepoDetail = ({ repoName }) => {
    const [details, setDetails] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchDetails = async () => {
            try {
                const response = await axios.get('/graphql', {
                    headers: {
                        Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
                    },
                    params: { repoNames: [repoName] },
                });
                setDetails(response.data.data.getRepositoryDetails);
            } catch (error) {
                setError(error);
                console.error('Error fetching repository details:', error);
            }
        };

        if (repoName) fetchDetails();
    }, [repoName]);

    if (!repoName) return <p>Select a repository to view details.</p>;

    return (
        <div>
            <h2>Repository Details</h2>
            {error && <p>Error: {error.message}</p>}
            {details ? (
                <pre>{JSON.stringify(details, null, 2)}</pre>
            ) : (
                <p>Loading...</p>
            )}
        </div>
    );
};
export default RepoDetail;
