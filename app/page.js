"use client";

import { supabase } from "../lib/supabaseClient";
import { useEffect, useState } from "react";

import { Footer, Navbar, Sidebar } from "../components";
import { FrontPage, Hero } from "../sections";

const Page = () => {
  const [currentUserSession, setCurrentUserSession] = useState(null);

  useEffect(() => {
    checkLoginState();
  }, []);

  async function checkLoginState() {
    const { data, error } = await supabase.auth.getSession();
    setCurrentUserSession(data.session);
  }

  return (
    <div className="bg-gradient-to-tl from-gray-600 via-gray-700 to-gray-900 overflow-hidden">
      <Navbar />
      <FrontPage currentUserSession={currentUserSession} />
      <Footer />
    </div>
  );
};

export default Page;
