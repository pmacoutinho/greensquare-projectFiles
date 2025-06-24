import React from 'react';
import Navbar from './PosLoginNavbarLandowner';
import Sections from './PosLoginLandownerSections';
import '../../posLogin.css';

function PosLoginCompany() {
    return (
        <div>
            <Navbar />
            <main>                
                <Sections />
            </main>

            <footer>
                <button id="scrollToTopBtn">↑ Top</button>
                <p>&copy; 2024 GreenSquare</p>
            </footer>
        </div>
    );
}

export default PosLoginCompany;
