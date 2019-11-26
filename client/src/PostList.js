import React, { useState, useEffect } from 'react';
import './PostList.css';

export default function PostList({ username, hashtags = [] }) {
    const [groups, setGroups] = useState({});

    useEffect(() => {
        async function fetchGroups() {
            const hashtagList = hashtags.map(tag => tag.substring(1)).join(',');
            if (hashtagList.length > 0) {
                const response = await fetch(`/api/ig/${username}/1?pageSize=10&hashtags=${hashtagList}&grouped`);
                const json = await response.json();

                setGroups(json.groups);
            }
        }
        fetchGroups();
    }, [hashtags]);

    useEffect(() => window.instgrm && window.instgrm.Embeds.process(), [groups]);

    const activeHashtags = Object.keys(groups)
        .filter(key => key !== 'nohashtag' && groups[key].length > 0);

    const soonHashtags = Object.keys(groups)
        .filter(key => key !== 'nohashtag' && groups[key].length === 0)
        .reduce((a, b) => a.concat(b), []);

    return (
        <div className="PostList">
            <h1><div>•</div><div>Hashtags</div></h1>
            <ul>
                {activeHashtags.map((key, index) => {
                    return <li key={`group-${index}`}>
                        <h2>{key}</h2>
                        <div className="posts">
                            {groups[key].map((post, i) => {
                                return <div key={`post-${index}-${i}`} dangerouslySetInnerHTML={{ __html: post.template }}></div>;
                            })}
                        </div>
                    </li>;
                })}
                <li className="soon">
                    <h2>➡️ Soon</h2>
                    <div className="soon-tags">
                        {soonHashtags.map((tag, index) => {
                            return <div key={`soon-${index}`} className="soon-tag">{tag}</div>;
                        })}
                    </div>
                </li>
            </ul>
        </div>
    );
}
