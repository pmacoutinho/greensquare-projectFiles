import { Navbar, NavbarBrand, NavbarContent, NavbarItem, Link, Button } from "@nextui-org/react";
import './navbar.css';
import { useNavigate } from "react-router-dom";

const scrollToSection = (id) => {
  const section = document.getElementById(id);
  if (section) {
    section.scrollIntoView({ behavior: "smooth" });
  }
};

export default function App() {

  const navigate = useNavigate();

  const handleNavigation = (path) => {
    navigate(path); // Navigate to the specified path
  };

  return (
    <Navbar className="navbar" style={{ backgroundColor: "#2c3e50" }}>
  <NavbarBrand className="navbar-brand">
    <Link href="#" className="font-bold text-inherit">
      GreenSquare - Company
    </Link>
  </NavbarBrand>
  <NavbarContent className="navbar-content sm:flex gap-4" justify="center">
    <NavbarItem>
      <Link className="link" onClick={() => scrollToSection("section1")}>
        My Credits
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
        <Button variant="bordered" className="button">Logout</Button>
    </NavbarItem>
  </NavbarContent>
  <NavbarContent justify="end">
  </NavbarContent>
</Navbar>

  );
}
