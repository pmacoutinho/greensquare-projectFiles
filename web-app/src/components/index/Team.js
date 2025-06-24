import React from 'react';
import '../../App.css'; 
import personImage from '../../images/person.png';


const TeamMember = ({ name, email, imgSrc, altText }) => {
    return (
        <div className="team-member">
            <img src={imgSrc} alt={altText} />
            <h3>{name}</h3>
            <a href={`mailto:${email}`}>{email}</a>
        </div>
    );
};

const Team = () => {
    return (
        <section className="team" id="team">
            <div className="team-container">
                <TeamMember
                    name="Gonçalo Marques"
                    email="g.marques@ua.pt"
                    imgSrc={personImage}
                    altText="Gonçalo Marques"
                />
                <TeamMember
                    name="Pedro Coutinho"
                    email="pmacoutinho@ua.pt"
                    imgSrc={personImage}
                    altText="Pedro Coutinho"
                />
                <TeamMember
                    name="Rafael Santos"
                    email="rafaelmsantos@ua.pt"
                    imgSrc={personImage}
                    altText="Rafael Santos"
                />
            </div>
        </section>
    );
};

export default Team;
