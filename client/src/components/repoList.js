import React, { useState, useEffect } from "react";
import { useQuery } from "@apollo/client";
import { LIST_REPOSITORIES_QUERY } from "../queries";
import RepoDetail from "./repoDetail";
import './repoList.css';
import Loader from "./loader";

const RepoList = () => {
    const [repos, setRepos] = useState([]);
    const [expandedRepos, setExpandedRepos] = useState(new Set());
    const [error, setError] = useState(null);

    const { loading, error: queryError, data } = useQuery(LIST_REPOSITORIES_QUERY, {
        context: {
            headers: {
                Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
            },
        },
    });

    useEffect(() => {
        if (queryError) {
            console.error("Error fetching repositories:", queryError);
            setError(queryError.message);
        } else if (data) {
            setRepos(data.listRepositories);
        }
    }, [data, queryError]);

    const handleToggle = (repoName) => {
        setExpandedRepos((prevExpandedRepos) => {
            const newExpandedRepos = new Set(prevExpandedRepos);
            if (newExpandedRepos.has(repoName)) {
                newExpandedRepos.delete(repoName);
            } else {
                newExpandedRepos.add(repoName);
            }
            return newExpandedRepos;
        });
    };

    const renderTableHeaders = () => (
        <thead>
            <tr>
                <th>Repository Name</th>
                <th>Owner</th>
                <th>Size</th>
            </tr>
        </thead>
    );

    const renderRepoRow = (repo) => {
        const isExpanded = expandedRepos.has(repo.name);
        return (
            <React.Fragment key={repo.name}>
                <tr 
                    className={`repo-row ${isExpanded ? 'expanded' : ''}`} 
                    onClick={() => handleToggle(repo.name)}
                >
                    <td>{repo.name}</td>
                    <td>{repo.owner}</td>
                    <td>{repo.size}</td>
                </tr>
                {isExpanded && (
                    <tr className="repo-detail-row expanded">
                        <td colSpan="3">
                            <RepoDetail repoName={repo.name} />
                        </td>
                    </tr>
                )}
            </React.Fragment>
        );
    };

    if (loading) return <Loader/>

    return (
        <div className="repo-list-container">
            {error && <p className="error">Error: {error}</p>}
            {repos.length > 0 && (
                <table className="repo-table">
                    {renderTableHeaders()}
                    <tbody>{repos.map(renderRepoRow)}</tbody>
                </table>
            )}
        </div>
    );
};

export default RepoList;