import React from 'react';

import LoadingIndicator from './LoadingIndicator';

import './SplashScreen.css';

export default function SplashScreen({ username }) {
    return <div className="SplashScreen">
        <div className="username">
            <div>@{ username }</div>
            <LoadingIndicator />
        </div>
    </div>;
}
