import React from 'react';
import emojiStrip from 'emoji-strip';

import './Header.css';

export default function Header({ profile = null, nameSeparator = '•' }) {
  const titleFrom = profile => {
    const parts = profile.full_name.split(nameSeparator).map(part => emojiStrip(part));
    parts.splice(parts.length / 1 - 1, 0, nameSeparator);

    return parts;
  }

  return (
    <header className="Header">
      <div className="center">
        <div className="avatar">
          {profile && <img src={profile.profile_pic_url} alt={profile ? profile.username : 'user'} />}
        </div>
        <h1>
          {profile ? titleFrom(profile).map((part, index) => <span key={index}>{part}</span>) : '...'}
        </h1>
        <div className="bio">
          { profile ? profile.biography.split('\n').map((part, i) => <p key={i}>{part}</p>) : ' ... ' }
        </div>
      </div>
    </header>
  );
}