import React from 'react';

import bioImg from '../assets/dora.jpg';
import './About.css';

export default function About() {
    return <div className="About">
        <div className="image">
            <img src={bioImg} alt="Kiss Dóra" />
        </div>
        <div className="text">
           <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin imperdiet eros a consectetur finibus. Vestibulum vel tincidunt mi, in</p>
           <p>Viverra augue. Vestibulum pellentesque lacinia quam quis finibus. Duis volutpat lobortis leo id pretium. In at erat ligula. Nunc tortor diam, venenatis id lacus a, imperdiet iaculis enim. Integer nisi lorem, auctor eget euismod quis, fringilla pulvinar felis. Aliquam vel vulputate tellus, iaculis molestie ex. Nam viverra venenatis tempus.</p>
           <p>Sed tempor, nisi ac fringilla porta, elit orci rutrum metus, at mollis lorem lacus vitae nulla.</p>
        </div>
    </div>;
}
