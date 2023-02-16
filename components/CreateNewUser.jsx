// React functional component

// Imports
import React, { useState } from "react";
import { supabase } from "../lib/supabaseClient";

const CreateNewUser = (props) => {
  // States
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserUsername, setNewUserUsername] = useState("");
  const [newUserFullName, setNewUserFullName] = useState("");
  const [newUserPassword, setNewUserPassword] = useState("");
  const [newUserPasswordConfirm, setNewUserPasswordConfirm] = useState("");

  // Functions

  // Create new user
  async function onClickSubmitNewUser() {
    if (newUserPassword === newUserPasswordConfirm) {
      if (newUserPassword.length >= 6) {
        const { data, error } = await supabase.auth.signUp({
          email: newUserEmail,
          password: newUserPassword,
          options: {
            data: {
              user_name: newUserUsername,
              full_name: newUserFullName,
            },
          },
        });
        if (error) {
          props.handleError(error.message);
        }
        if (!error) {
          props.handleSuccess(
            "Din bruker er opprettet. Du vil få en epost du må bekrefte."
          );
          setTimeout(() => {
            //window.location.reload();
          }, 3000);
        }
      } else {
        props.handleError("Passordet er for kort. Minst 6 tegn.");
      }
    } else {
      props.handleError("Passordene er ikke like.");
    }
  }

  return (
    <section className={``}>
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-6 gap-4">
          <div className="col-span-1"></div>
          <div className="col-span-4 bg-white rounded-[24px] py-4 px-4">
            <input
              className="border border-gray-300 rounded-[24px] px-4 py-2 focus:outline-indigo-500 mt-2 w-full"
              type="email"
              placeholder="E-post"
              required
              onChange={(e) => {
                setNewUserEmail(e.target.value);
              }}
            />
            <div className="text-gray-400 text-[0.7rem]">
              Det er din e-post adresse som du vil måtte benytte ved pålogging
            </div>
            <input
              className="border border-gray-300 rounded-[24px] px-4 py-2 focus:outline-indigo-500 mt-2 w-full"
              type="text"
              placeholder="Brukernavn"
              required
              onChange={(e) => {
                setNewUserUsername(e.target.value);
              }}
            />
            <div className="text-gray-400 text-[0.7rem]">
              Brukernavnet ditt er det alle vil kjenne deg som på forumet. Dette
              kan endres senere.
            </div>
            <input
              className="border border-gray-300 rounded-[24px] px-4 py-2 focus:outline-indigo-500 mt-2 w-full"
              type="text"
              placeholder="Navn"
              required
              onChange={(e) => {
                setNewUserFullName(e.target.value);
              }}
            />
            <div className="text-gray-400 text-[0.7rem]">
              Dette må være korrekt.
            </div>
            <input
              className="border border-gray-300 rounded-[24px] px-4 py-2 focus:outline-indigo-500 mt-2 w-full"
              type="password"
              placeholder="Bekreft passord"
              required
              onChange={(e) => {
                setNewUserPassword(e.target.value);
              }}
            />
            <input
              className="border border-gray-300 rounded-[24px] px-4 py-2 focus:outline-indigo-500 mt-1 w-full"
              type="password"
              placeholder="Passord"
              required
              onChange={(e) => {
                setNewUserPasswordConfirm(e.target.value);
              }}
            />
            <div className="flex flex-row gap-2 mt-6">
              <button
                type="button"
                className="bg-red-500 text-white rounded-[24px] px-4 py-2"
                onClick={() => props.setCreateNewUser(false)}
              >
                Avbryt
              </button>
              <button
                type="submit"
                className="bg-indigo-500 text-white rounded-[24px] px-4 py-2"
                onClick={() => onClickSubmitNewUser()}
              >
                Registrer deg
              </button>
            </div>
            <div className="text-gray-400 text-[0.7rem] mt-2">
              Etter at du har registrert din bruker vil vi sende deg en e-post
              for å bekrefte din identitet. Dersom du ikke har fått en e-post
              innen 5 minutter, sjekk søppelposten din.
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CreateNewUser;
