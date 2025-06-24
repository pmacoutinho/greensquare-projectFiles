import React from 'react';
import environmentImage from '../../images/environment.jpg';
import personImage from '../../images/person.png';
import marketplace from '../../images/marketplace.png';
import portfolio from '../../images/portfolio.png';
import csupport from '../../images/online-chat.png';
import municipalities from '../../images/portugal-municipalities.png';
import firefighter from '../../images/firefighter.jpg';
import companies from '../../images/companies.png';
import ICNF from '../../images/ICNF.jpg';


import {Card, CardHeader, CardBody, Image} from "@nextui-org/react";


const TeamMember = ({ name, email, imgSrc, altText }) => {
    return (
        <div className="team-member">
            <img src={imgSrc} alt={altText} />
            <h3>{name}</h3>
            <a href={`mailto:${email}`}>{email}</a>
        </div>
    );
};

const Sections = () => {
    return (
        <div>
        <section id="section1" className="section">
            <div className="content-box1">
                <div className="left-side">
                    <img 
                        src={environmentImage} 
                        alt="About GreenSquare" 
                        className="about-image" 
                    />
                </div>
                <div className="right-side">
                    <h1>Our Mission</h1>
                    <div className="mission-points">
                        <p>Connecting companies committed to sustainability with landowners responsible for environmental preservation.</p>
                        <p>Promote sustainable management practices and forest fire prevention.</p>
                        <p>Create a positive impact on the environment through the trading of carbon credits.</p>
                        <p>Encourage the economic value of environmental conservation.</p>
                    </div>
                    <p>Come join GreenSquare in transforming natural landscapes into powerful solutions for the future of our planet.</p>
                </div>
            </div>
        </section>

        <section id="section2" className="section">
            <div className="content-box1" >
                    <div className="left-side2">
                        <h1>Discover the key Services of Greensquare</h1>
                        <p>Greensquare is a communication platform between landowners and businesses with the aim of promoting sustainability, transparency and community. The main features are: </p>
                        <div className="mission-points2">
                            <p>Personal Land Portfolio.</p>
                            <p>Marketplace.</p>
                            <p>Customer Support.</p>
                        </div>
                    </div>
                    <div className="right-side2">
                        <div className='portfolio'>
                            <img src={portfolio} alt="portfolio" className="about-image" />
                        </div>
                        <div className='marketplace'>
                            <img src={marketplace} alt="marketplace" className="about-image" />
                        </div>
                        <div className='csupport'>
                            <img src={csupport} alt="csupport" className="about-image" />
                        </div>
                    </div>
            </div>
        </section>


    <section id="section3" className="section">
        <div className="content-box3">
            <h1>Partners</h1>
            <p>At GreenSquare, we believe that collaboration is essential to achieving a more sustainable future. That’s why we rely on strategic partners who share our vision of protecting the environment and promoting responsible practices. Together, we build innovative solutions for a greener and more resilient planet."</p>
            <div className="card-container">
            <Card className="py-4">
                <CardHeader className="pb-0 pt-2 px-6 flex-col items-start">
                    <h2 className="font-roboto text-2xl text-bold">Municipalities</h2>
                    <p className="text-base text-gray-600 font-light">Provide support and training for completing the website.</p>
                </CardHeader>
                <CardBody className="overflow-visible py-2">
                    <Image
                        alt="Card background"
                        className="object-cover rounded-xl"
                        src={municipalities}
                        width={400}
                        height={600}
                    />
                </CardBody>
            </Card>

                
                <Card className="py-4">
                    <CardHeader className="pb-0 pt-2 px-6 flex-col items-start">
                    <h2 className="font-roboto text-2xl text-bold">Firefighters</h2>
                    <p className="text-base text-gray-800 font-light">By doing active monitoring, educational campaigns and contingency plans </p>
                    </CardHeader>
                    <CardBody className="overflow-visible py-2">
                        <Image
                            alt="Card background"
                            className="object-cover rounded-xl"
                            src={firefighter}
                            width={400}
                            height={530}
                        />
                    </CardBody>
                </Card>

                <Card className="py-4">
                    <CardHeader className="pb-0 pt-2 px-6 flex-col items-start">
                    <h2 className="font-roboto text-2xl text-bold">Companies</h2>
                    <p className="text-base text-gray-800 font-light">Through acquisition of carbon credits, investment in sustainability, technological and operational Support </p>
                    </CardHeader>
                    <CardBody className="overflow-visible py-2">
                        <Image
                            alt="Card background"
                            className="object-cover rounded-xl"
                            src={companies}
                            width={400}
                            height={600}
                        />
                    </CardBody>
                </Card>

                <Card className="py-4">
                    <CardHeader className="pb-0 pt-2 px-6 flex-col items-start">
                    <h2 className="font-roboto text-2xl text-bold">ICNF</h2>
                    <p className="text-base text-gray-800 font-light">Providing certification and calidation of carbon credits, provision of data and technical studies, fire prevention and fighting, support for the recovery of degraded areas.</p>
                    </CardHeader>
                    <CardBody className="overflow-visible py-2">
                        <Image
                            alt="Card background"
                            className="object-cover rounded-xl"
                            src={ICNF}
                            width={300}
                            height={600}
                        />
                    </CardBody>
                </Card>
            </div>
        </div>
    </section>

    <section id="section4" className="section">
        <div className="content-box" style={{ height: '860px' , width: '1600px'}}>

            <h1>Our Team</h1>
            <div className="team-container">
                <TeamMember
                    name="Gonçalo Marques"
                    email="g.marques@ua.pt"
                    imgSrc={personImage}

                />
                <TeamMember
                    name="Pedro Coutinho"
                    email="pmacoutinho@ua.pt"
                    imgSrc={personImage}
                />
                <TeamMember
                    name="Rafael Santos"
                    email="rafaelmsantos@ua.pt"
                    imgSrc={personImage}
                />
            </div>          
        </div>
    </section>
</div>

    );
};

export default Sections;
