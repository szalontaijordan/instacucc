import React, { useState, useEffect, Fragment } from 'react';

import Header from './Header';
import PostList from './PostList';
import SplashScreen from './SplashScreen';
import Footer from './Footer';

import './App.css';

export default function App({ username = 'iringodesign' }) {
    const [profile, setProfile] = useState(null);
    const [hashtags, setHashtags] = useState([]);

    useEffect(() => {
        async function fetchProfile() {
            const response = await fetch(`/api/ig/${username}/profile`);
            const json = await response.json();

            setProfile(json);
            setHashtags(json.biography.match(/(#[a-zA-Záéúőóüö_0-9]+\b)(?!;)/gm) || [])
        }

        fetchProfile();
    }, []);

    return (
        <div className="App">
            {!profile
                ? <SplashScreen username={username} />
                : <Fragment>
                    <Header username={username} profile={profile} />
                    <PostList username={username} hashtags={hashtags} />
                    <Footer />
                </Fragment>
            }
        </div>
    );
}
