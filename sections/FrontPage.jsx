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

  return (
    <section className={`text-[12px] min-h-screen h-[100%]`}>
      <div className="">
        <div className="grid lg:grid-cols-6 gap-0 sm:grid-cols-1 md:grid-cols-1">
          <div className="hidden lg:block col-span-1">
            <Sidebar
              createNewUser={createNewUser}
              setCreateNewUser={setCreateNewUser}
              forgotPassword={forgotPassword}
              setForgotPassword={setForgotPassword}
              currentUserSession={props.currentUserSession}
              currentUserSessionState={props.currentUserSessionState}
              currentUserProfile={props.currentUserProfile}
            />
          </div>
          <div className="col-span-4 bg-gray-200 rounded-[0px] py-4 px-4">
            <Forum
              createNewUser={createNewUser}
              setCreateNewUser={setCreateNewUser}
              forgotPassword={forgotPassword}
              setForgotPassword={setForgotPassword}
              currentUserSession={props.currentUserSession}
              currentUserSessionState={props.currentUserSessionState}
              currentUserProfile={props.currentUserProfile}
            />
          </div>
          <div className="hidden lg:block col-span-1">
            <SidebarRight
              createNewUser={createNewUser}
              setCreateNewUser={setCreateNewUser}
              forgotPassword={forgotPassword}
              setForgotPassword={setForgotPassword}
              currentUserSession={props.currentUserSession}
              currentUserSessionState={props.currentUserSessionState}
              currentUserProfile={props.currentUserProfile}
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default FrontPage;
