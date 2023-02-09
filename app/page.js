"use client";

import { supabase } from "../lib/supabaseClient";
import { useEffect, useState } from "react";

import { Footer, Navbar, Sidebar } from "../components";
import { FrontPage, Hero } from "../sections";

const Page = () => {
  const [currentUserSessionState, setCurrentUserSessionState] = useState(
    localStorage.getItem("klansforum_user_auth")
  );
  const [currentUserSession, setCurrentUserSession] = useState(null);
  const [currentUserProfile, setCurrentUserProfile] = useState(null);

  useEffect(() => {
    checkLoginState();
  }, []);

  async function checkLoginState() {
    const { data, error } = await supabase.auth.getSession();
    setCurrentUserSession(data.session);
  }

  async function checkForUserProfile() {
    const { data, error } = await supabase
      .from("users")
      .select()
      .eq("user_id", currentUserSession?.user?.id);

    if (data?.length === 0) {
      const { data: userProfileData, error: userProfileError } = await supabase
        .from("users")
        .insert([
          {
            user_id: currentUserSession?.user?.id,
            user_name: currentUserSession?.user?.user_metadata?.user_name,
            avatar_url: "/banner_1.jpeg",
          },
        ])
        .select();

      if (userProfileData && currentUserProfile === null) {
        setCurrentUserProfile(userProfileData[0]);
      }
    } else if (currentUserProfile === null) {
      setCurrentUserProfile(data[0]);
    }
  }

  if (currentUserSession) {
    checkForUserProfile();
  }

  if (currentUserSession?.user?.aud === "authenticated") {
    localStorage.setItem("klansforum_user_auth", true);
  } else {
    localStorage.removeItem("klansforum_user_auth");
  }

  if (currentUserProfile && currentUserSession && currentUserSessionState) {
    return (
      <div className="bg-gradient-to-tl from-gray-600 via-gray-700 to-gray-900 min-h-screen h-[100%]">
        <Navbar />
        <FrontPage
          currentUserSession={currentUserSession}
          currentUserSessionState={currentUserSessionState}
          currentUserProfile={currentUserProfile}
        />
        <Footer />
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-tl from-gray-600 via-gray-700 to-gray-900 min-h-screen h-[100%]">
      <Navbar />
      <FrontPage
        currentUserSession={currentUserSession}
        currentUserSessionState={currentUserSessionState}
        currentUserProfile={currentUserProfile}
      />
      <Footer />
    </div>
  );
};

export default Page;
