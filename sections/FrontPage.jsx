"use client";

import { motion } from "framer-motion";

import styles from "../styles";
import Sidebar from "../components/Sidebar";

const FrontPage = () => (
  <section className={`relative`}>
    <div className="container mx-auto px-4">
      <div className="grid grid-cols-6 gap-4">
        <div className="col-span-1"></div>
        <Sidebar />
        <div className="col-span-3 bg-white rounded-[24px] py-4 px-4">Main</div>
        <div className="col-span-1"></div>
      </div>
    </div>
  </section>
);

export default FrontPage;
