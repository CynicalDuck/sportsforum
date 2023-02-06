"use client";

import { motion } from "framer-motion";

import styles from "../styles";
import { navVariants } from "../utils/motion";

const Navbar = () => (
  <motion.nav
    variants={navVariants}
    initial="hidden"
    whileInView="show"
    className={`${styles.xPaddings} py-8 relative`}
  >
    <div
      className={`${styles.innerWidth} mx-auto flex justify-between gap-8 text-white font-semibold lg:text-[60px] md:text-[40px] sm:text-[24px] text-[24px]`}
    >
      KLANSFORUMET
    </div>
  </motion.nav>
);

export default Navbar;
