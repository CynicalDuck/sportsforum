"use client";

import { socials } from "../constants";
const Footer = () => (
  <footer className="hidden lg:block">
    <div className="footer-gradient" />
    <div className={`flex flex-col gap-8 bg-gray-600 px-4 py-4`}>
      <div className="flex flex-col">
        <div className="bg-white opacity-10" />

        <div className="flex items-center justify-between flex-wrap gap-4">
          <img
            src="/logo.svg"
            alt="logo"
            className="w-14 hover:cursor-pointer"
            onClick={() => window.open("https://mariusbekk.no", "_blank")}
          />
          <p className="font-normal text-[14px] text-white opacity-100">
            Copyright © 2022 - 2023 Created by{" "}
            <a
              href="https://www.mariusbekk.no"
              target={"_blank"}
              className="hover:text-indigo-500"
            >
              Marius Bekk
            </a>
            . All rights reserved.
          </p>

          <div className="hidden lg:block">
            <a href="https://www.buymeacoffee.com/mariusbekkG">
              <img src="https://img.buymeacoffee.com/button-api/?text=Buy me a coffee&emoji=&slug=mariusbekkG&button_colour=FFDD00&font_colour=000000&font_family=Cookie&outline_colour=000000&coffee_colour=ffffff" />
            </a>
          </div>
          <div className="flex gap-4">
            {socials.map((social) => (
              <a href={social.url} key={social.name} target="_blank">
                <img
                  key={social.name}
                  src={social.img}
                  alt={social.name}
                  className="w-[24px] h-[24px] object-contain cursor-pointer"
                />
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  </footer>
);

export default Footer;
