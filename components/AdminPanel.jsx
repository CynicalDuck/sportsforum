// React functional component

// Imports
import React, { useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import {
  faCheck,
  faPen,
  faPlus,
  faTrashCan,
} from "@fortawesome/free-solid-svg-icons";

const AdminPanel = (props) => {
  // States
  const [boardTitle, setBoardTitle] = useState(
    props.boardSettings?.board_title
  );
  const [boardSubTitle, setBoardSubTitle] = useState(
    props.boardSettings?.board_subtitle
  );
  const [globalAnnouncements, setGlobalAnnouncements] = useState(null);
  const [editAnnouncementId, setEditAnnouncementId] = useState(null);
  const [editAnnouncementContent, setEditAnnouncementContent] = useState(null);

  // Use effect
  useEffect(() => {
    getAnnouncements();
  }, []);

  // Functions
  // Get announcements
  async function getAnnouncements() {
    const { data: dataAnnouncements, error: errorAnnouncements } =
      await supabase.from("announcements").select("*");

    if (errorAnnouncements) {
      props.handleError(errorAnnouncements.message);
    }

    if (dataAnnouncements) {
      setGlobalAnnouncements(dataAnnouncements);
    }
  }

  // Add announcement
  async function addAnnouncement() {
    const { data: dataAnnouncement, error: errorAnnouncement } = await supabase
      .from("announcements")
      .insert({
        content: "Ny melding",
      });

    if (errorAnnouncement) {
      props.handleError(errorAnnouncement.message);
    }

    if (!errorAnnouncement) {
      props.handleSuccess("Meldingen er lagt til");
      getAnnouncements();
    }
  }

  // Edit announcement
  async function editAnnouncement(announcement) {
    if (!editAnnouncementId) {
      setEditAnnouncementContent(announcement.content);
      setEditAnnouncementId(announcement.id);
    } else {
      const { data: dataAnnouncement, error: errorAnnouncement } =
        await supabase
          .from("announcements")
          .update({
            content: editAnnouncementContent,
          })
          .eq("id", editAnnouncementId);

      if (errorAnnouncement) {
        props.handleError(errorAnnouncement.message);
      }

      if (!errorAnnouncement) {
        props.handleSuccess("Oppdatering er lagret");
        setEditAnnouncementContent(null);
        setEditAnnouncementId(null);
        getAnnouncements();
      }
    }
  }

  // Delete announcement
  async function deleteAnnouncement(announcement) {
    const { data: dataAnnouncement, error: errorAnnouncement } = await supabase
      .from("announcements")
      .delete()
      .eq("id", announcement.id);

    if (errorAnnouncement) {
      props.handleError(errorAnnouncement.message);
    }

    if (!errorAnnouncement) {
      props.handleSuccess("Meldingen er slettet");
      getAnnouncements();
    }
  }

  // Save settings
  async function saveSettings() {
    if (boardTitle === null) {
      setBoardTitle(props.boardSettings?.board_title);
    }
    if (boardSubTitle === null) {
      setBoardSubTitle(props.boardSettings?.board_subtitle);
    }

    const { data: dataSettings, error: errorSettings } = await supabase
      .from("settings")
      .update({
        board_title: boardTitle,
        board_subtitle: boardSubTitle,
      })
      .eq("id", 1);

    if (errorSettings) {
      props.handleError(errorSettings.message);
    }

    if (!errorSettings) {
      props.handleSuccess("Innstillingene er oppdatert");
    }
  }

  // Change user is mod
  async function changeUserIsMod(value, profile) {
    const { data: dataProfile, error: errorProfile } = await supabase
      .from("users")
      .update({
        is_mod: value,
      })
      .eq("user_id", profile.user_id);

    if (errorProfile) {
      props.handleError(errorProfile.message);
    }

    if (!errorProfile) {
      props.handleSuccess("Brukeren er oppdatert");
    }
  }

  // Change user is admin
  async function changeUserIsAdmin(value, profile) {
    const { data: dataProfile, error: errorProfile } = await supabase
      .from("users")
      .update({
        is_admin: value,
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
    <section>
      <div className="container mx-auto px-4 text-gray-400 bg-white py-2 rounded-[14px]">
        <div className="text-[1rem] font-semibold">Administrator panel</div>
        <div className="flex flex-col gap-2 mt-3">
          <div className="text-[1rem]">Generelle innstillinger</div>
          <input
            type="text"
            id="first_name"
            className="border border-gray-300 rounded-[24px] px-4 py-2 focus:outline-indigo-500 mb-1 w-[100%]"
            placeholder="Hovedtittel forum"
            defaultValue={props.boardSettings?.board_title}
            onChange={(e) => setBoardTitle(e.target.value)}
          ></input>
          <input
            type="text"
            id="first_name"
            className="border border-gray-300 rounded-[24px] px-4 py-2 focus:outline-indigo-500 mb-1 w-[100%]"
            placeholder="Undertittel forum"
            defaultValue={props.boardSettings?.board_subtitle}
            onChange={(e) => setBoardSubTitle(e.target.value)}
          ></input>
          <div className="text-[1rem]">Globale kunngjøringer</div>
          {globalAnnouncements
            ? globalAnnouncements?.map((announcement, index) => (
                <div className="flex flex-row gap-2" key={index}>
                  {editAnnouncementId === announcement.id ? (
                    <input
                      type="text"
                      id={"announcement_" + announcement.id}
                      className="border border-gray-300 rounded-[24px] px-4 py-2 focus:outline-indigo-500 mb-1 w-[100%]"
                      placeholder="Tekst for kunngjøring"
                      defaultValue={editAnnouncementContent}
                      onChange={(e) =>
                        setEditAnnouncementContent(e.target.value)
                      }
                    ></input>
                  ) : (
                    <div className=" flex flex-col gap-2 text-[0.8rem] text-white bg-gray-500 px-2 py-2 rounded-[1rem]">
                      {announcement.content}
                    </div>
                  )}

                  <button
                    type="button"
                    className="bg-indigo-500 text-white rounded-[24px] px-4 py-2 hover:bg-indigo-600"
                    onClick={() => editAnnouncement(announcement)}
                  >
                    {editAnnouncementId ? (
                      <FontAwesomeIcon
                        icon={faCheck}
                        className="text-white text-[0.7rem]"
                      />
                    ) : (
                      <FontAwesomeIcon
                        icon={faPen}
                        className="text-white text-[0.7rem]"
                      />
                    )}
                  </button>
                  <button
                    type="button"
                    className="bg-red-500 text-white rounded-[24px] px-4 py-2 hover:bg-red-600"
                    onClick={() => deleteAnnouncement(announcement)}
                  >
                    <FontAwesomeIcon
                      icon={faTrashCan}
                      className="text-white text-[0.7rem]"
                    />
                  </button>
                  {index === globalAnnouncements.length - 1 ? (
                    <button
                      type="button"
                      className="bg-green-400 text-white rounded-[24px] px-4 py-2 hover:bg-red-600"
                      onClick={() => addAnnouncement()}
                    >
                      <FontAwesomeIcon
                        icon={faPlus}
                        className="text-white text-[0.7rem]"
                      />
                    </button>
                  ) : null}
                </div>
              ))
            : null}
          <div className="text-[1rem]">Rollestyring brukere</div>
          <div className="table-wrapper">
            <table className="fl-table">
              <thead>
                <tr>
                  <th>Brukernavn</th>
                  <th>Moderator</th>
                  <th>Administrator</th>
                </tr>
              </thead>
              <tbody>
                {props.allUserProfiles
                  ? props.allUserProfiles.map((profile) => (
                      <tr>
                        <td>{profile.user_name}</td>
                        <td>
                          <input
                            className="object-center"
                            type="checkbox"
                            disabled={profile.is_super}
                            id={profile.user_id}
                            name={"checkbox_is_mod_" + profile.user_id}
                            defaultChecked={profile.is_mod}
                            onChange={(e) => {
                              changeUserIsMod(e.target.checked, profile);
                            }}
                          />
                        </td>
                        <td>
                          <input
                            className="object-center"
                            type="checkbox"
                            disabled={profile.is_super}
                            id={profile.user_id}
                            name={"checkbox_is_admin_" + profile.user_id}
                            defaultChecked={profile.is_admin}
                            onChange={(e) => {
                              changeUserIsAdmin(e.target.checked, profile);
                            }}
                          />
                        </td>
                      </tr>
                    ))
                  : null}
              </tbody>
            </table>
          </div>
          <div className="flex flex-row gap-2 mt-6">
            <button
              type="button"
              className="bg-red-500 text-white rounded-[24px] px-4 py-2"
              onClick={() => props.setShowAdmin(false)}
            >
              Lukk administrator panelet
            </button>
            {boardTitle || boardSubTitle ? (
              <button
                type="button"
                className="bg-indigo-500 text-white rounded-[24px] px-4 py-2"
                onClick={() => saveSettings()}
              >
                Lagre
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
};

export default AdminPanel;
