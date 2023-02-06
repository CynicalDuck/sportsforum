"use client";

import { motion } from "framer-motion";

import styles from "../styles";
import { staggerContainer, textVariant } from "../utils/motion";

const Hero = () => (
  <section className={`${styles.yPaddings} sm:pl-16 pl-6`}>
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      whileInView="show"
      viewport={{ once: false, amout: 0.25 }}
      className={`${styles.innerWidth} mx-auto flex flex-col`}
    >
      <motion.p
        variants={textVariant(0.9)}
        initial="hidden"
        whileInView="show"
        className="text-white"
      >
        Uavhengige siden 1996 - Stolte siden 1913
      </motion.p>
      <motion.p
        variants={textVariant(1.2)}
        initial="hidden"
        whileInView="show"
        className={styles.heroHeading}
      >
        Vålerenga På Nett
      </motion.p>
    </motion.div>
  </section>
);

export default Hero;
