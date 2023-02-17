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
  faTicket,
  faNewspaper,
  faMessage,
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
            <div className="bg-white rounded-[1rem]" key={index}>
              <div
                className=" group flex flex-row gap-1 bg-secondary-gray rounded-t-[1rem] hover:cursor-pointer hover:bg-primary-indigo"
                onClick={() => {
                  window.location.href = `?folder=${folder.id}`;
                }}
              >
                <FontAwesomeIcon
                  icon={faFolder}
                  className="text-secondary-text text-[0.7rem] group-hover:text-white group-hover:cursor-pointerpy-3 px-2 py-3"
                />
                <div className="text-primary-text text-[0.9rem] py-2 px-2 group-hover:text-white group-hover:cursor-pointer">
                  {folder.name}
                </div>
              </div>
              <div className="flex flex-row gap-1">
                <FontAwesomeIcon
                  icon={faInfo}
                  className="text-secondary-text text-[0.7rem] group-hover:cursor-pointer py-3 px-3"
                />
                <div className="text-secondary-text text-[0.8rem] py-2 px-2 group-hover:text-primary-text group-hover:cursor-pointer">
                  <div className="text-primary-text text-[0.7rem]">
                    {folder.description}
                  </div>
                </div>
              </div>
              <div className="flex flex-row gap-1 ml-2 flex-wrap">
                <div className="flex flex-row">
                  <div className="text-secondary-text text-[0.7rem] py-2 group-hover:text-primary-text group-hover:cursor-pointer">
                    Siste aktivitet:
                  </div>
                </div>
                <div className="flex flex-row">
                  <FontAwesomeIcon
                    icon={faClock}
                    className="text-secondary-text text-[0.7rem] group-hover:cursor-pointer py-3 px-3"
                  />
                  <div className="text-secondary-text text-[0.7rem] py-2 group-hover:text-primary-text group-hover:cursor-pointer">
                    <div className="text-secondary-text text-[0.7rem]">
                      <Moment fromNow>
                        {folder.last_post_at
                          ? folder.last_post_at
                          : folder.modified}
                      </Moment>
                    </div>
                  </div>
                </div>
                <div className="flex flex-row">
                  <FontAwesomeIcon
                    icon={faUser}
                    className="text-secondary-text text-[0.7rem] group-hover:cursor-pointer py-3 px-3"
                  />
                  <div className="text-secondary-text text-[0.7rem] py-2 group-hover:text-primary-text group-hover:cursor-pointer">
                    <div className="text-secondary-text text-[0.7rem]">
                      {folder.last_post_by
                        ? folder.last_post_by
                        : folder.created_by}
                    </div>
                  </div>
                </div>
                <div
                  className="group flex flex-row text-secondary-text  hover:text-primary-indigo text-[0.7rem]"
                  onClick={() => {
                    window.location.href = folder.latest_activity_discussion?.id
                      ? `?discussion=${folder.latest_activity_discussion.id}`
                      : `?folder=${folder.id}`;
                  }}
                >
                  <FontAwesomeIcon
                    icon={faMessage}
                    className="group-hover:cursor-pointer py-3 px-3"
                  />
                  <div className="py-2 group-hover:text-primary-text group-hover:cursor-pointer">
                    {folder.latest_activity_discussion
                      ? folder.latest_activity_discussion
                      : "Ingen aktivitet"}
                  </div>
                </div>
                <div className="flex flex-row">
                  <FontAwesomeIcon
                    icon={faTicket}
                    className="text-secondary-text text-[0.7rem] group-hover:cursor-pointer py-3 px-3"
                  />
                  <div className="text-secondary-text text-[0.7rem] py-2 group-hover:text-primary-text group-hover:cursor-pointer">
                    <div className="text-secondary-text text-[0.7rem]">
                      {folder.total_posts ? folder.total_posts : 0}
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
