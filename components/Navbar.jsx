"use client";

import styles from "../styles";
import { navVariants } from "../utils/motion";

const Navbar = () => (
  <nav
    className={`py-2 relative bg-white flex flex-col rounded-[1px] w-[100%]`}
  >
    <div className={"text-gray-500 text-[18px] pl-10"}>KLANSFORUMET</div>
    <div className={"text-gray-500 text-[12px] pl-10"}>
      Vålerengas uavhengige supporteres klubb
    </div>
  </nav>
);

export default Navbar;
