import React from 'react';

import './Footer.css';

export default function Footer() {
    return <footer className="Footer">
        <div>by</div>
        <div>@jordanszalontai</div>
        <div>{ new Date().getFullYear() }</div>
    </footer>;
}
