"use client";
import { supabase } from "../lib/supabaseClient";
import { motion } from "framer-motion";

import { links } from "../constants";
import { staggerContainer } from "../utils/motion";

const Sidebar = () => {
  const user = supabase.auth.getUser();

  console.log(user);

  function signUp() {}

  return (
    <motion.div
      variants={staggerContainer}
      initial="show"
      whileInView="show"
      viewport={{ once: false, amount: 0.25 }}
    >
      <div className="bg-white px-4 py-4 mb-1 rounded-[24px]">
        <div className="text-black font-semibold">Current user</div>
        <div className="flex flex-col gap-1">
          <label
            for="first_name"
            class="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300"
          >
            First name
          </label>
          <input
            type="text"
            id="first_name"
            class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            placeholder="John"
            required
          ></input>
          Password
          <input
            className="border border-gray-300 rounded-[24px] px-4 py-2"
            type="password"
          />
        </div>
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
};

export default Sidebar;
