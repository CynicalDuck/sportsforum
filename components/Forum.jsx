"use client";

// Import dependencies
import dynamic from "next/dynamic";
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { useState } from "react";
import { supabase } from "../lib/supabaseClient";
import Moment from "react-moment";
import "moment-timezone";
import { Editor } from "@tinymce/tinymce-react";
import "@fortawesome/fontawesome-svg-core/styles.css";
import { config } from "@fortawesome/fontawesome-svg-core";
config.autoAddCss = false;
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import {
  faFolder,
  faInfo,
  faClock,
  faUser,
  faMessage,
  faTicket,
  faPen,
} from "@fortawesome/free-solid-svg-icons";

// Import components
import CreateNewUser from "./CreateNewUser";
import Settings from "./Settings";
import AdminPanel from "./AdminPanel";
import Posts from "./Posts";
import Folders from "./Folders";

const Forum = (props) => {
  const editorRef = useRef(null);
  const [userProfile, setUserProfile] = useState(null);
  const [allUserProfiles, setAllUserProfiles] = useState(null);
  const [newUserEmail, setNewUserEmail] = useState("");
  const [resetPasswordSuccess, setResetPasswordSuccess] = useState(false);
  const [createNewFolder, setCreateNewFolder] = useState(false);
  const [createNewFolderName, setCreateNewFolderName] = useState("");
  const [createNewFolderDescription, setCreateNewFolderDescription] =
    useState("");
  const [createNewSubFolder, setCreateNewSubFolder] = useState(false);
  const [discussions, setDiscussions] = useState(null);
  const [selectedDiscussionId, setSelectedDiscussionId] = useState(null);
  const [selectedDiscussion, setSelectedDiscussion] = useState(null);
  const [selectedDiscussionPosts, setSelectedDiscussionPosts] = useState(null);
  const [createNewDiscussion, setCreateNewDiscussion] = useState(false);
  const [createNewDiscussionTitle, setCreateNewDiscussionTitle] = useState("");
  const [createNewDiscussionDescription, setCreateNewDiscussionDescription] =
    useState("");
  const [folders, setFolders] = useState(null);
  const [selectedFolderId, setSelectedFolderId] = useState(null);
  const [selectedFolder, setSelectedFolder] = useState(null);
  const [editFolder, setEditFolder] = useState(false);
  const [folderDeleteConfirmation, setFolderDeleteConfirmation] =
    useState(null);

  // Get URL parameters
  const router = useRouter();
  const searchParams = useSearchParams();
  if (searchParams.get("folder") !== null) {
    if (!selectedFolderId) {
      setSelectedFolderId(searchParams.get("folder"));
    }
  }
  if (searchParams.get("discussion") !== null) {
    if (!selectedDiscussionId) {
      setSelectedDiscussionId(searchParams.get("discussion"));
    }
  }
  if (searchParams.get("post") !== null) {
    window.onload = function () {
      // set timeout
      setTimeout(function () {
        document
          .getElementById(parseInt(searchParams.get("post")) - 1)
          ?.scrollIntoView();
      }, 500);
    };
  }

  useEffect(() => {
    if (selectedFolderId) {
      fetchSelectedFolder();
    }
    if (selectedDiscussionId) {
      fetchSelectedDiscussion();
      fetchSelectedDiscussionPosts();
    }

    if (!userProfile) {
      fetchUserProfile();
    }
  });

  // If the user is admin, load all user profiles for the administrator panel
  if (
    props.currentUserProfile &&
    props.currentUserProfile.is_admin &&
    !allUserProfiles
  ) {
    if (!allUserProfiles) {
      fetchAllUserProfiles();
    }
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

  // Get the selected folder
  async function fetchSelectedFolder() {
    if (selectedFolderId !== 0) {
      const { data, error } = await supabase
        .from("folders")
        .select()
        .eq("id", selectedFolderId);

      if (data && !error && !selectedFolder) {
        setSelectedFolder(data[0]);
        fetchSelectedFolderDiscussions();
      }

      if (error) {
        props.handleError(error.message);
      }
    }
  }

  // Get the selected folders discussions
  async function fetchSelectedFolderDiscussions() {
    const { data, error } = await supabase
      .from("discussions")
      .select()
      .eq("parent_folder", selectedFolderId)
      .order("last_post_at", { ascending: false, nullsFirst: false });

    if (data && !error && !selectedFolder) {
      setDiscussions(data);
    }

    if (error) {
      props.handleError(error.message);
    }
  }

  // Get the selected discussion
  async function fetchSelectedDiscussion() {
    const { data, error } = await supabase
      .from("discussions")
      .select()
      .eq("id", selectedDiscussionId);

    if (data && !error && !selectedFolder) {
      setSelectedDiscussion(data[0]);
    }

    if (error) {
      props.handleError(error.message);
    }
  }

  // Get the selected discussion posts
  async function fetchSelectedDiscussionPosts() {
    const { data, error } = await supabase
      .from("posts")
      .select()
      .eq("discussion", selectedDiscussionId)
      .order("created_at", { ascending: true });

    if (data && !error && !selectedFolder) {
      setSelectedDiscussionPosts(data);
    }

    if (error) {
      props.handleError(error.message);
    }
  }

  // Send reset email
  async function onClickResetPassword() {
    if (newUserEmail) {
      const { data, error } = await supabase.auth.resetPasswordForEmail(
        newUserEmail,
        {
          redirectTo: "http://localhost:3000?update-password=true",
        }
      );

      if (error) {
        props.handleError(error.message);
      }

      if (data) {
        props.handleSuccess(
          "Passord reset lenke blir sendt til epost dersom den eksisterer i systemet."
        );
        setTimeout(() => {
          setResetPasswordSuccess(true);
        }, 3000);
      }
    }
  }

  // Create new folder
  async function createFolder(parent) {
    var currentParrentArray = [];
    if (parent === 0) {
      currentParrentArray.push({ id: 0, name: "Forsiden" });
    } else if (parent !== 0) {
      const { data, error } = await supabase
        .from("folders")
        .select()
        .eq("id", parent);

      if (error) {
        props.handleError(error.message);
      }

      if (data) {
        data[0].parent_array.forEach((arrayItem) => {
          currentParrentArray.push({
            id: parseInt(arrayItem.id),
            name: arrayItem.name,
          });
        });

        currentParrentArray.push({
          id: parseInt(data[0].id),
          name: data[0].name,
        });
      }
    }

    if (
      createNewFolderName?.length > 1 &&
      createNewFolderDescription?.length > 1
    ) {
      const { data: dataFolder, error: errorFolder } = await supabase
        .from("folders")
        .insert({
          name: createNewFolderName,
          description: createNewFolderDescription,
          created_by: props.currentUserProfile.user_name
            ? props.currentUserProfile.user_name
            : props.currentUserSession?.user?.user_metadata?.user_name,
          parent: parent,
          parent_array: currentParrentArray,
          created_by_id: props.currentUserSession?.user?.id,
        });

      if (errorFolder) {
        props.handleError(errorFolder.message);
      }
      if (!errorFolder) {
        props.handleSuccess("Mappen " + createNewFolderName + " er opprettet.");
      }

      if (folders) {
        setFolders(null);
      }
      setCreateNewFolder(false);
      setCreateNewSubFolder(false);
      setCreateNewFolderName("");
      setCreateNewFolderDescription("");
      window.location.reload();
    }
  }

  // Create new discussion
  async function createDiscussion() {
    if (createNewDiscussionTitle?.length > 1) {
      const { data, error } = await supabase
        .from("discussions")
        .insert({
          title: createNewDiscussionTitle,
          description: createNewDiscussionDescription,
          created_by: props.currentUserProfile.user_name
            ? props.currentUserProfile.user_name
            : props.currentUserSession?.user?.user_metadata?.user_name,
          parent_folder: selectedFolderId,
          total_posts: 1,
          last_post_at: new Date(),
          last_post_by: props.currentUserProfile.user_name
            ? props.currentUserProfile.user_name
            : props.currentUserSession?.user?.user_metadata?.user_name,
          created_by_id: props.currentUserSession?.user?.id,
        })
        .select();

      if (error) {
        props.handleError(error.message);
      }
      if (!error) {
        // Creating the first post in the discussion
        if (data) {
          if (editorRef.current.getContent().length > 1) {
            const { data: dataPost, error: errorPost } = await supabase
              .from("posts")
              .insert({
                content: editorRef.current.getContent(),
                created_by: props.currentUserProfile.user_name
                  ? props.currentUserProfile.user_name
                  : props.currentUserSession?.user?.user_metadata?.user_name,
                discussion: data[0].id,
                created_by_id: props.currentUserSession?.user?.id,
                created_by_avatar_url: props.currentUserProfile?.avatar_url,
              });

            if (errorPost) {
              props.handleError(errorPost.message);
            }
            if (!errorPost) {
              // Update folder with new post

              const { data: dataFolder, error: errorFolder } = await supabase
                .from("folders")
                .update({
                  last_post_at: new Date(),
                  total_posts: 1,
                  last_post_by: props.currentUserProfile.user_name
                    ? props.currentUserProfile.user_name
                    : props.currentUserSession?.user?.user_metadata?.user_name,
                })
                .eq("id", selectedFolderId);

              if (errorFolder) {
                props.handleError(errorFolder.message);
              }
              if (!errorFolder) {
                props.handleSuccess(
                  "Tråden " + createNewDiscussionTitle + " er opprettet."
                );
                if (discussions) {
                  setDiscussions(null);
                }
                setCreateNewDiscussion(false);
                setCreateNewDiscussionTitle("");
                setCreateNewDiscussionDescription("");
                window.location.reload();
              }
            }
          }
        }
      }
    }
  }

  // Fetch all user profiles
  async function fetchAllUserProfiles() {
    const { data: dataProfiles, error: errorProfiles } = await supabase
      .from("users")
      .select("*");

    if (errorProfiles) {
      props.handleError(errorProfiles.message);
    }

    if (!errorProfiles) {
      setAllUserProfiles(dataProfiles);
    }
  }

  // Save folder edit
  async function saveFolderEdit(folder) {
    const { data, error } = await supabase
      .from("folders")
      .update({
        name: document.getElementById("folder_title").value,
        description: document.getElementById("folder_description").value,
        modified: new Date(),
      })
      .eq("id", folder.id);

    if (error) {
      props.handleError(error.message);
    }

    if (!error) {
      props.handleSuccess("Mappen " + folder.name + " er oppdatert.");
      setEditFolder(false);
      window.location.reload();
    }
  }

  // Delete folder by setting deleted to true
  async function deleteFolder(folder) {
    const { data, error } = await supabase
      .from("folders")
      .update({
        deleted: true,
        modified: new Date(),
      })
      .eq("id", folder.id);

    if (error) {
      props.handleError(error.message);
    }

    if (!error) {
      props.handleSuccess("Mappen " + folder.name + " er slettet.");
      setEditFolder(false);
      window.location.href = "/";
    }
  }

  if (props.createNewUser) {
    return (
      <CreateNewUser
        setCreateNewUser={props.setCreateNewUser}
        handleError={props.handleError}
        handleSuccess={props.handleSuccess}
      />
    );
  }

  if (props.forgotPassword) {
    return resetPasswordSuccess ? (
      <section className={`relative`}>
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-6 gap-4">
            <div className="col-span-1"></div>
            <div className="col-span-4 bg-white rounded-[24px] py-4 px-4">
              <div className="text-secondary-text text-[0.7rem] mb-2">
                Epost: {newUserEmail}
              </div>
              <div className="text-secondary-text text-[0.7rem]">
                Dersom din epost eksisterer i vårt system vil du få en e-post
                med en lenke slik at du får logget på systemet og tilbakestilt
                ditt passord. Om du ikke har fått denne eposten innen 5
                minutter, sjekk søppelposten din.
              </div>
            </div>
          </div>
        </div>
      </section>
    ) : (
      <section className={`relative`}>
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-6 gap-4">
            <div className="col-span-1"></div>
            <div className="col-span-4 bg-white rounded-[24px] py-4 px-4">
              <input
                className="border border-gray-300 rounded-[24px] px-4 py-2 focus:outline-primary-indigo mt-2 w-full"
                type="email"
                placeholder="E-post"
                required
                onChange={(e) => {
                  setNewUserEmail(e.target.value);
                }}
              />
              <div className="text-secondary-text text-[0.7rem]">
                Skriv inn din epost adresse og vi vil sende deg en e-post slik
                au får logget inn og tilbakestilt ditt passord.
              </div>

              <div className="flex flex-row gap-2 mt-6">
                <button
                  type="button"
                  className="bg-red-500 text-white rounded-[24px] px-4 py-2"
                  onClick={() => props.setForgotPassword(false)}
                >
                  Avbryt
                </button>
                <button
                  type="submit"
                  className="bg-primary-indigo text-white rounded-[24px] px-4 py-2"
                  onClick={() => onClickResetPassword()}
                >
                  Send reset e-post
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (props.showSettings) {
    return (
      <Settings
        currentUserSession={props.currentUserSession}
        currentUserProfile={
          userProfile ? userProfile : props.currentUserProfile
        }
        handleError={props.handleError}
        handleSuccess={props.handleSuccess}
        setShowSettings={props.setShowSettings}
      />
    );
  }

  if (props.showAdmin) {
    return (
      <AdminPanel
        boardSettings={props.boardSettings}
        setShowAdmin={props.setShowAdmin}
        allUserProfiles={allUserProfiles}
        handleError={props.handleError}
        handleSuccess={props.handleSuccess}
      />
    );
  }

  if (createNewSubFolder) {
    return (
      <section className={`relative`}>
        <div className="flex flex-col">
          <div className="text-black font-semibold">
            Opprett ny undermappe tilhørende {selectedFolder.name}
          </div>
          <label className="text-gray-500 mt-2">Mappenavn</label>
          <input
            className="border border-gray-300 rounded-[24px] px-4 py-2 mt-1"
            type="text"
            placeholder="Mappenavn"
            required
            onChange={(e) => setCreateNewFolderName(e.target.value)}
          ></input>
          <label className="text-secondary-text text-[0.7rem]">
            Dette feltet er obligatorisk og må være på mer enn 3 tegn
          </label>
          <label className="text-gray-500 mt-2">Beskrivelse</label>
          <input
            className="border border-gray-300 rounded-[24px] px-4 py-2 mt-1"
            type="text"
            placeholder="Beskrivelse"
            required
            onChange={(e) => setCreateNewFolderDescription(e.target.value)}
          ></input>
          <label className="text-secondary-text text-[0.7rem]">
            Dette feltet er obligatorisk og må være på mer enn 3 tegn
          </label>
          {createNewFolderName.length > 2 &&
          createNewFolderDescription.length > 2 ? (
            <button
              className="bg-primary-blue text-white rounded-[24px] px-4 py-2 mt-4"
              onClick={() => createFolder(selectedFolder.id)}
            >
              Opprett
            </button>
          ) : null}
          <button
            className="bg-primary-red text-white rounded-[24px] px-4 py-2 mt-2"
            onClick={() => setCreateNewSubFolder(false)}
          >
            Avbryt
          </button>
        </div>
      </section>
    );
  }

  // if editFolder is true, it will show the edit folder form
  if (editFolder && selectedFolder) {
    return (
      <section className={`relative w-[100%]`}>
        <div className="flex flex-col gap-2 text-gray-500">
          <div className="text-[0.8rem]">Mappetittel</div>
          <input
            type="text"
            id="folder_title"
            className="border border-gray-300 rounded-[24px] px-4 py-2 focus:outline-primary-indigo mb-1 w-[100%]"
            placeholder="Mappetittel"
            defaultValue={selectedFolder.name}
          ></input>
          <div className="text-[0.8rem]">Mappebeskrivelse</div>
          <input
            type="text"
            id="folder_description"
            className="border border-gray-300 rounded-[24px] px-4 py-2 focus:outline-primary-indigo mb-1 w-[100%]"
            placeholder="Mappebeskrivelse"
            defaultValue={selectedFolder.description}
          ></input>
          <div className="text-[0.8rem]">Slett mappe</div>
          <div className="flex flex-row gap-2">
            <input
              type="text"
              id="folder_delete"
              className="border border-gray-300 rounded-[24px] px-4 py-2 focus:outline-primary-indigo mb-1 w-[100%]"
              placeholder="For å slette mappen må du skrive inn mappenavnet"
              onChange={(e) => setFolderDeleteConfirmation(e.target.value)}
            ></input>
            <button
              disabled={
                folderDeleteConfirmation === selectedFolder.name ? false : true
              }
              type="button"
              className="bg-red-500 text-white rounded-[24px] px-4 py-2 hover:bg-red-600 disabled:bg-secondary-text"
              onClick={() => deleteFolder(selectedFolder)}
            >
              Slett
            </button>
          </div>
          <div className="flex flex-row gap-2">
            <button
              type="button"
              className="bg-red-500 text-white rounded-[24px] px-4 py-2 hover:bg-red-600"
              onClick={() => setEditFolder(false)}
            >
              Avbryt
            </button>
            <button
              type="button"
              className="bg-primary-indigo text-white rounded-[24px] px-4 py-2 hover:bg-indigo-600"
              onClick={() => saveFolderEdit(selectedFolder)}
            >
              Lagre
            </button>
          </div>
        </div>
      </section>
    );
  }

  // If a folder is selected, but not a discussion it will show all discussions in that folder
  if (selectedFolder && !selectedDiscussion) {
    return (
      <section className={`relative w-[100%]`}>
        <div className="flex flex-row">
          {props.currentUserSession?.user?.aud === "authenticated" ? (
            <div className="flex flex-row gap-2">
              <div className="group flex flex-row gap-1 hover:bg-primary-indigo rounded-[10px]">
                <div
                  className="bg-gray-100 rounded-[10px] py-2 px-2 group-hover:bg-primary-indigo"
                  onClick={() => setCreateNewDiscussion(true)}
                >
                  <FontAwesomeIcon
                    icon={faMessage}
                    className="text-secondary-text text-[0.7rem] group-hover:text-white group-hover:cursor-pointer"
                  />
                </div>
                <div
                  onClick={() => setCreateNewDiscussion(true)}
                  className="text-secondary-text text-[0.7rem] py-2 px-2 group-hover:text-white group-hover:cursor-pointer hidden lg:block"
                >
                  Ny tråd
                </div>
              </div>
              {selectedFolder.created_by_id ===
              props.currentUserProfile?.user_id ? (
                <div className="group flex flex-row gap-1 hover:bg-primary-indigo rounded-[10px]">
                  <div
                    className="bg-gray-100 rounded-[10px] py-2 px-2 group-hover:bg-primary-indigo"
                    onClick={() => setCreateNewDiscussion(true)}
                  >
                    <FontAwesomeIcon
                      icon={faPen}
                      className="text-secondary-text text-[0.7rem] group-hover:text-white group-hover:cursor-pointer"
                    />
                  </div>
                  <div
                    onClick={() => setEditFolder(true)}
                    className="text-secondary-text text-[0.7rem] py-2 px-2 group-hover:text-white group-hover:cursor-pointer hidden lg:block"
                  >
                    Rediger denne mappen
                  </div>
                </div>
              ) : null}
            </div>
          ) : null}
        </div>
        <div className="flex flex-row flex-wrap">
          {selectedFolder.parent_array.map((parent, index) => (
            <div
              className="text-primary-text text-[0.7rem] hover:text-primary-indigo hover:cursor-pointer mt-4 mb-2 ml-2 bg-gray-100 rounded-[24px] px-3 py-1 hidden lg:block"
              onClick={() => (window.location.href = `?folder=${parent.id}`)}
              key={index}
            >
              {parent.name}
            </div>
          ))}
          <div className="text-white text-[0.7rem] mt-4 mb-2 ml-2 bg-primary-indigo rounded-[24px] px-3 py-1 hidden lg:block">
            {selectedFolder.name}
          </div>
        </div>
        {createNewDiscussion ? (
          <div className="flex flex-col gap-1 mt-2">
            <input
              className="border border-gray-300 rounded-[24px] px-4 py-2 focus:outline-primary-indigo"
              type="text"
              placeholder="Tittel"
              required
              onChange={(e) => setCreateNewDiscussionTitle(e.target.value)}
            ></input>
            <label className="text-secondary-text text-[0.7rem]">
              Dette feltet er obligatorisk og må være på mer enn 3 tegn
            </label>
            <input
              className="border border-gray-300 rounded-[24px] px-4 py-2 focus:outline-primary-indigo"
              type="text"
              placeholder="Beskrivelse"
              required
              onChange={(e) =>
                setCreateNewDiscussionDescription(e.target.value)
              }
            ></input>
            <label className="text-secondary-text text-[0.7rem]">
              Dette feltet er ikke obligatorisk
            </label>
            <Editor
              apiKey="5h30failckzmzz86haynxp1vhk7mvvc10go0aulj7v0f4llh"
              onInit={(evt, editor) => (editorRef.current = editor)}
              init={{
                height: 500,
                menubar: false,
                plugins: [
                  "advlist",
                  "autolink",
                  "lists",
                  "link",
                  "image",
                  "charmap",
                  "preview",
                  "anchor",
                  "searchreplace",
                  "visualblocks",
                  "code",
                  "fullscreen",
                  "insertdatetime",
                  "media",
                  "table",
                  "code",
                  "help",
                  "wordcount",
                  "emoticons",
                ],
                toolbar:
                  "undo redo | blocks | " +
                  "bold italic forecolor | alignleft aligncenter " +
                  "alignright alignjustify | bullist numlist outdent indent | " +
                  "emoticons | table | removeformat | link  | image | code | fullscreen | help",
                content_style:
                  "body { font-family:Helvetica,Arial,sans-serif; font-size:14px }",
              }}
            />
            <div className="flex flex-row gap-2">
              <button
                className="bg-primary-red text-white rounded-[24px] px-4 py-2 mt-2"
                onClick={() => setCreateNewDiscussion()}
              >
                Avbryt
              </button>
              {createNewDiscussionTitle.length > 2 ? (
                <button
                  className="bg-primary-indigo text-white rounded-[24px] px-4 py-2 mt-2"
                  onClick={() => createDiscussion()}
                >
                  Opprett
                </button>
              ) : null}
            </div>
          </div>
        ) : null}
        <div className="flex flex-col gap-2 mt-2">
          {discussions?.length > 0
            ? discussions.map((discussion, index) =>
                discussion.deleted_hard ? null : (
                  <div
                    className="group bg-indigo-50 rounded-[15px] px-2 py-2 hover:cursor-pointer hover:bg-gray-300"
                    key={index}
                  >
                    <div
                      onClick={() => {
                        window.location.href = `?folder=${selectedFolder.id}&discussion=${discussion.id}`;
                      }}
                    >
                      <div className="flex flex-row gap-1">
                        <FontAwesomeIcon
                          icon={faMessage}
                          className="text-secondary-text text-[0.7rem] group-hover:text-primary-indigo group-hover:cursor-pointer py-3 px-2"
                        />
                        <div className="text-secondary-text text-[0.7rem] py-2 px-2 group-hover:text-primary-text group-hover:cursor-pointer">
                          <div className="text-primary-text text-[0.9rem]">
                            {discussion.title}
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-row gap-1">
                        <FontAwesomeIcon
                          icon={faInfo}
                          className="text-secondary-text group-hover:cursor-pointer py-3 px-3"
                        />
                        <div className="text-secondary-text py-2 px-2 group-hover:text-primary-text group-hover:cursor-pointer">
                          <div className="text-primary-text text-[0.8rem]">
                            {discussion.description
                              ? discussion.description
                              : "Ingen beskrivelse"}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-row gap-4">
                      <div className="flex flex-row">
                        <FontAwesomeIcon
                          icon={faClock}
                          className="text-secondary-text text-[0.7rem] group-hover:cursor-pointer py-3 px-3"
                        />
                        <div className="text-secondary-text text-[0.7rem] py-2 group-hover:text-primary-text group-hover:cursor-pointer">
                          <div className="text-secondary-text text-[0.7rem]">
                            <Moment fromNow>{discussion.last_post_at}</Moment>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-row">
                        <FontAwesomeIcon
                          icon={faUser}
                          className="text-secondary-text text-[0.7rem] group-hover:cursor-pointer py-3 px-3"
                        />
                        <div className="text-secondary-text text-[0.7rem] py-2 hover:text-primary-text group-hover:cursor-pointer">
                          <div className="text-secondary-text text-[0.7rem]">
                            {discussion.last_post_by}
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-row ">
                        <FontAwesomeIcon
                          icon={faTicket}
                          className="text-secondary-text text-[0.7rem] group-hover:cursor-pointer py-3 px-3 hover:text-primary-indigo"
                          onClick={() => {
                            window.location.href = `?folder=${selectedFolder.id}&discussion=${discussion.id}&page=1&post=${discussion.total_posts}`;
                          }}
                        />
                        <div className="text-secondary-text text-[0.7rem] py-2 group-hover:text-primary-text group-hover:cursor-pointer">
                          <div className="text-secondary-text text-[0.7rem] ">
                            {discussion.total_posts}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              )
            : null}
        </div>
      </section>
    );
  }

  // If a discussion is selected it will return that discussion
  if (selectedDiscussion && selectedFolder) {
    return (
      <section className={`relative`}>
        <div className="flex flex-row flex-wrap">
          {selectedFolder.parent_array.map((parent, index) => (
            <div
              className="text-primary-text text-[0.7rem] hover:text-primary-indigo hover:cursor-pointer mt-4 mb-2 ml-2 bg-gray-100 rounded-[24px] px-3 py-1 hidden lg:block"
              onClick={() => (window.location.href = `?folder=${parent.id}`)}
              key={index}
            >
              {parent.name}
            </div>
          ))}
          <div
            className="text-primary-text text-[0.7rem] hover:text-primary-indigo hover:cursor-pointer mt-4 mb-2 ml-2 bg-gray-100 rounded-[24px] px-3 py-1 hidden lg:block"
            onClick={() =>
              (window.location.href = `?folder=${selectedFolder.id}`)
            }
          >
            {selectedFolder.name}
          </div>
          <div className="text-white text-[0.7rem] mt-4 mb-2 ml-2 bg-primary-indigo rounded-[24px] px-3 py-1 hidden lg:block">
            {selectedDiscussion.title}
          </div>
        </div>
        <Posts
          render={props.render}
          setRender={props.setRender}
          discussion={selectedDiscussion}
          posts={selectedDiscussionPosts}
          currentUserSession={props.currentUserSession}
          currentUserProfile={props.currentUserProfile}
          handleError={props.handleError}
          handleSuccess={props.handleSuccess}
          folder={selectedFolder}
        />
      </section>
    );
  }

  // Normal return. Will return all folders.
  return (
    <section className={`relative w-auto`}>
      <div className="flex flex-row">
        {props.currentUserSession?.user?.aud === "authenticated" ? (
          props.currentUserProfile?.is_mod ||
          props.currentUserProfile?.is_admin ? (
            <div className="flex flex-row gap-2">
              <div className="group flex flex-row gap-1 hover:bg-primary-indigo rounded-[10px]">
                <div
                  className="bg-gray-100 rounded-[10px] py-2 px-2 group-hover:bg-primary-indigo"
                  onClick={() => setCreateNewFolder(true)}
                >
                  <FontAwesomeIcon
                    icon={faFolder}
                    className="text-secondary-text text-[0.7rem] group-hover:text-white group-hover:cursor-pointer"
                  />
                </div>
                <div
                  onClick={() => setCreateNewFolder(true)}
                  className="text-secondary-text text-[0.7rem] py-2 px-2 group-hover:text-white group-hover:cursor-pointer hidden lg:block"
                >
                  Ny mappe
                </div>
              </div>
            </div>
          ) : null
        ) : null}
      </div>
      {createNewFolder ? (
        <div className="flex flex-col gap-1 mt-2">
          <label className="text-gray-500">Mappenavn</label>
          <input
            className="border border-gray-300 rounded-[24px] px-4 py-2 focus:outline-primary-indigo"
            type="text"
            placeholder="Mappenavn"
            required
            onChange={(e) => setCreateNewFolderName(e.target.value)}
          ></input>
          <label className="text-secondary-text text-[0.7rem]">
            Dette feltet er obligatorisk og må være på mer enn 3 tegn
          </label>
          <label className="text-gray-500 mt-2">Beskrivelse</label>
          <input
            className="border border-gray-300 rounded-[24px] px-4 py-2 focus:outline-primary-indigo"
            type="text"
            placeholder="Beskrivelse"
            required
            onChange={(e) => setCreateNewFolderDescription(e.target.value)}
          ></input>
          <label className="text-secondary-text text-[0.7rem]">
            Dette feltet er obligatorisk og må være på mer enn 3 tegn
          </label>
          <div className="flex flex-row gap-2">
            <button
              className="bg-primary-red text-white rounded-[24px] px-4 py-2 mt-2"
              onClick={() => setCreateNewFolder(false)}
            >
              Avbryt
            </button>
            {createNewFolderName.length > 2 &&
            createNewFolderDescription.length > 2 ? (
              <button
                className="bg-primary-indigo text-white rounded-[24px] px-4 py-2 mt-2"
                onClick={() => createFolder(0)}
              >
                Opprett
              </button>
            ) : null}
          </div>
        </div>
      ) : null}
      <div className="flex flex-col gap-2 mt-4">
        <Folders
          handleError={props.handleError}
          handleSuccess={props.handleSuccess}
          currentUserSession={props.currentUserSession}
          currentUserProfile={props.currentUserProfile}
        />
      </div>
    </section>
  );
};

export default Forum;
