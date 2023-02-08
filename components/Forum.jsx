"use client";

// Import dependencies
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useState } from "react";
import { supabase } from "../lib/supabaseClient";
import Moment from "react-moment";
import "moment-timezone";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

// Import components
import Sidebar from "../components/Sidebar";

const Forum = (props) => {
  const [createNewFolder, setCreateNewFolder] = useState(false);
  const [createNewFolderName, setCreateNewFolderName] = useState("");
  const [createNewFolderDescription, setCreateNewFolderDescription] =
    useState("");
  const [createNewSubFolder, setCreateNewSubFolder] = useState(false);
  const [discussions, setDiscussions] = useState(null);
  const [selectedDiscussionId, setSelectedDiscussionId] = useState(null);
  const [selectedDiscussion, setSelectedDiscussion] = useState(null);
  const [selectedDiscussionPosts, setSelectedDiscussionPosts] = useState(null);
  const [createNewPost, setCreateNewPost] = useState(false);
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
  });

  if (selectedFolderId && !folders) {
    fetchFolders(selectedFolderId);
  }

  // FUNCTIONS
  // Handles back click from folder and removes the selected folder from url
  function handleFolderBackClick() {
    window.location.assign("/");
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
  }

  // Get the selected folders discussions
  async function fetchSelectedFolderDiscussions() {
    const { data, error } = await supabase
      .from("discussions")
      .select()
      .eq("parent_folder", selectedFolderId);

    if (data && !error && !selectedFolder) {
      setDiscussions(data);
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
  }

  // Get the selected discussion posts
  async function fetchSelectedDiscussionPosts() {
    const { data, error } = await supabase
      .from("posts")
      .select()
      .eq("id", selectedDiscussionId);

    if (data && !error && !selectedFolder) {
      setSelectedDiscussionPosts(data[0]);
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
      await supabase.from("folders").insert({
        name: createNewFolderName,
        description: createNewFolderDescription,
        created_by: props.currentUserSession?.user?.user_metadata?.user_name,
        parent: parent,
        parent_array: currentParrentArray,
      });

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
      await supabase.from("discussions").insert({
        title: createNewDiscussionTitle,
        description: createNewDiscussionDescription,
        created_by: props.currentUserSession?.user?.user_metadata?.user_name,
        parent_folder: selectedFolderId,
      });

      if (discussions) {
        setDiscussions(null);
      }
      setCreateNewDiscussion(false);
      setCreateNewDiscussionTitle("");
      setCreateNewDiscussionDescription("");
      fetchSelectedFolder();
    }
  }

  if (selectedDiscussion) {
    console.log(selectedDiscussion);
  }

  if (createNewFolder) {
    return (
      <section className={`relative`}>
        <div className="flex flex-col">
          <div className="text-black font-semibold">Opprett ny mappe</div>
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
              onClick={() => createFolder(0)}
            >
              Opprett
            </button>
          ) : null}
          <button
            className="bg-primary-red text-white rounded-[24px] px-4 py-2 mt-2"
            onClick={() => setCreateNewFolder(false)}
          >
            Avbryt
          </button>
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

  if (createNewDiscussion) {
    return (
      <section className={`relative`}>
        <div className="flex flex-col">
          <div className="text-black font-semibold">
            Opprett ny tråd i {selectedFolder.name}
          </div>
          <label className="text-gray-500 mt-2">Trådnavn</label>
          <input
            className="border border-gray-300 rounded-[24px] px-4 py-2 mt-1"
            type="text"
            placeholder="Trådnavn"
            required
            onChange={(e) => setCreateNewDiscussionTitle(e.target.value)}
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
            onChange={(e) => setCreateNewDiscussionDescription(e.target.value)}
          ></input>
          <label className="text-gray-400 text-[12px]">
            Dette feltet er ikke obligatorisk
          </label>
          {createNewDiscussionTitle.length > 2 ? (
            <button
              className="bg-primary-blue text-white rounded-[24px] px-4 py-2 mt-4"
              onClick={() => createDiscussion()}
            >
              Opprett
            </button>
          ) : null}
          <button
            className="bg-primary-red text-white rounded-[24px] px-4 py-2 mt-2"
            onClick={() => setCreateNewDiscussion()}
          >
            Avbryt
          </button>
        </div>
      </section>
    );
  }

  if (createNewPost) {
    return (
      <section className={`relative`}>
        <div className="flex flex-col">
          <div className="text-black font-semibold">
            Opprett ny post i {selectedFolder.name}
          </div>
          <label className="text-gray-500 mt-2">Trådnavn</label>
          <ReactQuill
            theme="snow"
            value={createNewPostContent}
            onChange={setCreateNewPostContent}
            className="h-[400px]"
          />
          <label className="text-gray-400 text-[12px]">
            Dette feltet er obligatorisk og må være på mer enn 3 tegn
          </label>
          {createNewDiscussionTitle.length > 2 ? (
            <button
              className="bg-primary-blue text-white rounded-[24px] px-4 py-2 mt-4"
              onClick={() => createDiscussion()}
            >
              Opprett
            </button>
          ) : null}
          <button
            className="bg-primary-red text-white rounded-[24px] px-4 py-2 mt-2"
            onClick={() => setCreateNewDiscussion()}
          >
            Avbryt
          </button>
        </div>
      </section>
    );
  }

  if (selectedFolder && !selectedDiscussion) {
    return (
      <section className={`relative`}>
        <div className="flex flex-row">
          {props.currentUserSession?.user?.aud === "authenticated" ? (
            <div>
              <button
                className="bg-primary-blue text-white rounded-[24px] px-4 py-2 mr-2"
                onClick={() => setCreateNewDiscussion(true)}
              >
                Opprett ny diskusjon
              </button>
              <button
                className="bg-primary-blue text-white rounded-[24px] px-4 py-2"
                onClick={() => setCreateNewSubFolder(true)}
              >
                Opprett ny undermappe
              </button>
            </div>
          ) : null}
        </div>
        <div className="flex flex-row">
          {selectedFolder.parent_array.map((parent, index) => (
            <div
              className="text-gray-600 text-[12px] hover:text-primary-blue hover:cursor-pointer mt-4 mb-2 ml-2 bg-gray-100 rounded-[24px] px-2"
              onClick={() => (window.location.href = `?folder=${parent.id}`)}
              key={index}
            >
              {parent.name}
            </div>
          ))}
          <div className="text-white text-[12px] mt-4 mb-2 ml-2 bg-primary-blue rounded-[24px] px-2">
            {selectedFolder.name}
          </div>
        </div>
        <div className="flex flex-col gap-2">
          {folders?.length > 0 ? (
            <div className="flex flex-col gap-2">
              <div className="text-white bg-gradient-to-r from-primary-blue to-white rounded-[24px] px-2">
                Mapper
              </div>
              {folders.map((folder, index) => (
                <div
                  className="bg-gray-200 rounded-[24px] px-4 py-2 mr-2 hover:cursor-pointer hover:bg-gray-300"
                  key={index}
                  onClick={() => {
                    window.location.href = `?folder=${folder.id}`;
                  }}
                >
                  <div className="text-black font-semibold">{folder.name}</div>
                  <div className="text-gray-500">{folder.description}</div>
                  <div className="flex flex-row gap-4">
                    <div className="text-gray-400 text-[12px]">
                      Opprettet: <Moment fromNow>{folder.created_at}</Moment>
                    </div>
                    <div className="text-gray-400 text-[12px]">
                      Opprettet av: {folder.created_by}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : null}
          {discussions?.length > 0 ? (
            <div className="flex flex-col gap-2">
              <div className="text-white bg-gradient-to-r from-primary-blue to-white rounded-[24px] px-2">
                Tråder
              </div>
              {discussions.map((discussion, index) => (
                <div
                  className="bg-gray-200 rounded-[24px] px-4 py-2 mr-2 hover:cursor-pointer hover:bg-gray-300"
                  key={index}
                  onClick={() => {
                    window.location.href = `?folder=${selectedFolder.id}&discussion=${discussion.id}`;
                  }}
                >
                  <div className="text-black font-semibold">
                    {discussion.title}
                  </div>
                  <div className="text-gray-500">
                    {discussion.description ? discussion.description : ""}
                  </div>
                  <div className="flex flex-row gap-4">
                    <div className="text-gray-400 text-[12px]">
                      Opprettet:{" "}
                      <Moment fromNow>{discussion.created_at}</Moment>
                    </div>
                    <div className="text-gray-400 text-[12px]">
                      Opprettet av: {discussion.created_by}
                    </div>
                    <div className="text-gray-400 text-[12px]">
                      Antall poster: {discussion.total_posts}
                    </div>
                    <div className="text-gray-400 text-[12px]">
                      {discussion.last_post_at ? (
                        <div>
                          Siste post:{" "}
                          <Moment fromNow>{discussion.last_post_at}</Moment>
                        </div>
                      ) : (
                        "Siste post: Aldri"
                      )}
                    </div>
                    <div className="text-gray-400 text-[12px]">
                      {discussion.last_post_by ? (
                        <div>Siste post av: {discussion.last_post_at}</div>
                      ) : (
                        "Siste post av: Ingen"
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      </section>
    );
  }

  if (selectedFolder && selectedDiscussion) {
    return (
      <section className={`relative`}>
        <div className="flex flex-row">
          {props.currentUserSession?.user?.aud === "authenticated" ? (
            <div>
              <button
                className="bg-primary-blue text-white rounded-[24px] px-4 py-2"
                onClick={() => setCreateNewPost(true)}
              >
                Ny post
              </button>
            </div>
          ) : null}
        </div>
        <div className="flex flex-row">
          {selectedFolder.parent_array.map((parent, index) => (
            <div
              className="text-gray-600 text-[12px] hover:text-primary-blue hover:cursor-pointer mt-4 mb-2 ml-2 bg-gray-100 rounded-[24px] px-2"
              onClick={() => (window.location.href = `?folder=${parent.id}`)}
              key={index}
            >
              {parent.name}
            </div>
          ))}
          <div
            className="text-gray-600 text-[12px] hover:text-primary-blue hover:cursor-pointer mt-4 mb-2 ml-2 bg-gray-100 rounded-[24px] px-2"
            onClick={() =>
              (window.location.href = `?folder=${selectedFolder.id}`)
            }
          >
            {selectedFolder.name}
          </div>
          <div className="text-white text-[12px] mt-4 mb-2 ml-2 bg-primary-blue rounded-[24px] px-2">
            {selectedDiscussion.title}
          </div>
        </div>
        <div className="flex flex-col gap-2">
          {selectedDiscussionPosts?.length > 0 ? (
            <div className="flex flex-col gap-2">
              <div className="text-white bg-gradient-to-r from-primary-blue to-white rounded-[24px] px-2">
                Mapper
              </div>
              {folders.map((folder, index) => (
                <div
                  className="bg-gray-200 rounded-[24px] px-4 py-2 mr-2 hover:cursor-pointer hover:bg-gray-300"
                  key={index}
                  onClick={() => {
                    window.location.href = `?folder=${folder.id}`;
                  }}
                >
                  <div className="text-black font-semibold">{folder.name}</div>
                  <div className="text-gray-500">{folder.description}</div>
                  <div className="flex flex-row gap-4">
                    <div className="text-gray-400 text-[12px]">
                      Opprettet: <Moment fromNow>{folder.created_at}</Moment>
                    </div>
                    <div className="text-gray-400 text-[12px]">
                      Opprettet av: {folder.created_by}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      </section>
    );
  }

  return (
    <section className={`relative`}>
      <div className="flex flex-row">
        {props.currentUserSession?.user?.aud === "authenticated" ? (
          <button
            className="bg-primary-blue text-white rounded-[24px] px-4 py-2"
            onClick={() => setCreateNewFolder(true)}
          >
            Opprett ny mappe
          </button>
        ) : null}
      </div>
      <div className="flex flex-col gap-2 mt-4">
        {folders?.length > 0
          ? folders.map((folder, index) => (
              <div
                className="bg-gray-200 rounded-[24px] px-4 py-2 mr-2 hover:cursor-pointer hover:bg-gray-300"
                key={index}
                onClick={() => {
                  window.location.href = `?folder=${folder.id}`;
                }}
              >
                <div className="text-black font-semibold">{folder.name}</div>
                <div className="text-gray-500">{folder.description}</div>
                <div className="flex flex-row gap-4">
                  <div className="text-gray-400 text-[12px]">
                    Opprettet: <Moment fromNow>{folder.created_at}</Moment>
                  </div>
                  <div className="text-gray-400 text-[12px]">
                    Opprettet av: {folder.created_by}
                  </div>
                </div>
              </div>
            ))
          : "Ingen mapper"}
      </div>
    </section>
  );
};

export default Forum;
