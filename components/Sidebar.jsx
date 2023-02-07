"use client";
import { useState } from "react";
import { supabase } from "../lib/supabaseClient";

import { links } from "../constants";

const Sidebar = (props) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  async function login() {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: username,
      password: password,
    });

    if (data?.user?.aud === "authenticated") {
      window.location.reload();
    }
  }

  async function logout() {
    const { error } = await supabase.auth.signOut();
    if (!error) {
      window.location.reload();
    }
  }

  return (
    <div>
      <div className="bg-white px-4 py-4 mb-1 rounded-[24px]">
        <div className="text-black font-semibold">Innlogget bruker</div>
        {props.currentUserSession?.user?.aud === "authenticated" ? (
          <div className="flex flex-col gap-1">
            <div className="text-black">
              {props.currentUserSession.user.user_metadata.full_name}
            </div>
            <button
              className="bg-blue-500 text-white rounded-[24px] px-4 py-2 mt-1"
              onClick={() => logout()}
            >
              Logg ut
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-1">
            Brukernavn
            <input
              type="text"
              id="first_name"
              className="border border-gray-300 rounded-[24px] px-4 py-2"
              placeholder="Brukernavn"
              required
              onChange={(e) => setUsername(e.target.value)}
            ></input>
            Passord
            <input
              className="border border-gray-300 rounded-[24px] px-4 py-2"
              type="password"
              placeholder="Passord"
              required
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              className="bg-blue-500 text-white rounded-[24px] px-4 py-2 mt-1"
              onClick={() => login()}
            >
              Logg inn
            </button>
            <div className="flex flex-row gap-2">
              <div
                className="text-[12px] hover:text-blue-500 hover:cursor-pointer"
                onClick={() => props.setCreateNewUser(true)}
              >
                Registrer deg
              </div>
              <div
                className="text-[12px] hover:text-blue-500 hover:cursor-pointer"
                onClick={() => props.setForgotPassword(true)}
              >
                Glemt passord
              </div>
            </div>
          </div>
        )}
      </div>
      <div className="bg-white px-4 py-4 mb-1 rounded-[24px]">
        <div className="text-black font-semibold">Last posts</div>
      </div>
      <div className="bg-white px-4 py-4 mb-1 rounded-[24px]">
        <div className="text-black font-semibold">Nyttige lenker</div>
        <div className="flex flex-col gap-1">
          {links.map((link, index) => (
            <a
              href={link.url}
              key={index}
              className="text-black hover:text-blue-500"
            >
              {link.name}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
