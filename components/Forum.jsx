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
  faBookmark,
  faThumbsUp,
  faTicket,
  faPen,
  faStop,
  faArchive,
} from "@fortawesome/free-solid-svg-icons";

const Forum = (props) => {
  const editorRef = useRef(null);
  const editorEditRef = useRef(null);
  const [userProfile, setUserProfile] = useState(null);
  const [allUserProfiles, setAllUserProfiles] = useState(null);
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserUsername, setNewUserUsername] = useState("");
  const [newUserFullName, setNewUserFullName] = useState("");
  const [newUserPassword, setNewUserPassword] = useState("");
  const [newUserPasswordConfirm, setNewUserPasswordConfirm] = useState("");
  const [newPasswordValid, setNewPasswordValid] = useState(false);
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
  const [editPostId, setEditPostId] = useState(null);
  const [editPost, setEditPost] = useState(false);
  const [createNewPostContent, setCreateNewPostContent] = useState(false);
  const [createNewDiscussion, setCreateNewDiscussion] = useState(false);
  const [createNewDiscussionTitle, setCreateNewDiscussionTitle] = useState("");
  const [createNewDiscussionDescription, setCreateNewDiscussionDescription] =
    useState("");
  const [folders, setFolders] = useState(null);
  const [selectedFolderId, setSelectedFolderId] = useState(null);
  const [selectedFolder, setSelectedFolder] = useState(null);

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

  useEffect(() => {
    if (!selectedFolderId) {
      fetchFolders(0);
    } else if (selectedFolderId) {
      fetchSelectedFolder();
      fetchFolders(selectedFolderId);
    }

    if (selectedDiscussionId) {
      fetchSelectedDiscussion();
      fetchSelectedDiscussionPosts();
    }

    if (!userProfile) {
      fetchUserProfile();
    }
  });

  if (selectedFolderId && !folders) {
    fetchFolders(selectedFolderId);
  }

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

  // Get all folders
  async function fetchFolders(parent) {
    const { data, error } = await supabase
      .from("folders")
      .select()
      .eq("parent", parent);
    if (!folders) {
      setFolders(data);
    }

    if (error) {
      props.handleError(error.message);
    }
  }

  // Get the selected folder
  async function fetchSelectedFolder() {
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
      fetchFolders(parent);
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
        props.handleSuccess(
          "Tråden " + createNewDiscussionTitle + " er opprettet."
        );
      }

      if (data) {
        if (editorRef.current.getContent().length > 1) {
          await supabase.from("posts").insert({
            content: editorRef.current.getContent(),
            created_by: props.currentUserProfile.user_name
              ? props.currentUserProfile.user_name
              : props.currentUserSession?.user?.user_metadata?.user_name,
            discussion: data[0].id,
            created_by_id: props.currentUserSession?.user?.id,
            created_by_avatar_url: props.currentUserProfile?.avatar_url,
          });
        }

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

  // Create new post
  async function createDiscussionPost() {
    if (editorRef.current) {
      setCreateNewPostContent(editorRef.current.getContent());
    }

    if (editorRef.current.getContent().length > 1) {
      const { data, error } = await supabase.from("posts").insert({
        content: editorRef.current.getContent(),
        created_by: props.currentUserProfile.user_name
          ? props.currentUserProfile.user_name
          : props.currentUserSession?.user?.user_metadata?.user_name,
        discussion: selectedDiscussionId,
        created_by_id: props.currentUserSession?.user?.id,
        created_by_avatar_url: props.currentUserProfile?.avatar_url,
      });

      var total_posts = selectedDiscussion.total_posts + 1;
      var last_post_at = new Date();

      if (error) {
        props.handleError(error.message);
      }
      if (!error) {
        props.handleSuccess(
          "Tråden " + createNewDiscussionTitle + " er opprettet."
        );
      }

      const { data: dataDiscussion, error: errorDiscussion } = await supabase
        .from("discussions")
        .update({
          total_posts: total_posts,
          last_post_by: props.currentUserProfile.user_name
            ? props.currentUserProfile.user_name
            : props.currentUserSession?.user?.user_metadata?.user_name,
          last_post_at: last_post_at,
        })
        .eq("id", selectedDiscussionId);

      if (errorDiscussion) {
        props.handleError(errorDiscussion.message);
      }
      if (!errorDiscussion) {
        props.handleSuccess("Posten er opprettet.");
      }

      if (discussions) {
        setSelectedDiscussionPosts(null);
      }
      setCreateNewPostContent("");
      window.location.reload();
    }
  }

  // Bookmark discussion
  async function onClickBookmark(id) {
    var tempBookmarks = [];
    var existingBookmarks = null;

    if (userProfile) {
      existingBookmarks = userProfile?.bookmarks;
    } else {
      existingBookmarks = props.currentUserProfile?.bookmarks;
    }

    if (existingBookmarks?.length > 0) {
      existingBookmarks.forEach((bookmark) => {
        if (bookmark !== id) {
          tempBookmarks.push(bookmark);
        }
      });
      if (!tempBookmarks.includes(id)) {
        tempBookmarks.push(id);
      }
    } else {
      tempBookmarks.push(selectedDiscussionId);
    }

    const { error } = await supabase
      .from("users")
      .update({ bookmarks: tempBookmarks })
      .eq("user_id", props.currentUserSession?.user?.id);

    if (error) {
      props.handleError(error.message);
    }
    if (!error) {
      props.handleSuccess("Bokmerke er oppdatert");
    }

    fetchUserProfile();
  }

  // When clicking on the edit post icon in the post
  async function onClickIconEditPost(id) {
    setEditPostId(id);
    setEditPost(true);
  }

  // On click edit post
  async function onClickEditPost(post) {
    const { error } = await supabase
      .from("posts")
      .update({
        created_at: new Date(),
        content: editorRef.current.getContent(),
      })
      .eq("id", post.id);

    var last_post_at = new Date();

    if (error) {
      props.handleError(error.message);
    }

    const { error: errorDiscussion } = await supabase
      .from("discussions")
      .update({
        last_post_at: last_post_at,
      })
      .eq("id", selectedDiscussionId);

    if (errorDiscussion) {
      props.handleError(errorDiscussion.message);
    }
    if (!error && !errorDiscussion) {
      props.handleSuccess("Tråden er oppdatert");
    }

    window.location.reload();
  }

  // Archive discussion
  async function onClickArchive() {
    const { error } = await supabase
      .from("discussions")
      .update({
        deleted: !selectedDiscussion.deleted,
      })
      .eq("id", selectedDiscussion.id);

    if (error) {
      props.handleError(error.message);
    }
    if (!error && selectedDiscussion.deleted === false) {
      props.handleSuccess("Tråden er arkivert");
    }
    if (!error && selectedDiscussion.deleted === true) {
      props.handleSuccess("Tråden er ikke arkivert lenger");
    }

    window.location.reload();
  }

  // Save settings
  async function onClickSaveSettings(newImgUrl) {
    var newEmail = props.currentUserSession?.user?.email;
    var oldUserName = userProfile?.user_name
      ? userProfile?.user_name
      : props.currentUserProfile
      ? props.currentUserProfile?.user_name
      : null;
    var newUserName = userProfile?.user_name
      ? userProfile?.user_name
      : props.currentUserProfile
      ? props.currentUserProfile?.user_name
      : null;
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

  if (props.createNewUser) {
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
              <div className="text-gray-400 text-[12px]">
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
              <div className="text-gray-400 text-[12px]">
                Brukernavnet ditt er det alle vil kjenne deg som på forumet.
                Dette kan endres senere.
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
              <div className="text-gray-400 text-[12px]">
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
              <div className="text-gray-400 text-[12px] mt-2">
                Etter at du har registrert din bruker vil vi sende deg en e-post
                for å bekrefte din identitet. Dersom du ikke har fått en e-post
                innen 5 minutter, sjekk søppelposten din.
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (props.forgotPassword) {
    return resetPasswordSuccess ? (
      <section className={`relative`}>
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-6 gap-4">
            <div className="col-span-1"></div>
            <div className="col-span-4 bg-white rounded-[24px] py-4 px-4">
              <div className="text-gray-400 text-[12px] mb-2">
                Epost: {newUserEmail}
              </div>
              <div className="text-gray-400 text-[12px]">
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
                className="border border-gray-300 rounded-[24px] px-4 py-2 focus:outline-indigo-500 mt-2 w-full"
                type="email"
                placeholder="E-post"
                required
                onChange={(e) => {
                  setNewUserEmail(e.target.value);
                }}
              />
              <div className="text-gray-400 text-[12px]">
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
                  className="bg-indigo-500 text-white rounded-[24px] px-4 py-2"
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
                <div className="text-gray-400 text-[12px]">
                  Dette er eposten du bruker for å logge inn på forumet.
                </div>
                <input
                  className="border border-gray-300 rounded-[24px] px-4 py-2 focus:outline-indigo-500 mt-2 w-full"
                  type="text"
                  placeholder="Brukernavn"
                  defaultValue={
                    userProfile?.user_name
                      ? userProfile?.user_name
                      : props.currentUserProfile
                      ? props.currentUserProfile?.user_name
                      : null
                  }
                  required
                  onChange={(e) => {
                    setNewUserUsername(e.target.value);
                  }}
                />
                <div className="text-gray-400 text-[12px]">
                  Her kan du endre ditt brukernavn, dette er navnet som er
                  synlig for alle andre på forumet.
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
                <div className="text-gray-400 text-[12px]">
                  Du kan ikke endre navnet ditt, vennligst kontakt oss dersom du
                  ønsker å endre dette.
                </div>
                <input
                  onChange={(e) => uploadAvatar(e)}
                  className="border border-gray-300 rounded-[24px] px-4 py-2 focus:outline-indigo-500 mt-2 w-full"
                  type="file"
                  accept="image/*"
                />
                <div className="text-gray-400 text-[12px]">Profilbilde</div>
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
  }

  if (props.showAdmin) {
    return (
      <section>
        <div className="container mx-auto px-4 text-gray-400 bg-white py-2 px-2 rounded-[14px]">
          Administrator panelet
          <div className="flex flex-col gap-2 mt-3">
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
                  {allUserProfiles
                    ? allUserProfiles.map((profile) => (
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
                className="bg-indigo-500 text-white rounded-[24px] px-4 py-2"
                onClick={() => props.setShowAdmin(false)}
              >
                Lukk administrator panelet
              </button>
            </div>
          </div>
        </div>
      </section>
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
          <label className="text-gray-400 text-[12px]">
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
          <label className="text-gray-400 text-[12px]">
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

  if (selectedFolder && !selectedDiscussion) {
    return (
      <section className={`relative w-[100%]`}>
        <div className="flex flex-row">
          {props.currentUserSession?.user?.aud === "authenticated" ? (
            <div className="flex flex-row gap-2">
              {!createNewFolder ? (
                <div className="group flex flex-row gap-1">
                  <div
                    className="bg-gray-100 rounded-[10px] py-2 px-2 group-hover:bg-indigo-500"
                    onClick={() => setCreateNewDiscussion(true)}
                  >
                    <FontAwesomeIcon
                      icon={faMessage}
                      className="text-gray-400 text-[10px] group-hover:text-gray-600 group-hover:cursor-pointer"
                    />
                  </div>
                  <div
                    onClick={() => setCreateNewDiscussion(true)}
                    className="text-gray-400 text-[10px] py-2 px-2 group-hover:text-gray-600 group-hover:cursor-pointer hidden lg:block"
                  >
                    Ny tråd
                  </div>
                </div>
              ) : null}
              {!createNewDiscussion ? (
                props.currentUserProfile?.is_mod ||
                props.currentUserProfile?.is_admin ? (
                  <div className="group flex flex-row gap-1">
                    <div
                      className="bg-gray-100 rounded-[10px] py-2 px-2 group-hover:bg-indigo-500"
                      onClick={() => setCreateNewFolder(true)}
                    >
                      <FontAwesomeIcon
                        icon={faFolder}
                        className="text-gray-400 text-[10px] group-hover:text-gray-600 group-hover:cursor-pointer"
                      />
                    </div>
                    <div
                      onClick={() => setCreateNewFolder(true)}
                      className="text-gray-400 text-[10px] py-2 px-2 group-hover:text-gray-600 group-hover:cursor-pointer hidden lg:block"
                    >
                      Ny mappe
                    </div>
                  </div>
                ) : null
              ) : null}
            </div>
          ) : null}
        </div>
        <div className="flex flex-row flex-wrap">
          {selectedFolder.parent_array.map((parent, index) => (
            <div
              className="text-gray-600 text-[12px] hover:text-indigo-500 hover:cursor-pointer mt-4 mb-2 ml-2 bg-gray-100 rounded-[24px] px-3 py-1 hidden lg:block"
              onClick={() => (window.location.href = `?folder=${parent.id}`)}
              key={index}
            >
              {parent.name}
            </div>
          ))}
          <div className="text-white text-[12px] mt-4 mb-2 ml-2 bg-indigo-500 rounded-[24px] px-3 py-1 hidden lg:block">
            {selectedFolder.name}
          </div>
        </div>
        {createNewFolder ? (
          <div className="flex flex-col gap-1">
            <input
              className="border border-gray-300 rounded-[24px] px-4 py-2 focus:outline-indigo-500"
              type="text"
              placeholder="Mappenavn"
              required
              onChange={(e) => setCreateNewFolderName(e.target.value)}
            ></input>
            <label className="text-gray-400 text-[12px]">
              Dette feltet er obligatorisk og må være på mer enn 3 tegn
            </label>
            <input
              className="border border-gray-300 rounded-[24px] px-4 py-2 focus:outline-indigo-500"
              type="text"
              placeholder="Beskrivelse"
              required
              onChange={(e) => setCreateNewFolderDescription(e.target.value)}
            ></input>
            <label className="text-gray-400 text-[12px]">
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
                  className="bg-indigo-500 text-white rounded-[24px] px-4 py-2 mt-2"
                  onClick={() => createFolder(selectedFolderId)}
                >
                  Opprett
                </button>
              ) : null}
            </div>
          </div>
        ) : null}
        {createNewDiscussion ? (
          <div className="flex flex-col gap-1 mt-2">
            <input
              className="border border-gray-300 rounded-[24px] px-4 py-2 focus:outline-indigo-500"
              type="text"
              placeholder="Tittel"
              required
              onChange={(e) => setCreateNewDiscussionTitle(e.target.value)}
            ></input>
            <label className="text-gray-400 text-[12px]">
              Dette feltet er obligatorisk og må være på mer enn 3 tegn
            </label>
            <input
              className="border border-gray-300 rounded-[24px] px-4 py-2 focus:outline-indigo-500"
              type="text"
              placeholder="Beskrivelse"
              required
              onChange={(e) =>
                setCreateNewDiscussionDescription(e.target.value)
              }
            ></input>
            <label className="text-gray-400 text-[12px]">
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
                  "emoticons | removeformat | link  | image | code | fullscreen | help",
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
                  className="bg-indigo-500 text-white rounded-[24px] px-4 py-2 mt-2"
                  onClick={() => createDiscussion()}
                >
                  Opprett
                </button>
              ) : null}
            </div>
          </div>
        ) : null}
        <div className="flex flex-col gap-2 mt-4">
          {folders?.length > 0
            ? folders.map((folder, index) => (
                <div
                  className="group bg-white rounded-[15px] px-2 py-2 hover:cursor-pointer hover:bg-gray-300"
                  key={index}
                  onClick={() => {
                    window.location.href = `?folder=${folder.id}`;
                  }}
                >
                  <div className="flex flex-row gap-1">
                    <FontAwesomeIcon
                      icon={faFolder}
                      className="text-gray-400 text-[10px] group-hover:text-indigo-500 group-hover:cursor-pointer group-hover:text-white py-3 px-2"
                    />
                    <div className="text-gray-400 text-[10px] py-2 px-2 group-hover:text-gray-600 group-hover:cursor-pointer">
                      <div className="text-gray-600 text-[14px]">
                        {folder.name}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-row gap-1">
                    <FontAwesomeIcon
                      icon={faInfo}
                      className="text-gray-400 text-[10px] group-hover:cursor-pointer py-3 px-3"
                    />
                    <div className="text-gray-400 text-[10px] py-2 px-2 group-hover:text-gray-600 group-hover:cursor-pointer">
                      <div className="text-gray-600 text-[10px]">
                        {folder.description}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-row gap-4">
                    <div className="flex flex-row">
                      <FontAwesomeIcon
                        icon={faClock}
                        className="text-gray-400 text-[10px] group-hover:cursor-pointer py-3 px-3"
                      />
                      <div className="text-gray-400 text-[10px] py-2 group-hover:text-gray-600 group-hover:cursor-pointer">
                        <div className="text-gray-400 text-[10px]">
                          <Moment fromNow>{folder.created_at}</Moment>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-row">
                      <FontAwesomeIcon
                        icon={faUser}
                        className="text-gray-400 text-[10px] group-hover:cursor-pointer py-3 px-3"
                      />
                      <div className="text-gray-400 text-[10px] py-2 group-hover:text-gray-600 group-hover:cursor-pointer">
                        <div className="text-gray-400 text-[10px]">
                          {folder.created_by}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            : null}
        </div>
        <div className="flex flex-col gap-2 mt-2">
          {discussions?.length > 0
            ? discussions.map((discussion, index) => (
                <div
                  className="group bg-indigo-50 rounded-[15px] px-2 py-2 hover:cursor-pointer hover:bg-gray-300"
                  key={index}
                  onClick={() => {
                    window.location.href = `?folder=${selectedFolder.id}&discussion=${discussion.id}`;
                  }}
                >
                  <div className="flex flex-row gap-1">
                    <FontAwesomeIcon
                      icon={faMessage}
                      className="text-gray-400 text-[10px] group-hover:text-indigo-500 group-hover:cursor-pointer group-hover:text-white py-3 px-2"
                    />
                    <div className="text-gray-400 text-[10px] py-2 px-2 group-hover:text-gray-600 group-hover:cursor-pointer">
                      <div className="text-gray-600 text-[14px]">
                        {discussion.title}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-row gap-1">
                    <FontAwesomeIcon
                      icon={faInfo}
                      className="text-gray-400 text-[10px] group-hover:cursor-pointer py-3 px-3"
                    />
                    <div className="text-gray-400 text-[10px] py-2 px-2 group-hover:text-gray-600 group-hover:cursor-pointer">
                      <div className="text-gray-600 text-[10px]">
                        {discussion.description
                          ? discussion.description
                          : "Ingen beskrivelse"}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-row gap-4">
                    <div className="flex flex-row">
                      <FontAwesomeIcon
                        icon={faClock}
                        className="text-gray-400 text-[10px] group-hover:cursor-pointer py-3 px-3"
                      />
                      <div className="text-gray-400 text-[10px] py-2 group-hover:text-gray-600 group-hover:cursor-pointer">
                        <div className="text-gray-400 text-[10px]">
                          <Moment fromNow>{discussion.last_post_at}</Moment>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-row">
                      <FontAwesomeIcon
                        icon={faUser}
                        className="text-gray-400 text-[10px] group-hover:cursor-pointer py-3 px-3"
                      />
                      <div className="text-gray-400 text-[10px] py-2 group-hover:text-gray-600 group-hover:cursor-pointer">
                        <div className="text-gray-400 text-[10px]">
                          {discussion.last_post_by}
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-row">
                      <FontAwesomeIcon
                        icon={faTicket}
                        className="text-gray-400 text-[10px] group-hover:cursor-pointer py-3 px-3"
                      />
                      <div className="text-gray-400 text-[10px] py-2 group-hover:text-gray-600 group-hover:cursor-pointer">
                        <div className="text-gray-400 text-[10px]">
                          {discussion.total_posts}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            : null}
        </div>
      </section>
    );
  }

  if (selectedFolder && selectedDiscussion) {
    return (
      <section className={`relative`}>
        <div className="flex flex-row flex-wrap">
          {selectedFolder.parent_array.map((parent, index) => (
            <div
              className="text-gray-600 text-[12px] hover:text-indigo-500 hover:cursor-pointer mt-4 mb-2 ml-2 bg-gray-100 rounded-[24px] px-3 py-1 hidden lg:block"
              onClick={() => (window.location.href = `?folder=${parent.id}`)}
              key={index}
            >
              {parent.name}
            </div>
          ))}
          <div
            className="text-gray-600 text-[12px] hover:text-indigo-500 hover:cursor-pointer mt-4 mb-2 ml-2 bg-gray-100 rounded-[24px] px-3 py-1 hidden lg:block"
            onClick={() =>
              (window.location.href = `?folder=${selectedFolder.id}`)
            }
          >
            {selectedFolder.name}
          </div>
          <div className="text-white text-[12px] mt-4 mb-2 ml-2 bg-indigo-500 rounded-[24px] px-3 py-1 hidden lg:block">
            {selectedDiscussion.title}
          </div>
        </div>
        <div className="flex flex-col gap-2 overflow">
          {selectedDiscussionPosts?.length > 0
            ? selectedDiscussionPosts.map((post, index) => (
                <div
                  className="bg-white rounded-[10px] px-6 py-6 w-[100%]"
                  key={index}
                >
                  <div className="flex flex-col gap-2">
                    <div className="flex flex-row gap-2">
                      <img
                        src={post.created_by_avatar_url}
                        className="w-12 h-12 rounded-[4px] shadow-sm shadow-black"
                      />
                      <div className="flex flex-col">
                        <div className="text-gray-600 text-[14px] hover:text-indigo-500 hover:cursor-pointer">
                          {post.created_by}
                        </div>
                        <div className="text-gray-400 text-[10px]">
                          #{index + 1}
                        </div>
                        <div className="text-gray-400 text-[10px]">
                          <Moment fromNow>{post.created_at}</Moment>
                        </div>
                      </div>
                    </div>
                    <div className="text-gray-600 text-[14px] mt-4">
                      {editPost && editPostId === post.id ? (
                        <div className="flex flex-col gap 4">
                          <Editor
                            apiKey="5h30failckzmzz86haynxp1vhk7mvvc10go0aulj7v0f4llh"
                            initialValue={post.content}
                            onInit={(evt, editor) =>
                              (editorRef.current = editor)
                            }
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
                              className="bg-red-500 text-white rounded-[24px] px-4 py-2 mt-4"
                              onClick={() => setEditPost(false)}
                            >
                              Avbryt
                            </button>
                            <button
                              className="bg-indigo-500 text-white rounded-[24px] px-4 py-2 mt-4"
                              onClick={() => onClickEditPost(post)}
                            >
                              Post
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div
                          dangerouslySetInnerHTML={{ __html: post.content }}
                        />
                      )}
                    </div>
                    {props.currentUserSession?.user?.aud === "authenticated" ? (
                      <div className="flex flex-row gap-3">
                        {index === 0 ? (
                          !selectedDiscussion.deleted ? (
                            <div className="group flex flex-row gap-1">
                              {userProfile?.bookmarks?.includes(
                                selectedDiscussion.id
                              ) ? (
                                <div
                                  className="bg-indigo-500 rounded-[10px] py-2 px-2 group-hover:bg-indigo-600 flex flex-row gap-1"
                                  onClick={() =>
                                    onClickBookmark(selectedDiscussion.id)
                                  }
                                >
                                  <FontAwesomeIcon
                                    icon={faBookmark}
                                    className="text-white text-[15px] group-hover:text-white group-hover:cursor-pointer group-hover:text-white"
                                  />
                                  <div className="text-white text-[10px] group-hover:text-white group-hover:cursor-pointer hidden lg:block">
                                    Fjern fra lagrede tråder
                                  </div>
                                </div>
                              ) : (
                                <div
                                  className="bg-gray-100 rounded-[10px] py-2 px-2 group-hover:bg-indigo-500 flex flex-row gap-1"
                                  onClick={() =>
                                    onClickBookmark(selectedDiscussion.id)
                                  }
                                >
                                  <FontAwesomeIcon
                                    icon={faBookmark}
                                    className="text-gray-400 text-[15px] group-hover:text-gray-600 group-hover:cursor-pointer group-hover:text-white"
                                  />
                                  <div className="text-gray-400 text-[10px] group-hover:text-white group-hover:cursor-pointer hidden lg:block">
                                    Lagre tråden
                                  </div>
                                </div>
                              )}
                            </div>
                          ) : null
                        ) : null}
                        {selectedDiscussion.deleted ? null : (
                          <div className="group flex flex-row gap-1">
                            <div
                              className="bg-gray-100 rounded-[10px] py-2 px-2 group-hover:bg-indigo-500 flex flex-row gap-1"
                              onClick={() =>
                                editorRef.current.setContent(
                                  "<p><q>" +
                                    post.created_by +
                                    " skrev:</q></p>" +
                                    post.content +
                                    "</q></p><hr><br />"
                                )
                              }
                            >
                              <FontAwesomeIcon
                                icon={faMessage}
                                className="text-gray-400 text-[15px] group-hover:text-gray-600 group-hover:cursor-pointer group-hover:text-white"
                              />
                              <div className="text-gray-400 text-[10px] group-hover:text-white group-hover:cursor-pointer hidden lg:block">
                                Svar
                              </div>
                            </div>
                          </div>
                        )}
                        {props.currentUserProfile?.user_name ===
                        post.created_by ? (
                          selectedDiscussion.deleted ? null : (
                            <div className="group flex flex-row gap-1">
                              <div
                                className="bg-gray-100 rounded-[10px] py-2 px-2 group-hover:bg-indigo-500 flex flex-row gap-1"
                                onClick={() => onClickIconEditPost(post.id)}
                              >
                                <FontAwesomeIcon
                                  icon={faPen}
                                  className="text-gray-400 text-[15px] group-hover:text-gray-600 group-hover:cursor-pointer group-hover:text-white"
                                />
                                <div className="text-gray-400 text-[10px] group-hover:text-white group-hover:cursor-pointer hidden lg:block">
                                  Rediger
                                </div>
                              </div>
                            </div>
                          )
                        ) : null}
                        {index === 0 &&
                        props.currentUserProfile?.user_name ===
                          selectedDiscussion.created_by ? (
                          <div className="group flex flex-row gap-1">
                            {selectedDiscussion.deleted ? (
                              <div
                                className="bg-indigo-500 rounded-[10px] py-2 px-2 group-hover:bg-indigo-600 flex flex-row gap-1"
                                onClick={() => onClickArchive()}
                              >
                                <FontAwesomeIcon
                                  icon={faArchive}
                                  className="text-white text-[15px] group-hover:text-white group-hover:cursor-pointer group-hover:text-white"
                                />
                                <div className="text-white text-[10px] group-hover:text-white group-hover:cursor-pointer hidden lg:block">
                                  Fjern arkivering av denne tråden
                                </div>
                              </div>
                            ) : (
                              <div
                                className="bg-gray-100 rounded-[10px] py-2 px-2 group-hover:bg-indigo-500 flex flex-row gap-1"
                                onClick={() => onClickArchive()}
                              >
                                <FontAwesomeIcon
                                  icon={faArchive}
                                  className="text-gray-400 text-[15px] group-hover:text-gray-600 group-hover:cursor-pointer group-hover:text-white"
                                />
                                <div className="text-gray-400 text-[10px] group-hover:text-white group-hover:cursor-pointer hidden lg:block">
                                  Arkiver denne tråden
                                </div>
                              </div>
                            )}
                          </div>
                        ) : null}
                        {selectedDiscussion.deleted ? null : (
                          <div className="group flex flex-row gap-1">
                            <div className="bg-gray-100 rounded-[10px] py-2 px-2 group-hover:bg-indigo-500 flex flex-row gap-1">
                              <FontAwesomeIcon
                                icon={faThumbsUp}
                                className="text-gray-400 text-[15px] group-hover:text-gray-600 group-hover:cursor-pointer group-hover:text-white"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    ) : null}
                  </div>
                </div>
              ))
            : "Ingen har postet noe her enda"}
          {props.currentUserSession?.user?.aud === "authenticated" ? (
            !editPost ? (
              selectedDiscussion.deleted ? null : (
                <div className="flex flex-col gap 4">
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
                  <button
                    className="bg-indigo-500 text-white rounded-[24px] px-4 py-2 mt-4"
                    onClick={() => createDiscussionPost()}
                  >
                    Post
                  </button>
                </div>
              )
            ) : null
          ) : null}
        </div>
      </section>
    );
  }

  return (
    <section className={`relative w-auto`}>
      <div className="flex flex-row">
        {props.currentUserSession?.user?.aud === "authenticated" ? (
          props.currentUserProfile?.is_mod ||
          props.currentUserProfile?.is_admin ? (
            <div className="flex flex-row gap-2">
              <div className="group flex flex-row gap-1">
                <div
                  className="bg-gray-100 rounded-[10px] py-2 px-2 group-hover:bg-indigo-500"
                  onClick={() => setCreateNewFolder(true)}
                >
                  <FontAwesomeIcon
                    icon={faFolder}
                    className="text-gray-400 text-[10px] group-hover:text-gray-600 group-hover:cursor-pointer"
                  />
                </div>
                <div
                  onClick={() => setCreateNewFolder(true)}
                  className="text-gray-400 text-[10px] py-2 px-2 group-hover:text-gray-600 group-hover:cursor-pointer hidden lg:block"
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
            className="border border-gray-300 rounded-[24px] px-4 py-2 focus:outline-indigo-500"
            type="text"
            placeholder="Mappenavn"
            required
            onChange={(e) => setCreateNewFolderName(e.target.value)}
          ></input>
          <label className="text-gray-400 text-[12px]">
            Dette feltet er obligatorisk og må være på mer enn 3 tegn
          </label>
          <label className="text-gray-500 mt-2">Beskrivelse</label>
          <input
            className="border border-gray-300 rounded-[24px] px-4 py-2 focus:outline-indigo-500"
            type="text"
            placeholder="Beskrivelse"
            required
            onChange={(e) => setCreateNewFolderDescription(e.target.value)}
          ></input>
          <label className="text-gray-400 text-[12px]">
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
                className="bg-indigo-500 text-white rounded-[24px] px-4 py-2 mt-2"
                onClick={() => createFolder(0)}
              >
                Opprett
              </button>
            ) : null}
          </div>
        </div>
      ) : null}
      <div className="flex flex-col gap-2 mt-4">
        {folders?.length > 0
          ? folders.map((folder, index) => (
              <div
                className="group bg-white rounded-[15px] px-2 py-2 hover:cursor-pointer hover:bg-gray-300"
                key={index}
                onClick={() => {
                  window.location.href = `?folder=${folder.id}`;
                }}
              >
                <div className="flex flex-row gap-1">
                  <FontAwesomeIcon
                    icon={faFolder}
                    className="text-gray-400 text-[10px] group-hover:text-indigo-500 group-hover:cursor-pointer group-hover:text-white py-3 px-2"
                  />
                  <div
                    onClick={() => setCreateNewFolder(true)}
                    className="text-gray-400 text-[10px] py-2 px-2 group-hover:text-gray-600 group-hover:cursor-pointer"
                  >
                    <div className="text-gray-600 text-[14px]">
                      {folder.name}
                    </div>
                  </div>
                </div>
                <div className="flex flex-row gap-1">
                  <FontAwesomeIcon
                    icon={faInfo}
                    className="text-gray-400 text-[10px] group-hover:cursor-pointer py-3 px-3"
                  />
                  <div
                    onClick={() => setCreateNewFolder(true)}
                    className="text-gray-400 text-[10px] py-2 px-2 group-hover:text-gray-600 group-hover:cursor-pointer"
                  >
                    <div className="text-gray-600 text-[10px]">
                      {folder.description}
                    </div>
                  </div>
                </div>
                <div className="flex flex-row gap-4">
                  <div className="flex flex-row">
                    <FontAwesomeIcon
                      icon={faClock}
                      className="text-gray-400 text-[10px] group-hover:cursor-pointer py-3 px-3"
                    />
                    <div
                      onClick={() => setCreateNewFolder(true)}
                      className="text-gray-400 text-[10px] py-2 group-hover:text-gray-600 group-hover:cursor-pointer"
                    >
                      <div className="text-gray-400 text-[10px]">
                        <Moment fromNow>{folder.created_at}</Moment>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-row">
                    <FontAwesomeIcon
                      icon={faUser}
                      className="text-gray-400 text-[10px] group-hover:cursor-pointer py-3 px-3"
                    />
                    <div
                      onClick={() => setCreateNewFolder(true)}
                      className="text-gray-400 text-[10px] py-2 group-hover:text-gray-600 group-hover:cursor-pointer"
                    >
                      <div className="text-gray-400 text-[10px]">
                        {folder.created_by}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          : null}
      </div>
    </section>
  );
};

export default Forum;
