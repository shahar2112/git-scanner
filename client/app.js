import React, { useState } from 'react';
import RepoList from './components/repoList';
import RepoDetail from './components/repoDetail';

const App = () => {
    const [selectedRepo, setSelectedRepo] = useState(null);

    return (
        <div>
            <h1>GitHub Repo Viewer</h1>
            <RepoList onRepoSelect={setSelectedRepo} />
            {selectedRepo && <RepoDetail repoName={selectedRepo} />}
        </div>
    );
};

export default App;
