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
          GreenSquare - Landowner
        </Link>
      </NavbarBrand>
      <NavbarContent className="navbar-content sm:flex gap-4" justify="center">
        <NavbarItem>
          <Link className="link" onClick={() => scrollToSection("section1")}>
            My Lands
          </Link>
        </NavbarItem>
        <NavbarItem>
          <Link className="link" onClick={() => handleNavigation("/Market")}>
            Marketplace
          </Link>
        </NavbarItem>
        <NavbarItem>
          <Link className="link" onClick={() => scrollToSection("section3")}>
            Offers
          </Link>
        </NavbarItem>
        <NavbarItem>
          <Link className="link" onClick={() => scrollToSection("section4")}>
            Contact Support
          </Link>
        </NavbarItem>
        <NavbarItem>
          <a href="https://greensquare-auth.auth.us-east-1.amazoncognito.com/logout?client_id=5b48kjv07ainps2tojrm5nubm4&logout_uri=https://d1y0gem6y15937.cloudfront.net/api/users/logout">Logout</a>
        </NavbarItem>
        </NavbarContent>
      <NavbarContent justify="end">
        
      </NavbarContent>
    </Navbar>
  );
}
