import React, { useState } from 'react';
import RepoList from './components/repoList';
import RepoDetail from './components/repoDetail';
import { ApolloProvider } from '@apollo/client';
import client from './apolloClient';

const App = () => {
    const [selectedRepo, setSelectedRepo] = useState(null);

    return (
        <ApolloProvider client={client}>
        <div>
            <h1>GitHub Repo Viewer</h1>
            <RepoList onRepoSelect={setSelectedRepo} />
            {selectedRepo && <RepoDetail repoName={selectedRepo} />}
        </div>
        </ApolloProvider>
    );
};

export default App;