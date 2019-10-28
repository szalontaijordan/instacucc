import React from 'react';

import Header from './Header';
import PostList from './PostList';

import './App.css';

export default function App({ username = 'iringodesign' }) {
    return (
        <div className="App">
            <Header username={username} />
            <PostList username={username} />
        </div>
    );
}
