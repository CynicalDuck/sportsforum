"use client";

import { supabase } from "../lib/supabaseClient";
import { useEffect, useState } from "react";

import { Footer, Navbar, Sidebar } from "../components";
import { FrontPage, Hero } from "../sections";

const Page = () => {
  const [currentUserSessionState, setCurrentUserSessionState] = useState(null);
  const [currentUserSession, setCurrentUserSession] = useState(null);
  const [currentUserProfile, setCurrentUserProfile] = useState(null);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showMessage, setShowMessage] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    checkLoginState();
  }, []);

  if (
    currentUserSession?.user?.aud === "authenticated" &&
    (currentUserSessionState === null || currentUserSessionState === false)
  ) {
    setCurrentUserSessionState(true);
  }

  // FUNCTIONS
  // Handle errors
  function handleError(error) {
    setShowError(true);
    setErrorMessage(error);

    setTimeout(function () {
      setShowError(false);
      setErrorMessage("");
    }, 8000);
  }

  // Handle succsess
  function handleSuccess(message) {
    setShowMessage(true);
    setMessage(message);

    setTimeout(function () {
      setShowMessage(false);
      setMessage("");
    }, 8000);
  }

  // Check if user is logged in
  async function checkLoginState() {
    const { data, error } = await supabase.auth.getSession();
    setCurrentUserSession(data.session);

    if (error) {
      handleError(error.message);
    }
  }

  // Check if user has a profile
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

      if (userProfileError) {
        handleError(userProfileError.message);
      }
    } else if (currentUserProfile === null) {
      setCurrentUserProfile(data[0]);
    }

    if (error) {
      handleError(error.message);
    }
  }

  if (currentUserSession) {
    checkForUserProfile();
  }

  if (currentUserProfile && currentUserSession && currentUserSessionState) {
    return (
      <div className="bg-gray-200 min-h-screen h-[100%]">
        <Navbar />
        {showError ? (
          <div className="bg-red-500 text-white rounded-[15px] p-2 mt-3">
            {"En feil har oppstått: " + errorMessage}
          </div>
        ) : null}
        {showMessage ? (
          <div className="bg-green-500 text-white text-[12px] rounded-[15px] p-2 mt-2 mb-2">
            {message}
          </div>
        ) : null}
        <FrontPage
          currentUserSession={currentUserSession}
          currentUserSessionState={currentUserSessionState}
          currentUserProfile={currentUserProfile}
          handleError={handleError}
          showError={showError}
          errorMessage={errorMessage}
          handleSuccess={handleSuccess}
          showMessage={showMessage}
          message={message}
        />
        <Footer />
      </div>
    );
  }

  return (
    <div className="bg-gray-200 min-h-screen h-[100%] w-screen">
      <Navbar />
      {showError ? (
        <div className="bg-red-500 text-white text-[12px] rounded-[15px] p-2 mt-2 mb-2">
          {"En feil har oppstått: " + errorMessage}
        </div>
      ) : null}
      {showMessage ? (
        <div className="bg-green-500 text-white text-[12px] rounded-[15px] p-2 mt-2 mb-2">
          {message}
        </div>
      ) : null}
      <FrontPage
        currentUserSession={currentUserSession}
        currentUserSessionState={currentUserSessionState}
        currentUserProfile={currentUserProfile}
        handleError={handleError}
        showError={showError}
        errorMessage={errorMessage}
        handleSuccess={handleSuccess}
        showMessage={showMessage}
        message={message}
      />
      <Footer />
    </div>
  );
};

export default Page;
