import React, { useState, useEffect } from 'react';

export default function PostList({ username }) {
    const [groups, setGroups] = useState({ groups: {} });

    useEffect(() => {
        async function fetchGroups() {
            const response = await fetch(`/api/ig/${username}/1?pageSize=10&hashtags=hungarian,illustration&grouped`);
            const json = await response.json();

            setGroups(json.groups);
        }
        fetchGroups();
    }, []);

    return (
        <div className="PostList">
            <ul>
            { Object.keys(groups).filter(key => groups[key].length > 0).map((key, index) => {
                return <li key={`group-${index}`}>
                    <h2>{key}</h2>
                    <div className="posts">
                        { groups[key].map((post, i) => {
                            return <div key={`post-${index}-${i}`} dangerouslySetInnerHTML={ { __html: post.template }}></div>;
                        })}
                    </div>
                </li>;
            })}
            </ul>
        </div>
    );
}
