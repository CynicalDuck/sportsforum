"use client";

import { useEffect } from "react";

import { supabase } from "../lib/supabaseClient";
import { useState } from "react";
import Sidebar from "../components/Sidebar";
import { getForumFolders } from "../pages/api";

const Forum = (props) => {
  const [createNewFolder, setCreateNewFolder] = useState(false);
  const [createNewFolderName, setCreateNewFolderName] = useState("");
  const [folders, setFolders] = useState(null);

  useEffect(() => {
    fetchFolders();
  });

  // FUNCTIONS
  // Get all folders
  async function fetchFolders() {
    const { data, error } = await supabase.from("folders").select();
    if (!folders) {
      setFolders(data);
    }
  }

  // Create new folders
  async function createFolder() {
    if (createNewFolderName) {
      await supabase.from("folders").insert({ name: createNewFolderName });

      if (folders) {
        setFolders(null);
      }
      setCreateNewFolder(false);
      setCreateNewFolderName("");
      fetchFolders();
    }
  }

  if (createNewFolder) {
    return (
      <section className={`relative`}>
        <div className="flex flex-col">
          <div className="text-black font-semibold">Opprett ny mappe</div>
          <input
            className="border border-gray-300 rounded-[24px] px-4 py-2 mt-1"
            type="text"
            placeholder="Navn på mappe"
            required
            onChange={(e) => setCreateNewFolderName(e.target.value)}
          ></input>
          <button
            className="bg-blue-500 text-white rounded-[24px] px-4 py-2 mt-2"
            onClick={() => createFolder()}
          >
            Opprett
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className={`relative`}>
      <div className="flex flex-row">
        {props.currentUserSession?.user?.aud === "authenticated" ? (
          <button
            className="bg-blue-500 text-white rounded-[24px] px-4 py-2"
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
                className="bg-gray-200 rounded-[24px] px-4 py-2 mr-2"
                key={index}
              >
                <div className="text-black font-semibold">{folder.name}</div>
              </div>
            ))
          : "Ingen mapper"}
      </div>
    </section>
  );
};

export default Forum;
