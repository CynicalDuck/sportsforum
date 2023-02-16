"use client";

import styles from "../styles";
import { navVariants } from "../utils/motion";

const Navbar = (props) => (
  <nav
    className={`py-2 relative bg-white flex flex-col rounded-[1px] w-[100%]`}
    onClick={() => (window.location.href = "/")}
  >
    <div className="hover:cursor-pointer">
      <div className={"text-gray-500 text-[18px] pl-10"}>
        {props.boardSettings?.board_title}
      </div>
      <div className={"text-gray-500 text-[12px] pl-10"}>
        {props.boardSettings?.board_subtitle}
      </div>
    </div>
  </nav>
);

export default Navbar;
