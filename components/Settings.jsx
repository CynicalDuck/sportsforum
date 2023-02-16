// React functional component

// Imports
import React, { useState } from "react";
import { supabase } from "../lib/supabaseClient";

const Settings = (props) => {
  // States
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserUsername, setNewUserUsername] = useState("");
  const [newUserFullName, setNewUserFullName] = useState("");
  const [newUserPassword, setNewUserPassword] = useState("");
  const [newUserPasswordConfirm, setNewUserPasswordConfirm] = useState("");

  // Functions
  // Save settings
  async function onClickSaveSettings(newImgUrl) {
    var newEmail = props.currentUserSession?.user?.email;
    var oldUserName = props.currentUserProfile?.user_name;
    var newUserName = props.currentUserProfile?.user_name;
    var newPassword = null;

    // Check if email is changed
    if (newUserEmail) {
      newEmail = newUserEmail;
    }
    // Check if username is changed
    if (newUserUsername) {
      newUserName = newUserUsername;
    }
    // Check if password is changed and then check if it matches and is valid
    if (newUserPassword && newUserPasswordConfirm) {
      if (newUserPassword === newUserPasswordConfirm) {
        if (newUserPassword.length >= 6) {
          newPassword = newUserPassword;
        } else {
          props.handleError("Passordet må være minst 6 tegn");
        }
      } else {
        props.handleError("Passordene er ikke like");
      }
    }

    // Update user
    const { data, error } = await supabase.auth.updateUser({
      email: newEmail,
      password: newPassword,
    });

    if (error) {
      props.handleError(error.message);
    }
    if (!error) {
      // Update user profile
      const { error: errorProfile } = await supabase
        .from("users")
        .update({
          user_name: newUserName,
        })
        .eq("user_id", props.currentUserSession?.user?.id);

      if (errorProfile) {
        props.handleError(errorProfile.message);
      }

      if (!errorProfile) {
        // Update all post, discussions and comments created by user
        const { error: errorDiscussion } = await supabase
          .from("discussions")
          .update({
            created_by: newUserName,
          })
          .eq("created_by_id", props.currentUserSession?.user?.id);

        if (errorDiscussion) {
          props.handleError(errorDiscussion.message);
        }

        const { error: errorDiscussionLastPostBy } = await supabase
          .from("discussions")
          .update({
            last_post_by: newUserName,
          })
          .eq("last_post_by", oldUserName);

        const { error: errorPost } = await supabase
          .from("posts")
          .update({
            created_by: newUserName,
            created_by_avatar_url: newImgUrl
              ? newImgUrl
              : props.currentUserProfile?.avatar_url,
          })
          .eq("created_by_id", props.currentUserSession?.user?.id);

        if (errorPost) {
          props.handleError(errorPost.message);
        }

        const { error: errorFolder } = await supabase

          .from("folders")
          .update({
            created_by: newUserName,
          })
          .eq("created_by_id", props.currentUserSession?.user?.id);

        if (errorFolder) {
          props.handleError(errorFolder.message);
        }

        if (!errorDiscussion && !errorPost && !errorFolder) {
          props.handleSuccess("Brukeren er oppdatert");
        }
      }
    }
  }

  // Upload avatar
  async function uploadAvatar(e) {
    const avatarFile = e.target.files[0];

    // Check if file is an image
    if (!avatarFile.type.includes("image")) {
      props.handleError("Bildet er ikke et av de tillatte formatene");
      // Check if file is smaller than 1MB
      if (avatarFile.size > 1000000) {
        props.handleError("Bildet er for stort. Maks 1MB");
      }
    }

    // Deletes all files in bucket
    const { data: dataList, error: errorList } = await supabase.storage
      .from("images")
      .list(props.currentUserSession?.user?.id, {
        limit: 100,
        offset: 0,
        sortBy: { column: "name", order: "asc" },
      });

    dataList.forEach(async (file) => {
      const { error: errorDelete } = await supabase.storage
        .from("images")
        .remove([props.currentUserSession?.user?.id + "/" + file.name]);
    });

    // Upload image to storage
    const { data, error } = await supabase.storage
      .from("images")
      .upload(
        "/" + props.currentUserSession?.user?.id + "/" + avatarFile.name,
        avatarFile,
        {
          cacheControl: "3600",
          upsert: false,
        }
      );

    if (error) {
      if (error.message === "The resource already exists") {
        // Gets the url of the uploaded image
        const { data: dataUrl, error: errorUrl } = supabase.storage
          .from("images")
          .getPublicUrl(
            "/" + props.currentUserSession?.user?.id + "/" + avatarFile.name
          );

        if (errorUrl) {
          props.handleError(
            errorFile.message +
              " ( Feil oppstått under henting av public url for bilde )"
          );
        }

        if (!errorUrl) {
          // Update user profile
          const { data: dataProfile, error: errorProfile } = await supabase
            .from("users")
            .update({
              avatar_url: dataUrl.publicUrl,
              avatar_name: avatarFile.name,
            })
            .eq("user_id", props.currentUserSession?.user?.id);

          if (errorProfile) {
            props.handleError(errorProfile.message);
          }

          if (!errorProfile) {
            onClickSaveSettings(dataUrl.publicUrl);
            props.handleSuccess(
              "Bildet er lastet opp, du må oppdatere siden for å se endringene."
            );
          }
        }
      } else {
        props.handleError(error.message);
      }
    }

    if (!error) {
      // Gets the url of the uploaded image
      const { data: dataUrl, error: errorUrl } = supabase.storage
        .from("images")
        .getPublicUrl(
          "/" + props.currentUserSession?.user?.id + "/" + avatarFile.name
        );

      if (errorUrl) {
        props.handleError(
          errorFile.message +
            " ( Feil oppstått under henting av public url for bilde )"
        );
      }

      if (!errorUrl) {
        // Update user profile
        const { data: dataProfile, error: errorProfile } = await supabase
          .from("users")
          .update({
            avatar_url: dataUrl.publicUrl,
            avatar_name: avatarFile.name,
          })
          .eq("user_id", props.currentUserSession?.user?.id);

        if (errorProfile) {
          props.handleError(errorProfile.message);
        }

        if (!errorProfile) {
          onClickSaveSettings(dataUrl.publicUrl);
          props.handleSuccess(
            "Bildet er lastet opp, du må oppdatere siden for å se endringene."
          );
        }
      }
    }
  }

  // Checkbox change right sidebar in discussions
  async function changeHideRightSidebarInDiscussion(value, profile) {
    const { data: dataProfile, error: errorProfile } = await supabase
      .from("users")
      .update({
        hide_right_sidebar_in_discussion: value,
      })
      .eq("user_id", profile.user_id);

    if (errorProfile) {
      props.handleError(errorProfile.message);
    }

    if (!errorProfile) {
      props.handleSuccess("Brukeren er oppdatert");
    }
  }

  // Checkbox change move right sidebar to left
  async function changeMoveRightSidebar(value, profile) {
    const { data: dataProfile, error: errorProfile } = await supabase
      .from("users")
      .update({
        move_right_sidebar_to_left: value,
      })
      .eq("user_id", profile.user_id);

    if (errorProfile) {
      props.handleError(errorProfile.message);
    }

    if (!errorProfile) {
      props.handleSuccess("Brukeren er oppdatert");
    }
  }

  // Checkbox change hide donation widget
  async function changeHideDonationWidget(value, profile) {
    const { data: dataProfile, error: errorProfile } = await supabase
      .from("users")
      .update({
        hide_donation_widget: value,
      })
      .eq("user_id", profile.user_id);

    if (errorProfile) {
      props.handleError(errorProfile.message);
    }

    if (!errorProfile) {
      props.handleSuccess("Brukeren er oppdatert");
    }
  }

  return (
    <section className={``}>
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-6 gap-4">
          <div className="col-span-1"></div>
          <div className="col-span-4 bg-white rounded-[24px] py-4 px-4">
            <div className="flex flex-col gap-1">
              <input
                className="border border-gray-300 rounded-[24px] px-4 py-2 focus:outline-indigo-500 mt-2 w-full"
                type="email"
                placeholder="E-post"
                defaultValue={props.currentUserSession?.user?.email}
                required
                onChange={(e) => {
                  setNewUserEmail(e.target.value);
                }}
              />
              <div className="text-gray-400 text-[0.7rem]">
                Dette er eposten du bruker for å logge inn på forumet.
              </div>
              <input
                className="border border-gray-300 rounded-[24px] px-4 py-2 focus:outline-indigo-500 mt-2 w-full"
                type="text"
                placeholder="Brukernavn"
                defaultValue={props.currentUserProfile?.user_name}
                required
                onChange={(e) => {
                  setNewUserUsername(e.target.value);
                }}
              />
              <div className="text-gray-400 text-[0.7rem]">
                Her kan du endre ditt brukernavn, dette er navnet som er synlig
                for alle andre på forumet.
              </div>
              <input
                className="border border-gray-300 rounded-[24px] px-4 py-2 focus:outline-indigo-500 mt-2 w-full"
                type="text"
                placeholder="Navn"
                disabled
                defaultValue={
                  props.currentUserSession?.user?.user_metadata?.full_name
                }
                required
                onChange={(e) => {
                  setNewUserFullName(e.target.value);
                }}
              />
              <div className="text-gray-400 text-[0.7rem]">
                Du kan ikke endre navnet ditt, vennligst kontakt oss dersom du
                ønsker å endre dette.
              </div>
              <input
                onChange={(e) => uploadAvatar(e)}
                className="border border-gray-300 rounded-[24px] px-4 py-2 focus:outline-indigo-500 mt-2 w-full"
                type="file"
                accept="image/*"
              />
              <div className="text-gray-400 text-[0.7rem]">Profilbilde</div>
              <div className="flex flex-col gap-2 mt-4">
                <div className="flex flex-row gap-2">
                  <div>
                    Skjul høyre sideboks automatisk i trådvisning. Dette vil gi
                    deg større plass.
                  </div>
                  <input
                    className="object-center"
                    type="checkbox"
                    id={props.currentUserProfile?.user_id}
                    name={
                      "checkbox_hide_sidebar_" +
                      props.currentUserProfile?.user_id
                    }
                    defaultChecked={
                      props.currentUserProfile?.hide_right_sidebar_in_discussion
                    }
                    onChange={(e) => {
                      changeHideRightSidebarInDiscussion(
                        e.target.checked,
                        props.currentUserProfile
                      );
                    }}
                  />
                </div>
                <div className="flex flex-row gap-2">
                  <div>
                    Flytt innholdet i høyre sideboks til venstre sideboks. Merk
                    at dette vil fjerne innholdet i venstre sideboks.
                  </div>
                  <input
                    className="object-center"
                    type="checkbox"
                    id={props.currentUserProfile?.user_id}
                    name={
                      "checkbox_hide_sidebar_" +
                      props.currentUserProfile?.user_id
                    }
                    defaultChecked={
                      props.currentUserProfile?.move_right_sidebar_to_left
                    }
                    onChange={(e) => {
                      changeMoveRightSidebar(
                        e.target.checked,
                        props.currentUserProfile
                      );
                    }}
                  />
                </div>
                <div className="flex flex-row gap-2">
                  <div>
                    Fjern "Støtt drift og utvikling" boksen fra høyre sidemeny
                  </div>
                  <input
                    className="object-center"
                    type="checkbox"
                    id={props.currentUserProfile?.user_id}
                    name={
                      "checkbox_hide_donation_" +
                      props.currentUserProfile?.user_id
                    }
                    defaultChecked={
                      props.currentUserProfile?.hide_donation_widget
                    }
                    onChange={(e) => {
                      changeHideDonationWidget(
                        e.target.checked,
                        props.currentUserProfile
                      );
                    }}
                  />
                </div>
              </div>
              <input
                className="border border-gray-300 rounded-[24px] px-4 py-2 focus:outline-indigo-500 mt-2 w-full"
                type="password"
                placeholder="Nytt passord"
                required
                onChange={(e) => {
                  setNewUserPassword(e.target.value);
                }}
              />
              <input
                className="border border-gray-300 rounded-[24px] px-4 py-2 focus:outline-indigo-500 mt-1 w-full"
                type="password"
                placeholder="Bekreft nytt passord"
                required
                onChange={(e) => {
                  setNewUserPasswordConfirm(e.target.value);
                }}
              />
              <div className="flex flex-row gap-2 mt-6">
                <button
                  type="button"
                  className="bg-red-500 text-white rounded-[24px] px-4 py-2"
                  onClick={() => props.setShowSettings(false)}
                >
                  Avbryt
                </button>
                <button
                  type="submit"
                  className="bg-indigo-500 text-white rounded-[24px] px-4 py-2"
                  onClick={() => onClickSaveSettings()}
                >
                  Oppdater bruker
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Settings;
