"use client";

import { motion } from "framer-motion";

import { links } from "../constants";
import styles from "../styles";
import { navVariants, staggerContainer, fadeIn } from "../utils/motion";

const Sidebar = () => (
  <motion.div
    variants={staggerContainer}
    initial="show"
    whileInView="show"
    viewport={{ once: false, amount: 0.25 }}
  >
    <div className="text-white">//Search</div>
    <div className="text-white">//Last posts</div>
    <div className="text-white">Nyttige lenker</div>
    {links.map((link, index) => (
      <div className="text-white">
        <motion.a
          variants={fadeIn("up", "tween", 0.2, 1)}
          className="font-semibold text-white hover:text-secondary-white"
          href={link.url}
          target={link.target}
        >
          {link.name}
        </motion.a>
        <br />
      </div>
    ))}
  </motion.div>
);

export default Sidebar;
