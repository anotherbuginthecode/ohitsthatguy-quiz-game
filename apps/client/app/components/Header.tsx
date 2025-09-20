import React from "react";
import Logo from "~/assets/logo.png";

export default function Header() {
  return (
    <header className="w-full text-white flex items-center py-5 px-10">
      <img src={Logo} alt="Oh it's that guy!" className="h-24" />
    </header>
  );
}
