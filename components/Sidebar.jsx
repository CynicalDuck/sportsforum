"use client";
import { useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";

import "@fortawesome/fontawesome-svg-core/styles.css";
import { config } from "@fortawesome/fontawesome-svg-core";
config.autoAddCss = false;
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Moment from "react-moment";
import "moment-timezone";

import {
  faHome,
  faMessage,
  faBookmark,
  faTicket,
  faExternalLink,
  faClock,
  faUser,
} from "@fortawesome/free-solid-svg-icons";

const Sidebar = (props) => {
  const [userProfile, setUserProfile] = useState(null);
  const [bookmarks, setBookmarks] = useState(null);
  const [showBookmarks, setShowBookmarks] = useState(true);
  const [userDiscussions, setUserDiscussions] = useState(null);
  const [showUserDiscussions, setShowUserDiscussions] = useState(false);

  useEffect(() => {}, []);

  if (!userProfile) {
    fetchUserProfile();
  }
  if (!bookmarks && userProfile) {
    forEachBookmark();
  }
  if (!userDiscussions && userProfile) {
    fetchUserDiscussion();
  }

  // FUNCTIONS
  // Get updated user profile
  async function fetchUserProfile() {
    const { data, error } = await supabase
      .from("users")
      .select()
      .eq("user_id", props.currentUserSession?.user?.id);

    if (data && !error) {
      setUserProfile(data[0]);
    }
  }
  // Get bookmarks
  async function forEachBookmark() {
    var bookmarkArray = [];

    if (userProfile?.bookmarks) {
      userProfile?.bookmarks.forEach((id) => {
        getBookmarks(id).then((bookmark) => {
          bookmarkArray.push(bookmark);
        });
      });
    }
    setBookmarks(bookmarkArray);
  }
  async function getBookmarks(id) {
    var returnData = null;
    const { data, error } = await supabase
      .from("discussions")
      .select()
      .eq("id", id);

    if (data && !error) {
      returnData = data[0];
    }
    return returnData;
  }
  // Get user discussions
  async function fetchUserDiscussion() {
    const { data, error } = await supabase
      .from("discussions")
      .select()
      .eq("created_by", userProfile.user_name);

    if (data && !error) {
      setUserDiscussions(data);
    }
    if (error) {
      console.log(error.message);
    }
  }

  return (
    <div className="bg-gray-200 px-4 py-4 text-[12px] border-r-[1px] border-gray-300 min-h-screen h-[100%]">
      {props.currentUserSessionState === "true" ? (
        <div className="flex flex-col gap-3">
          <div className="group flex flex-row gap-1">
            <div className="bg-gray-100 rounded-[10px] py-2 px-2 group-hover:bg-indigo-500">
              <FontAwesomeIcon
                icon={faHome}
                className="text-gray-400 text-[10px] group-hover:text-gray-600 group-hover:cursor-pointer group-hover:text-white"
              />
            </div>
            <a
              href="/"
              className="text-gray-400 text-[10px] py-2 px-2 group-hover:text-gray-600 group-hover:cursor-pointer"
            >
              Hjem
            </a>
          </div>
          <div
            onClick={() => setShowUserDiscussions(!showUserDiscussions)}
            className="group flex flex-row gap-1"
          >
            <div className="bg-gray-100 rounded-[10px] py-2 px-2 group-hover:bg-indigo-500">
              <FontAwesomeIcon
                icon={faMessage}
                className="text-gray-400 text-[10px] group-hover:text-gray-600 group-hover:cursor-pointer group-hover:text-white"
              />
            </div>
            <a className="text-gray-400 text-[10px] py-2 px-2 group-hover:text-gray-600 group-hover:cursor-pointer">
              Dine tråder
            </a>
          </div>
          {showUserDiscussions ? (
            <div className="flex flex-col gap-1 px-7">
              {userDiscussions?.map((discussion, index) => {
                return (
                  <div
                    key={index}
                    className="group bg-gray-200 text-gray-400 rounded-[10px] px-2 py-2 hover:bg-indigo-500 hover:text-white hover:cursor-pointer capitalize text-[10px]"
                    onClick={() => {
                      window.location.href = `/?folder=${discussion.parent_folder}&discussion=${discussion.id}`;
                    }}
                  >
                    <div className="flex flex-col gap-0">
                      {discussion.title}
                      <div className="flex flex-row gap-4">
                        <div className="flex flex-row gap-1 relative">
                          <FontAwesomeIcon
                            icon={faTicket}
                            className="text-gray-400 text-[10px] group-hover:text-gray-600 group-hover:cursor-pointer group-hover:text-white"
                          />
                          <div className="text-[8px] relative">
                            {discussion.total_posts}
                          </div>
                        </div>
                        <div className="flex flex-row gap-1 relative">
                          <FontAwesomeIcon
                            icon={faClock}
                            className="text-gray-400 text-[10px] group-hover:text-gray-600 group-hover:cursor-pointer group-hover:text-white"
                          />
                          <div className="text-[8px] relative">
                            <Moment fromNow>{discussion.last_post_at}</Moment>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-row gap-4">
                        <div className="flex flex-row gap-1 relative">
                          <FontAwesomeIcon
                            icon={faUser}
                            className="text-gray-400 text-[10px] group-hover:text-gray-600 group-hover:cursor-pointer group-hover:text-white"
                          />
                          <div className="text-[8px] relative">
                            {discussion.last_post_by}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : null}
          <div
            className="group flex flex-row gap-1"
            onClick={() => setShowBookmarks(!showBookmarks)}
          >
            <div className="bg-gray-100 rounded-[10px] py-2 px-2 group-hover:bg-indigo-500">
              <FontAwesomeIcon
                icon={faBookmark}
                className="text-gray-400 text-[10px] group-hover:text-gray-600 group-hover:cursor-pointer group-hover:text-white"
              />
            </div>
            <a className="text-gray-400 text-[10px] py-2 px-2 group-hover:text-gray-600 group-hover:cursor-pointer">
              Lagrede tråder{" "}
              {userProfile?.bookmarks?.length
                ? `(${userProfile?.bookmarks?.length})`
                : "(0)"}
            </a>
          </div>
          {showBookmarks ? (
            <div className="flex flex-col gap-1 px-7">
              {bookmarks?.map((bookmark, index) => {
                return (
                  <div
                    key={index}
                    className="group bg-gray-200 text-gray-400 rounded-[10px] px-2 py-2 hover:bg-indigo-500 hover:text-white hover:cursor-pointer capitalize text-[10px]"
                    onClick={() => {
                      window.location.href = `/?folder=${bookmark.parent_folder}&discussion=${bookmark.id}`;
                    }}
                  >
                    <div className="flex flex-col gap-0">
                      {bookmark.title}
                      <div className="flex flex-row gap-4">
                        <div className="flex flex-row gap-1 relative">
                          <FontAwesomeIcon
                            icon={faTicket}
                            className="text-gray-400 text-[10px] group-hover:text-gray-600 group-hover:cursor-pointer group-hover:text-white"
                          />
                          <div className="text-[8px] relative">
                            {bookmark.total_posts}
                          </div>
                        </div>
                        <div className="flex flex-row gap-1 relative">
                          <FontAwesomeIcon
                            icon={faClock}
                            className="text-gray-400 text-[10px] group-hover:text-gray-600 group-hover:cursor-pointer group-hover:text-white"
                          />
                          <div className="text-[8px] relative">
                            <Moment fromNow>{bookmark.last_post_at}</Moment>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-row gap-4">
                        <div className="flex flex-row gap-1 relative">
                          <FontAwesomeIcon
                            icon={faUser}
                            className="text-gray-400 text-[10px] group-hover:text-gray-600 group-hover:cursor-pointer group-hover:text-white"
                          />
                          <div className="text-[8px] relative">
                            {bookmark.last_post_by}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
};

export default Sidebar;
