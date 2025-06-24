import React from 'react';
import Navbar from './PosLoginNavbarCompany';
import Sections from './PosLoginCompanySections';
import '../../posLogin.css';

function PosLoginCompany() {
    return (
        <div>
            <Navbar />
            <main>                
                {/* Credits Section */}
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
