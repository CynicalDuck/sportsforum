"use client";

import { supabase } from "../lib/supabaseClient";
import { useEffect, useState } from "react";

import { Footer, Navbar, Sidebar } from "../components";
import { FrontPage, Hero } from "../sections";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { faXmark } from "@fortawesome/free-solid-svg-icons";

const Page = () => {
  const [render, setRender] = useState(false);
  const [boardSettings, setBoardSettings] = useState(null);
  const [currentUserSessionState, setCurrentUserSessionState] = useState(null);
  const [currentUserSession, setCurrentUserSession] = useState(null);
  const [currentUserProfile, setCurrentUserProfile] = useState(null);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showMessage, setShowMessage] = useState(false);
  const [message, setMessage] = useState("");
  const [announcements, setAnnouncements] = useState(null);

  useEffect(() => {
    checkLoginState();
    getBoardSettings();
    getAnnouncements();
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
        //handleError(userProfileError.message);
      }
    } else if (currentUserProfile === null) {
      setCurrentUserProfile(data[0]);
    }

    if (error) {
      handleError(error.message);
    }
  }

  // Get board settings
  async function getBoardSettings() {
    const { data, error } = await supabase
      .from("settings")
      .select()
      .eq("id", 1);

    if (data && boardSettings === null) {
      setBoardSettings(data[0]);
    }

    if (error) {
      handleError(error.message);
    }
  }

  // Get announcements
  async function getAnnouncements() {
    const { data, error } = await supabase.from("announcements").select();

    if (data && announcements === null) {
      setAnnouncements(data);
    }

    if (error) {
      handleError(error.message);
    }
  }

  // Close announcement
  async function closeAnnouncement(announcement) {
    var array = [];

    if (announcement.seen_by) {
      array = announcement.seen_by;
    }

    array.push(currentUserProfile.user_id);

    const { data, error } = await supabase
      .from("announcements")
      .update({
        seen_by: array,
      })
      .eq("id", announcement.id);

    if (!error) {
      getAnnouncements();
      window.location.reload();
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
        <Navbar boardSettings={boardSettings} />
        {announcements
          ? announcements.map((announcement, index) =>
              announcement.seen_by?.includes(
                currentUserProfile?.user_id
              ) ? null : (
                <div
                  className="flex flex-row gap-4 bg-gray-500 text-white py-2 px-2 mx-2 my-2 rounded-[1rem]"
                  key={index}
                >
                  <FontAwesomeIcon
                    icon={faXmark}
                    className="text-white text-[1.1rem] hover:cursor-pointer"
                    onClick={() => closeAnnouncement(announcement)}
                  />
                  <div className="text-[0.8rem]">{announcement.content}</div>
                </div>
              )
            )
          : null}
        {showError ? (
          <div className="bg-red-500 text-white rounded-[15px] p-2 mt-3 mx-2">
            {"En feil har oppstått: " + errorMessage}
          </div>
        ) : null}
        {showMessage ? (
          <div className="bg-green-500 text-white text-[12px] rounded-[15px] p-2 mt-2 mb-2 mx-2">
            {message}
          </div>
        ) : null}
        <FrontPage
          boardSettings={boardSettings}
          currentUserSession={currentUserSession}
          currentUserSessionState={currentUserSessionState}
          currentUserProfile={currentUserProfile}
          handleError={handleError}
          showError={showError}
          errorMessage={errorMessage}
          handleSuccess={handleSuccess}
          showMessage={showMessage}
          message={message}
          render={render}
          setRender={setRender}
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
