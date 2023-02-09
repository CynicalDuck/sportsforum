"use client";
import { useState } from "react";
import { supabase } from "../lib/supabaseClient";

import { links } from "../constants";

import "@fortawesome/fontawesome-svg-core/styles.css";
import { config } from "@fortawesome/fontawesome-svg-core";
config.autoAddCss = false;
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import {
  faUser,
  faEnvelope,
  faCog,
  faSignOut,
  faExternalLink,
} from "@fortawesome/free-solid-svg-icons";

const SidebarRight = (props) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  async function login() {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: username,
      password: password,
    });

    if (data?.user?.aud === "authenticated") {
      if (typeof window !== "undefined") {
        setCurrentUserSessionState(
          localStorage.setItem("klansforum_user_auth", true)
        );
      }

      window.location.reload();
    }
  }

  async function logout() {
    const { error } = await supabase.auth.signOut();
    if (typeof window !== "undefined") {
      setCurrentUserSessionState(
        localStorage.removeItem("klansforum_user_auth")
      );
    }

    if (!error) {
      window.location.href = "/";
    }
  }

  return (
    <div className="bg-gray-200 px-4 py-4 text-[12px] border-l-[1px] border-gray-300 min-h-screen h-[100%]">
      {props.currentUserSessionState === "true" ? (
        <div className="flex flex-col gap-2">
          <div className="text-gray-600 text-[14px]">
            {props.currentUserSession?.user?.user_metadata?.full_name}
          </div>
          <img
            className="contain-avatar rounded-[24px] max-h-[180px] min-w-[180px] shadow-sm shadow-black"
            src={props.currentUserProfile?.avatar_url}
          />
          <div className="bg-white rounded-[15px] h-[100%] w-[100%] min-w-[180px] mt-2 py-2 px-2 flex flex-col gap-2">
            <div className="flex flex-row gap-2">
              <div className="bg-gray-100 rounded-full py-2 px-2">
                <FontAwesomeIcon
                  icon={faUser}
                  className="text-gray-400 text-[10px]"
                />
              </div>
              <div className="text-gray-400 text-[10px] py-2 px-2">
                {props.currentUserProfile?.user_name
                  ? props.currentUserProfile?.user_name
                  : props.currentUserSession?.user?.user_metadata?.user_name}
              </div>
            </div>
            <div className="flex flex-row gap-2">
              <div className="bg-gray-100 rounded-full py-2 px-2">
                <FontAwesomeIcon
                  icon={faEnvelope}
                  className="text-gray-400 text-[10px]"
                />
              </div>
              <div className="text-gray-400 text-[10px] py-2 px-2">
                {props.currentUserSession?.user?.email}
              </div>
            </div>
            <div className="group flex flex-row gap-2 wrap">
              <div className="bg-gray-100 rounded-full py-2 px-2 group-hover:bg-indigo-500">
                <FontAwesomeIcon
                  icon={faCog}
                  className="text-gray-400 text-[10px] group-hover:text-gray-600 group-hover:cursor-pointer group-hover:text-white"
                />
              </div>
              <div className="text-gray-400 text-[10px] py-2 px-2 group-hover:text-gray-600 group-hover:cursor-pointer">
                Innstillinger
              </div>
            </div>
            <div className="flex flex-row gap-2 wrap group">
              <div className="bg-gray-100 rounded-full py-2 px-2 group-hover:bg-indigo-500">
                <FontAwesomeIcon
                  icon={faSignOut}
                  className="text-gray-400 text-[10px] group-hover:text-gray-600 group-hover:cursor-pointer group-hover:text-white"
                />
              </div>
              <div
                className="text-gray-400 text-[10px] py-2 px-2 group-hover:text-gray-600 group-hover:cursor-pointer"
                onClick={() => logout()}
              >
                Logg ut
              </div>
            </div>
          </div>
          <div className="bg-white rounded-[15px] w-[100%] min-w-[180px] mt-2 py-2 px-2 flex flex-col gap-2">
            {links.map((link, index) => (
              <div className="flex flex-row gap-2 wrap group" key={index}>
                <div className="bg-gray-100 rounded-full py-2 px-2 group-hover:bg-indigo-500 max-h-[35px]">
                  <FontAwesomeIcon
                    icon={faExternalLink}
                    className="text-gray-400 text-[10px] group-hover:text-gray-600 group-hover:cursor-pointer group-hover:text-white"
                    key={index}
                  />
                </div>
                <a
                  href={link.url}
                  key={index}
                  className="text-gray-400 text-[10px] py-2 px-2 group-hover:text-gray-600 group-hover:cursor-pointer"
                  onClick={() => logout()}
                >
                  {link.name}
                </a>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-1">
          <form>
            <input
              type="text"
              id="first_name"
              className="border border-gray-300 rounded-[24px] px-4 py-2 focus:outline-indigo-500 mb-1"
              placeholder="Brukernavn"
              required
              onChange={(e) => setUsername(e.target.value)}
            ></input>
            <input
              className="border border-gray-300 rounded-[24px] px-4 py-2 focus:outline-indigo-500"
              type="password"
              placeholder="Passord"
              required
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              className="bg-indigo-500 text-white rounded-[24px] px-4 py-2 mt-1 min-w-[160px]"
              onClick={() => login()}
            >
              Logg inn
            </button>
          </form>
          <div className="flex flex-row gap-2">
            <div
              className="text-[10px] hover:text-indigo-500 hover:cursor-pointer"
              onClick={() => props.setCreateNewUser(true)}
            >
              Registrer deg
            </div>
            <div
              className="text-[10px] hover:text-indigo-500 hover:cursor-pointer"
              onClick={() => props.setForgotPassword(true)}
            >
              Glemt passord
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SidebarRight;
