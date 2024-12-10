import React, { useState, useEffect } from 'react';
import { useQuery } from '@apollo/client';
import { GET_REPOSITORY_DETAILS_QUERY } from '../queries';
import './repoDetail.css';
import Loader from './loader';


const RepoDetail = ({ repoName }) => {
    const [details, setDetails] = useState(null);
    const [error, setError] = useState(null);
    
    const { loading, data, error: queryError } = useQuery(GET_REPOSITORY_DETAILS_QUERY, {
        variables: { repoName },
        context: {
            headers: {
                Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
            },
        },
    });

    useEffect(() => {
        if (queryError) {
            setError(queryError);
            console.error("Error fetching repository details:", queryError);
        } else if (data) {
            setDetails(data.getRepositoryDetails);
        }
    }, [data, queryError]);

    if (loading) return <Loader/>

    if (error) {
        return <p className="error">Error: {error.message}</p>;
    }

    const renderWebhooks = (webhooks) => {
        if (!webhooks || webhooks.length === 0) return 'None';

        return (
            <ul className="webhooks-list">
                {webhooks.map((webhook) => (
                    <li key={webhook.id} className="webhook-item">
                        <strong>Name:</strong> {webhook.name || 'Unnamed'} <br />
                        <strong>Active:</strong> {webhook.active ? 'Yes' : 'No'} <br />
                        <strong>Config:</strong>
                        <ul className="webhook-details">
                            <li><strong>URL:</strong> {webhook.config.url || 'N/A'}</li>
                            <li><strong>Content Type:</strong> {webhook.config.content_type || 'N/A'}</li>
                        </ul>
                    </li>
                ))}
            </ul>
        );
    };

    const renderDetails = () => {
        if (!details) return <p>No details available.</p>;
        return (
            <ul>
                <li><strong>Name:</strong> {details.name}</li>
                <li><strong>Size:</strong> {details.size} KB</li>
                <li><strong>Owner:</strong> {details.owner}</li>
                <li><strong>Private:</strong> {details.isPrivate ? 'Yes' : 'No'}</li>
                <li><strong>Number of Files:</strong> {details.numberOfFiles}</li>
                <li><strong>YML Content:</strong> {details.ymlContent || 'No YML'}</li>
                <li>
                    <strong>Webhooks:</strong> {renderWebhooks(details.webhooks)}
                </li>
            </ul>
        );
    };

    return (
        <div className="repo-detail">
            <h2>Repository Details</h2>
            {renderDetails()}
        </div>
    );
};

export default RepoDetail;
