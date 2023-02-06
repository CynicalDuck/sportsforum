"use client";

import { motion } from "framer-motion";

import styles from "../styles";
import { blogPosts } from "../constants";
import { TypingText } from "../components";
import { staggerContainer, textVariant, fadeIn } from "../utils/motion";

const About = () => (
  <section className={`relative`}>
    <div className="gradient-02 z-0" />

    {blogPosts.map((post, index) => (
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.25 }}
        className={`${styles.innerWidth} mx-auto ${styles.flexCenter} flex-col`}
      >
        <motion.div
          variants={fadeIn("right", "tween", 0.2, 0.4)}
          className="mb-10 lg:w-[800px] bg-white py-5 px-5 rounded-[20px] shadow-sm shadow-black"
        >
          <motion.img
            variants={fadeIn("right", "tween", 0.2, 0.4)}
            src={post.imgUrl}
            className="lg:w-[800px] lg:h-[500px] w-[500px] rounded-[20px] shadow-sm shadow-black mb-4"
          />
          <motion.p
            variants={fadeIn("right", "tween", 0.2, 0.2)}
            className="text-center font-semibold text-gray-700 sm:text-[20px] text-[12px]"
          >
            {post.title}
          </motion.p>
          <motion.div
            variants={fadeIn("right", "tween", 0.2, 0.2)}
            className="flex flex-row place-content-center my-4 gap-4"
          >
            <motion.p
              variants={fadeIn("right", "tween", 0.2, 0.2)}
              className="text-center font-normal text-gray-700 sm:text-[16px] text-[12px]"
            >
              {post.date}
            </motion.p>
            <motion.p
              variants={fadeIn("right", "tween", 0.2, 0.2)}
              className="text-center font-normal text-gray-700 sm:text-[16px] text-[12px]"
            >
              {post.author}
            </motion.p>
            <motion.div
              variants={fadeIn("right", "tween", 0.2, 0.2)}
              className="text-center font-normal text-gray-700 sm:text-[16px] text-[12px]"
            >
              {
                <div className="flex flex-row place-content-center gap-2 flex-wrap">
                  {post.tags.map((tag) => (
                    <div>{tag}</div>
                  ))}
                </div>
              }
            </motion.div>
          </motion.div>
          <motion.p
            variants={fadeIn("right", "tween", 0.2, 0.4)}
            className="mt-2 font-normal sm:text-[16px] text-[12px] text-left text-gray-700 w-full"
          >
            {post.content}
          </motion.p>
        </motion.div>
      </motion.div>
    ))}
  </section>
);

export default About;
