"use client";

import { supabase } from "../lib/supabaseClient";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import Sidebar from "../components/Sidebar";
import { SidebarRight } from "../components";
import { Forum } from "../components";

const FrontPage = (props) => {
  const [createNewUser, setCreateNewUser] = useState(false);
  const [forgotPassword, setForgotPassword] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserUsername, setNewUserUsername] = useState("");
  const [newUserFullName, setNewUserFullName] = useState("");
  const [newUserPassword, setNewUserPassword] = useState("");
  const [newUserPasswordConfirm, setNewUserPasswordConfirm] = useState("");
  const [newPasswordValid, setNewPasswordValid] = useState(false);

  const searchParams = useSearchParams();

  return (
    <section
      className={`text-[12px] min-h-screen h-[100%] min-w-screen w-[100%]`}
    >
      <div className="">
        <div className="grid lg:grid-cols-6 gap-0 sm:grid-cols-1 md:grid-cols-1">
          <div className="hidden lg:block col-span-1">
            {props.currentUserProfile?.move_right_sidebar_to_left ? (
              <SidebarRight
                boardSettings={props.boardSettings}
                createNewUser={createNewUser}
                setCreateNewUser={setCreateNewUser}
                forgotPassword={forgotPassword}
                setForgotPassword={setForgotPassword}
                currentUserSession={props.currentUserSession}
                currentUserSessionState={props.currentUserSessionState}
                currentUserProfile={props.currentUserProfile}
                showSettings={showSettings}
                setShowSettings={setShowSettings}
                showAdmin={showAdmin}
                setShowAdmin={setShowAdmin}
                handleError={props.handleError}
                showError={props.showError}
                errorMessage={props.errorMessage}
                handleSuccess={props.handleSuccess}
                showMessage={props.showMessage}
                message={props.message}
              />
            ) : (
              <Sidebar
                boardSettings={props.boardSettings}
                createNewUser={createNewUser}
                setCreateNewUser={setCreateNewUser}
                forgotPassword={forgotPassword}
                setForgotPassword={setForgotPassword}
                currentUserSession={props.currentUserSession}
                currentUserSessionState={props.currentUserSessionState}
                currentUserProfile={props.currentUserProfile}
                showSettings={showSettings}
                setShowSettings={setShowSettings}
                showAdmin={showAdmin}
                setShowAdmin={setShowAdmin}
                handleError={props.handleError}
                showError={props.showError}
                errorMessage={props.errorMessage}
                handleSuccess={props.handleSuccess}
                showMessage={props.showMessage}
                message={props.message}
              />
            )}
          </div>

          <div
            className={
              props.currentUserProfile?.move_right_sidebar_to_left ||
              (searchParams.get("folder") !== null &&
                searchParams.get("discussion") !== null &&
                props.currentUserProfile?.hide_right_sidebar_in_discussion)
                ? "col-span-5 bg-gray-200 rounded-[0px] py-4 px-4"
                : "col-span-4 bg-gray-200 rounded-[0px] py-4 px-4"
            }
          >
            <Forum
              boardSettings={props.boardSettings}
              render={props.render}
              setRender={props.setRender}
              createNewUser={createNewUser}
              setCreateNewUser={setCreateNewUser}
              forgotPassword={forgotPassword}
              setForgotPassword={setForgotPassword}
              currentUserSession={props.currentUserSession}
              currentUserSessionState={props.currentUserSessionState}
              currentUserProfile={props.currentUserProfile}
              showSettings={showSettings}
              setShowSettings={setShowSettings}
              showAdmin={showAdmin}
              setShowAdmin={setShowAdmin}
              handleError={props.handleError}
              showError={props.showError}
              errorMessage={props.errorMessage}
              handleSuccess={props.handleSuccess}
              showMessage={props.showMessage}
              message={props.message}
            />
            <div className="block sm:block md:block lg:hidden col-span-1">
              <SidebarRight
                createNewUser={createNewUser}
                setCreateNewUser={setCreateNewUser}
                forgotPassword={forgotPassword}
                setForgotPassword={setForgotPassword}
                currentUserSession={props.currentUserSession}
                currentUserSessionState={props.currentUserSessionState}
                currentUserProfile={props.currentUserProfile}
                showSettings={showSettings}
                setShowSettings={setShowSettings}
                showAdmin={showAdmin}
                setShowAdmin={setShowAdmin}
                handleError={props.handleError}
                showError={props.showError}
                errorMessage={props.errorMessage}
                handleSuccess={props.handleSuccess}
                showMessage={props.showMessage}
                message={props.message}
              />
            </div>
          </div>
          {props.currentUserProfile?.move_right_sidebar_to_left ||
          (searchParams.get("folder") !== null &&
            searchParams.get("discussion") !== null &&
            props.currentUserProfile
              ?.hide_right_sidebar_in_discussion) ? null : (
            <div className="hidden lg:block col-span-1">
              <SidebarRight
                boardSettings={props.boardSettings}
                createNewUser={createNewUser}
                setCreateNewUser={setCreateNewUser}
                forgotPassword={forgotPassword}
                setForgotPassword={setForgotPassword}
                currentUserSession={props.currentUserSession}
                currentUserSessionState={props.currentUserSessionState}
                currentUserProfile={props.currentUserProfile}
                showSettings={showSettings}
                setShowSettings={setShowSettings}
                showAdmin={showAdmin}
                setShowAdmin={setShowAdmin}
                handleError={props.handleError}
                showError={props.showError}
                errorMessage={props.errorMessage}
                handleSuccess={props.handleSuccess}
                showMessage={props.showMessage}
                message={props.message}
              />
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default FrontPage;
