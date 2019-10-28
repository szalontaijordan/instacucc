import React, { useState, useEffect } from 'react';

import './Header.css';

export default function Header({ username }) {
    const [avatar, setAvatar] = useState('');

    useEffect(() => {
      async function fetchAvatar() {
        const response = await fetch(`/api/ig/${username}/avatar`);
        const json = await response.json();
  
        setAvatar(json.avatar);
      }
  
      fetchAvatar();
    }, []);
  
    return (
        <header className="Header">
            <div className="center">
            <div className="avatar">
                { avatar && <img src={avatar} alt={username} /> }
            </div>
            <h1>Iringó Design</h1>
            <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce in dictum sem. Nunc ac fermentum libero, et eleifend purus. Curabitur mattis aliquet massa, non consectetur mi vehicula eu.</p>
            </div>
        </header>
    );  
}