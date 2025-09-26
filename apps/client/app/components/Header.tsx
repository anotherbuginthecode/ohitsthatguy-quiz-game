import React from "react";
import { Link } from "react-router";
import Logo from "~/assets/logo.png";

export default function Header() {
  return (
    <header className="w-full text-white flex items-center py-5 px-10 left-0 z-50 backdrop-blur-sm">
      <Link to={"/"}>
        <img src={Logo} alt="Oh it's that guy!" className="h-14" />
      </Link>
    </header>
  );
}
