// React functional component

// Imports
import React, { useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";
import Moment from "react-moment";
import "moment-timezone";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { LeafPoll, Result } from "react-leaf-polls";
import "react-leaf-polls/dist/index.css";

// Components
import Editor from "./Editor";

// Icons
import {
  faFolder,
  faInfo,
  faUser,
  faClock,
  faPen,
} from "@fortawesome/free-solid-svg-icons";

const Folders = (props) => {
  // STATES
  const [folders, setFolders] = useState(null);
  const [editFolder, setEditFolder] = useState(false);

  // USE EFFECT
  useEffect(() => {
    fetchFolders(0);
  }, []);

  // FUNCTIONS
  // Get all folders
  async function fetchFolders(parent) {
    const { data, error } = await supabase.from("folders").select();
    if (!folders) {
      setFolders(data);
    }

    if (error) {
      props.handleError(error.message);
    }
  }

  return folders?.length > 0
    ? folders.map(
        (folder, index) =>
          folder.deleted === false && (
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
                  className="text-gray-400 text-[0.7rem] group-hover:text-indigo-500 group-hover:cursor-pointerpy-3 px-2"
                />
                <div className="text-gray-400 text-[0.7rem] py-2 px-2 group-hover:text-gray-600 group-hover:cursor-pointer">
                  <div className="text-gray-600 text-[0.9rem]">
                    {folder.name}
                  </div>
                </div>
              </div>
              <div className="flex flex-row gap-1">
                <FontAwesomeIcon
                  icon={faInfo}
                  className="text-gray-400 text-[0.7rem] group-hover:cursor-pointer py-3 px-3"
                />
                <div className="text-gray-400 text-[0.8rem] py-2 px-2 group-hover:text-gray-600 group-hover:cursor-pointer">
                  <div className="text-gray-600 text-[0.7rem]">
                    {folder.description}
                  </div>
                </div>
              </div>
              <div className="flex flex-row gap-4">
                <div className="flex flex-row">
                  <FontAwesomeIcon
                    icon={faClock}
                    className="text-gray-400 text-[0.7rem] group-hover:cursor-pointer py-3 px-3"
                  />
                  <div className="text-gray-400 text-[0.7rem] py-2 group-hover:text-gray-600 group-hover:cursor-pointer">
                    <div className="text-gray-400 text-[0.7rem]">
                      <Moment fromNow>{folder.modified}</Moment>
                    </div>
                  </div>
                </div>
                <div className="flex flex-row">
                  <FontAwesomeIcon
                    icon={faUser}
                    className="text-gray-400 text-[0.7rem] group-hover:cursor-pointer py-3 px-3"
                  />
                  <div className="text-gray-400 text-[0.7rem] py-2 group-hover:text-gray-600 group-hover:cursor-pointer">
                    <div className="text-gray-400 text-[0.7rem]">
                      {folder.created_by}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )
      )
    : null;
};

export default Folders;
