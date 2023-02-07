"use client";

import { supabase } from "../lib/supabaseClient";
import { useState } from "react";
import Sidebar from "../components/Sidebar";
import { SidebarRight } from "../components";
import { Forum } from "../components";

const FrontPage = (props) => {
  const [createNewUser, setCreateNewUser] = useState(false);
  const [forgotPassword, setForgotPassword] = useState(false);
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserUsername, setNewUserUsername] = useState("");
  const [newUserFullName, setNewUserFullName] = useState("");
  const [newUserPassword, setNewUserPassword] = useState("");
  const [newUserPasswordConfirm, setNewUserPasswordConfirm] = useState("");
  const [newPasswordValid, setNewPasswordValid] = useState(false);

  async function onClickSubmitNewUser() {
    const userData = await supabase.auth.signUp({
      email: newUserEmail,
      password: newUserPassword,
      options: {
        data: {
          user_name: newUserUsername,
          full_name: newUserFullName,
        },
      },
    });
  }

  if (createNewUser) {
    return (
      <section className={`relative`}>
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-6 gap-4">
            <div className="col-span-1"></div>
            <div className="col-span-4 bg-white rounded-[24px] py-4 px-4">
              <form className="flex flex-col gap-2">
                <div className="text-black font-semibold">Din epost:</div>
                <input
                  className="border border-gray-300 rounded-[24px] px-4 py-2"
                  type="email"
                  placeholder="E-post"
                  required
                  onChange={(e) => {
                    setNewUserEmail(e.target.value);
                  }}
                />
                <div className="text-gray-400 text-[12px]">
                  Det er din e-post adresse du vil måtte benytte ved pålogging
                </div>
                <div className="text-black font-semibold mt-1">
                  Ditt brukernavn:
                </div>
                <input
                  className="border border-gray-300 rounded-[24px] px-4 py-2"
                  type="text"
                  placeholder="Brukernavn"
                  required
                  onChange={(e) => {
                    setNewUserUsername(e.target.value);
                  }}
                />
                <div className="text-gray-400 text-[12px]">
                  Brukernavnet ditt er det alle vil kjenne deg som på forumet.
                  Dette kan endres senere.
                </div>
                <div className="text-black font-semibold mt-1">
                  Ditt fulle navn:
                </div>
                <input
                  className="border border-gray-300 rounded-[24px] px-4 py-2"
                  type="text"
                  placeholder="Navn"
                  required
                  onChange={(e) => {
                    setNewUserFullName(e.target.value);
                  }}
                />
                <div className="text-gray-400 text-[12px]">
                  Dette må være korrekt.
                </div>
                <div className="text-black font-semibold mt-1">Passord:</div>
                <input
                  className="border border-gray-300 rounded-[24px] px-4 py-2"
                  type="password"
                  placeholder="Bekreft passord"
                  required
                  onChange={(e) => {
                    setNewUserPassword(e.target.value);
                  }}
                />
                <div className="text-black font-semibold mt-1">
                  Bekreft passord:
                </div>
                <input
                  className="border border-gray-300 rounded-[24px] px-4 py-2"
                  type="password"
                  placeholder="Passord"
                  required
                  onChange={(e) => {
                    setNewUserPasswordConfirm(e.target.value);
                  }}
                />
                <div className="flex flex-row gap-2 mt-6">
                  <button
                    className="bg-red-500 text-white rounded-[24px] px-4 py-2"
                    onClick={() => setCreateNewUser(false)}
                  >
                    Avbryt
                  </button>
                  <button
                    className="bg-blue-500 text-white rounded-[24px] px-4 py-2"
                    onClick={() => onClickSubmitNewUser()}
                  >
                    Registrer deg
                  </button>
                </div>
                <div className="text-gray-400 text-[12px] mt-2">
                  Etter at du har registrert din bruker vil vi sende deg en
                  e-post for å bekrefte din identitet. Dersom du ikke har fått
                  en e-post innen 5 minutter, sjekk søppelposten din.
                </div>
              </form>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className={`relative`}>
      <div className="mx-auto px-10">
        <div className="grid grid-cols-6 gap-4">
          <Sidebar
            createNewUser={createNewUser}
            setCreateNewUser={setCreateNewUser}
            forgotPassword={forgotPassword}
            setForgotPassword={setForgotPassword}
            currentUserSession={props.currentUserSession}
          />
          <div className="col-span-5 bg-white rounded-[24px] py-4 px-4">
            <Forum currentUserSession={props.currentUserSession} />
          </div>
        </div>
      </div>
    </section>
  );
};

export default FrontPage;
