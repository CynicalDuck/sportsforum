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
  faBoltLightning,
} from "@fortawesome/free-solid-svg-icons";

const SidebarRight = (props) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  // FUNCTIONS

  async function login() {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: username,
      password: password,
    });

    if (error) {
      props.handleError(error.message);
    }

    if (data?.user?.aud === "authenticated") {
      props.handleSuccess("Du er nå logget inn!");
      window.location.reload();
    }
  }

  async function logout() {
    const { error } = await supabase.auth.signOut();

    if (!error) {
      window.location.href = "/";
    }
  }

  if (props.createNewUser || props.forgotPassword) {
    return null;
  }

  return (
    <div className="bg-gray-200 px-4 py-4 text-[12px] border-gray-300 min-h-screen h-[100%] lg:border-l-[1px]">
      {props.currentUserSessionState === true ? (
        <div className="flex flex-col gap-2">
          <img
            className="contain-avatar rounded-[24px] max-h-[180px] min-w-[160px] max-w-[170px] shadow-sm shadow-black hidden md:hidden lg:block"
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
              <div
                className="bg-gray-100 rounded-full py-2 px-2 group-hover:bg-indigo-500"
                onClick={() => props.setShowSettings(true)}
              >
                <FontAwesomeIcon
                  icon={faCog}
                  className="text-gray-400 text-[10px] group-hover:text-gray-600 group-hover:cursor-pointer group-hover:text-white"
                />
              </div>
              <div
                className="text-gray-400 text-[10px] py-2 px-2 group-hover:text-gray-600 group-hover:cursor-pointer"
                onClick={() => props.setShowSettings(true)}
              >
                Innstillinger
              </div>
            </div>
            {props.currentUserProfile?.is_admin ? (
              <div className="group flex flex-row gap-2 wrap">
                <div
                  className="bg-gray-100 rounded-full py-2 px-2 group-hover:bg-indigo-500"
                  onClick={() => props.setShowAdmin(true)}
                >
                  <FontAwesomeIcon
                    icon={faBoltLightning}
                    className="text-gray-400 text-[10px] group-hover:text-gray-600 group-hover:cursor-pointer group-hover:text-white"
                  />
                </div>
                <div
                  className="text-gray-400 text-[10px] py-2 px-2 group-hover:text-gray-600 group-hover:cursor-pointer"
                  onClick={() => props.setShowAdmin(true)}
                >
                  Administrator
                </div>
              </div>
            ) : null}
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
          <div className="bg-white rounded-[15px] w-[100%] min-w-[180px] mt-2 py-2 px-2 flex flex-col gap-2 hidden lg:block">
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
          <div className="">
            <a href="https://www.buymeacoffee.com/mariusbekkG">
              <img src="https://img.buymeacoffee.com/button-api/?text=Støtt drift og utvikling&emoji=&slug=mariusbekkG&button_colour=ffffff&font_colour=000000&font_family=Arial&outline_colour=000000&coffee_colour=FFDD00" />
            </a>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-1 sm:flex-row md:flex-col lg:flex-col">
          <form action="javascript:void(0);">
            <input
              type="text"
              id="first_name"
              className="border border-gray-300 rounded-[24px] px-4 py-2 focus:outline-indigo-500 mb-1 w-[100%]"
              placeholder="Brukernavn"
              required
              onChange={(e) => setUsername(e.target.value)}
            ></input>
            <input
              className="border border-gray-300 rounded-[24px] px-4 py-2 focus:outline-indigo-500 w-[100%]"
              type="password"
              placeholder="Passord"
              required
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              className="bg-indigo-500 text-white rounded-[24px] px-4 py-2 mt-1 min-w-[160px] w-[100%]"
              onClick={() => login()}
            >
              Logg inn
            </button>
          </form>
          <div className="flex flex-row gap-2 w-[100%]">
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
