import React from "react";
import { Navbar, NavbarBrand, NavbarContent, NavbarItem, Link, Button } from "@nextui-org/react";
import { Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from "@nextui-org/dropdown";
import { useNavigate } from "react-router-dom";
import './navbar.css';

const scrollToSection = (id) => {
  const section = document.getElementById(id);
  if (section) {
    section.scrollIntoView({ behavior: "smooth" });
  }
};

export default function AppNavbar() {
  const navigate = useNavigate();

  const handleNavigation = (path) => {
    navigate(path); // Navigate to the specified path
  };

  return (
    <Navbar className="navbar" style={{ backgroundColor: "#2c3e50" }}>
      <NavbarBrand className="navbar-brand">
        <Link href="#" className="font-bold text-inherit">
          GreenSquare
        </Link>
      </NavbarBrand>
      <NavbarContent className="navbar-content sm:flex gap-4" justify="center">
        <NavbarItem>
          <Link className="link" onClick={() => scrollToSection("section1")}>
            Our Mission
          </Link>
        </NavbarItem>
        <NavbarItem>
          <Link className="link" onClick={() => scrollToSection("section2")}>
            Services
          </Link>
        </NavbarItem>
        <NavbarItem>
          <Link className="link" onClick={() => scrollToSection("section3")}>
            Partners
          </Link>
        </NavbarItem>
        <NavbarItem>
          <Link className="link" onClick={() => scrollToSection("section4")}>
            Our Team
          </Link>
        </NavbarItem>
      </NavbarContent>
      <NavbarContent justify="end">
        <NavbarItem>
          <Dropdown>
            <DropdownTrigger>
              <Button variant="bordered" className="button">Login</Button>
            </DropdownTrigger>
            <DropdownMenu aria-label="Static Actions">
              <DropdownItem key="company" onClick={() => handleNavigation("/PosLoginCompany")}>
                Company
              </DropdownItem>
              <DropdownItem key="landowner">
              <a href="https://greensquare-auth.auth.us-east-1.amazoncognito.com/oauth2/authorize?client_id=5b48kjv07ainps2tojrm5nubm4&response_type=code&scope=email+openid+profile&redirect_uri=https://d1y0gem6y15937.cloudfront.net/api/users/callback">Landowner</a>
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
        </NavbarItem>
      </NavbarContent>
    </Navbar>
  );
}
