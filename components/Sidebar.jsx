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
    <div className="bg-white px-4 py-4 mb-1 rounded-[24px]">
      <div className="text-black font-semibold">Current user</div>
    </div>
    <div className="bg-white px-4 py-4 mb-1 rounded-[24px]">
      <div className="text-black font-semibold">Last posts</div>
    </div>
    <div className="bg-white px-4 py-4 mb-1 rounded-[24px]">
      <div className="text-black font-semibold">Nyttige lenker</div>
      <div className="flex flex-col gap-1">
        {links.map((link, index) => (
          <a href={link.href} key={index} className="text-black">
            {link.name}
          </a>
        ))}
      </div>
    </div>
  </motion.div>
);

export default Sidebar;
