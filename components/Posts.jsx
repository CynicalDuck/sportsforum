// React functional component

// Imports
import React, { useState } from "react";
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
  faMessage,
  faBookmark,
  faThumbsUp,
  faPen,
  faArchive,
  faArrowDown,
  faTrashCan,
  faPlus,
  faMinus,
  faEdit,
  faCheck,
} from "@fortawesome/free-solid-svg-icons";

const Posts = (props) => {
  // States
  const [editPostId, setEditPostId] = useState(null);
  const [editPost, setEditPost] = useState(false);
  const [replyPost, setReplyPost] = useState(false);
  const [replyToPost, setReplyToPost] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [deletePostId, setDeletePostId] = useState(null);
  const [createPostType, setCreatePostType] = useState("post");
  const [countVoteAlternative, setCountVoteAlternative] = useState([1, 2]);
  const [editThreadTitle, setEditThreadTitle] = useState(false);
  const [editThreadTitleText, setEditThreadTitleText] = useState(
    props.discussion.title
  );

  // Set theme for polls
  const customVoteTheme = {
    textColor: "black",
    mainColor: "#00B87B",
    backgroundColor: "rgb(255,255,255)",
    alignment: "center",
  };

  // Functions

  // On Click set delete post id and show confirm delete
  async function onClickDeletePost(id) {
    setDeletePostId(id);
    setShowConfirmDelete(true);
  }

  // On Click delete post or discussion
  async function onClickConfirmDelete(id, index) {
    if (index === 0) {
      const { error } = await supabase
        .from("discussions")
        .update({ deleted_hard: true, deleted: true })
        .eq("id", props.discussion.id);

      if (error) {
        props.handleError(error.message);
      }
      if (!error) {
        props.handleSuccess("Tråden er slettet");
      }

      window.location.href = "/?folder=" + props.discussion.parent_folder;
    } else {
      const { error } = await supabase.from("posts").delete().eq("id", id);

      if (error) {
        props.handleError(error.message);
      }
      if (!error) {
        props.handleSuccess("Posten er slettet");
      }

      window.location.reload();
    }
  }

  // Bookmark discussion
  async function onClickBookmark(id) {
    var newBookmarks = [];
    var existingBookmarks = null;

    if (props.currentUserProfile) {
      existingBookmarks = props.currentUserProfile?.bookmarks;
    }

    // If there are no bookmarks yet add the first one
    if (!existingBookmarks) {
      newBookmarks.push(id);

      saveBookmarks(newBookmarks);
    }

    // If there are bookmarks, check if the discussion is already bookmarked
    if (existingBookmarks) {
      // If the discussion is already bookmarked, remove it
      if (existingBookmarks.includes(id)) {
        var index = existingBookmarks.indexOf(id);
        console.log(existingBookmarks.indexOf(id));
        if (index > -1) {
          existingBookmarks.splice(index, 1);
        }

        saveBookmarks(existingBookmarks);
      }

      // If the discussion is not bookmarked, add it
      else if (!existingBookmarks.includes(id)) {
        existingBookmarks.push(id);

        saveBookmarks(existingBookmarks);
      }
    }
  }

  // Saving bookmarks
  async function saveBookmarks(bookmarks) {
    const { error } = await supabase
      .from("users")
      .update({ bookmarks: bookmarks })
      .eq("user_id", props.currentUserSession?.user?.id);

    if (error) {
      props.handleError(error.message);
    }
    if (!error) {
      props.handleSuccess(
        "Bokmerke er oppdatert. Hurtiglister vil oppdateres ved neste refresh."
      );
    }
  }

  // When clicking on the edit post icon in the post
  async function onClickIconEditPost(post) {
    if (post.type === "post") {
      setEditPostId(post.id);
      setEditPost(true);
    }
    if (post.type === "vote") {
      setEditPostId(post.id);
      setEditPost(true);

      // Count the number of alternatives
      var array = [];
      for (var i = 0; i < post.vote_values.length; i++) {
        array.push(i);
      }

      setCountVoteAlternative([1]);
    }
  }

  // On Click reply post
  async function onClickReplyPost(post) {
    setReplyPost(true);
    setReplyToPost(post);
  }

  // Archive discussion
  async function onClickArchive() {
    const { error } = await supabase
      .from("discussions")
      .update({
        deleted: !props.discussion.deleted,
        deleted_hard: false,
      })
      .eq("id", props.discussion.id);

    if (error) {
      props.handleError(error.message);
    }
    if (!error && props.discussion.deleted === false) {
      props.handleSuccess("Tråden er arkivert");
    }
    if (!error && props.discussion.deleted === true) {
      props.handleSuccess("Tråden er ikke arkivert lenger");
    }

    window.location.reload();
  }

  // OnClick like post
  async function onClickLikeButton(post) {
    if (post.liked_by?.includes(props.currentUserProfile.user_name)) {
      var oldCount = post.count_likes;
      if (oldCount === 0) {
        var newCount = oldCount;
      } else {
        var newCount = oldCount - 1;
      }

      // Remove user from liked_by
      var likedBy = post.liked_by;
      var index = likedBy.indexOf(props.currentUserProfile.user_name);
      if (index > -1) {
        likedBy.splice(index, 1);
      }

      const { error } = await supabase
        .from("posts")
        .update({ count_likes: newCount, liked_by: likedBy })
        .eq("id", post.id);

      if (error) {
        props.handleError(error.message);
      }
      if (!error) {
        props.handleSuccess("Du liker ikke lenger denne posten");
      }

      window.location.reload();
    } else {
      var oldCount = post.count_likes;
      var newCount = oldCount + 1;

      // Add user to liked_by
      if (!post.liked_by) {
        post.liked_by = [];
      }

      var likedBy = post.liked_by;
      likedBy.push(props.currentUserProfile.user_name);

      const { error } = await supabase
        .from("posts")
        .update({ count_likes: newCount, liked_by: likedBy })
        .eq("id", post.id);

      if (error) {
        props.handleError(error.message);
      }
      if (!error) {
        props.handleSuccess("Du liker denne posten");
      }
    }

    window.location.reload();
  }

  // OnClik add rows to vote post
  async function onClickAddRowVote() {
    var oldCount = countVoteAlternative.length;
    var newArray = countVoteAlternative;

    newArray.push(oldCount + 1);

    setCountVoteAlternative(newArray);

    // rerender the component
    props.setRender(!props.render);
  }

  // OnClik remove rows from vote post
  async function onClickRemoveRowVote() {
    // Remove last item from the array
    var newArray = countVoteAlternative;
    newArray.pop();

    setCountVoteAlternative(newArray);

    // rerender the component
    props.setRender(!props.render);
  }

  // Create vote post
  async function onClickCreateVote() {
    var alternatives = [];
    var count = 0;

    // Get the alternatives from the input fields
    for (var i = 0; i < countVoteAlternative.length; i++) {
      var alternative = document.getElementById("vote" + i).value;
      alternatives.push({ id: i, text: alternative, votes: 0 });
    }

    // Create the post
    const { data, error } = await supabase
      .from("posts")
      .insert([
        {
          discussion: props.discussion.id,
          created_by_id: props.currentUserSession?.user?.id,
          created_by: props.currentUserProfile.user_name,
          created_by_avatar_url: props.currentUserProfile?.avatar_url,
          content: document.getElementById("voteTitle").value,
          vote_values: alternatives,
          count_votes: count,
          count_likes: count,
          liked_by: [],
          created_at: new Date(),
          type: "vote",
        },
      ])
      .select();

    // Update the votes id to contain the post id so that we can use that later on when updating the votes
    if (data) {
      var votes = data[0].vote_values;
      var newVotes = [];

      votes.forEach((vote) => {
        newVotes.push({
          id: vote.id,
          text: vote.text,
          votes: vote.votes,
          postId: data[0].id,
        });
      });

      const { error } = await supabase
        .from("posts")
        .update({ vote_values: newVotes })
        .eq("id", data[0].id);

      if (error) {
        props.handleError(error.message);
      }
      if (!error) {
        props.handleSuccess("Du har opprettet en avstemming");
      }
    }

    if (error) {
      props.handleError(error.message);
    }

    window.location.reload();
  }

  // Handle vote
  async function onClickVote(item, results) {
    console.log(results);
    // Get the results and create a new object that fits the database
    var newResults = [];
    var postId = results[0].postId;

    results.forEach((result) => {
      newResults.push({
        id: result.id,
        percentage: result.percentage,
        text: result.text,
        votes: result.votes,
        postId: result.postId,
      });
    });

    // Get the post using the postId and then get the users that have voted
    var usersThatHaveVoted = [];
    const { data: dataPost, error: errorPost } = await supabase
      .from("posts")
      .select()
      .eq("id", postId);

    if (dataPost) {
      // Get the users that have voted
      usersThatHaveVoted.push(dataPost[0].vote_has_voted);

      // Add the current user to the users that have voted
      usersThatHaveVoted.push(props.currentUserProfile?.user_id);
    }

    // Update the post with the results
    const { error } = await supabase
      .from("posts")
      .update({
        vote_values: newResults,
        vote_has_voted: usersThatHaveVoted,
      })
      .eq("id", postId);

    if (error) {
      props.handleError(error.message);
    }

    if (!error) {
      props.handleSuccess("Du har stemt");
    }
  }

  // Save edit thread title
  async function onClickSaveEditThreadTitle(discussion) {
    const { error } = await supabase
      .from("discussions")
      .update({
        title: editThreadTitleText,
      })
      .eq("id", discussion.id);

    if (error) {
      props.handleError(error.message);
    }

    if (!error) {
      props.handleSuccess("Du har endret tittel på tråden");
      window.location.reload();
    }
  }

  // Save vote post edit
  async function onClickSaveEditVotePost(post) {
    var alternatives = [];
    var count = 0;

    // Get existing alternatives
    post.vote_values.forEach((vote) => {
      alternatives.push({
        id: vote.id,
        text: vote.text,
        votes: vote.votes,
        percentage: vote.percentage,
      });
    });

    // Get the alternatives from the input fields
    for (
      var i = 0 + post.vote_values.length;
      i < countVoteAlternative.length + post.vote_values.length;
      i++
    ) {
      var alternative = document.getElementById("new_vote" + i).value;
      alternatives.push({ id: i, text: alternative, votes: 0, percentage: 0 });
    }

    // Create the post
    const { data, error } = await supabase
      .from("posts")
      .update([
        {
          content: document.getElementById("voteTitle").value,
          vote_values: alternatives,
          modified: new Date(),
        },
      ])
      .eq("id", post.id)
      .select();

    // Update the votes id to contain the post id so that we can use that later on when updating the votes
    if (data) {
      var votes = data[0].vote_values;
      var newVotes = [];

      votes.forEach((vote) => {
        newVotes.push({
          id: vote.id,
          text: vote.text,
          votes: vote.votes,
          postId: data[0].id,
        });
      });

      const { error } = await supabase
        .from("posts")
        .update({ vote_values: newVotes })
        .eq("id", data[0].id);

      if (error) {
        props.handleError(error.message);
      }
      if (!error) {
        props.handleSuccess("Du har opprettet en avstemming");
      }
    }

    if (error) {
      props.handleError(error.message);
    }

    window.location.reload();
  }

  return (
    <div className="flex flex-row gap-2 w-full">
      <div className="flex flex-col gap-2 w-[100%]">
        {props.posts?.length > 0
          ? props.posts.map((post, index) => (
              <div
                id={index}
                className="bg-white rounded-[10px] px-6 py-6"
                key={index}
              >
                {showConfirmDelete && deletePostId === post.id ? (
                  <div className="flex flex-col gap-2  bg-yellow-400 rounded-[10px] px-2 py-2 mb-2">
                    <div className="flex flex-row gap-2">
                      <div className="text-gray-600 text-[0.9rem]">
                        {index === 0
                          ? "Dette vil slette hele tråden, er du sikker?"
                          : "Dette vil slette denne posten, er du sikker?"}
                      </div>
                    </div>
                    <div className="flex flex-row gap-2">
                      <button
                        className="bg-indigo-500 hover:bg-indigo-600 text-white text-[0.9rem] rounded-[10px] px-2 py-2 hover:cursor-pointer"
                        onClick={() => {
                          setDeletePostId(null), setShowConfirmDelete(false);
                        }}
                      >
                        Avbryt
                      </button>
                      <button
                        className="bg-red-500 hover:bg-red-600 text-white text-[0.9rem] rounded-[10px] px-2 py-2 hover:cursor-pointer"
                        onClick={() => onClickConfirmDelete(post.id, index)}
                      >
                        Bekreft sletting
                      </button>
                    </div>
                  </div>
                ) : index === 0 ? (
                  <div className="flex flex-row gap-2 text-gray-500 mb-3">
                    {editThreadTitle ? (
                      <div className="flex flex-row gap-2">
                        <input
                          type="text"
                          className="border border-gray-300 rounded-[24px] px-2 py-2 focus:outline-indigo-500"
                          placeholder="Trådtittel"
                          defaultValue={props.discussion.title}
                          onChange={(e) =>
                            setEditThreadTitleText(e.target.value)
                          }
                        ></input>
                        <button
                          type="button"
                          className="bg-indigo-500 text-white rounded-[24px] px-4 py-2 hover:bg-indigo-600"
                          onClick={() =>
                            onClickSaveEditThreadTitle(props.discussion)
                          }
                        >
                          <FontAwesomeIcon
                            icon={faCheck}
                            className="text-white text-[0.7rem]"
                          />
                        </button>
                      </div>
                    ) : (
                      <div className="flex flex-row gap-2">
                        {props.discussion.title}
                        {props.discussion.created_by_id ===
                        props.currentUserProfile?.user_id ? (
                          <FontAwesomeIcon
                            icon={faEdit}
                            className="text-[1rem] text-gray-400 hover:cursor-pointer hover:text-indigo-500"
                            onClick={() => {
                              setEditThreadTitle(true);
                            }}
                          />
                        ) : null}
                      </div>
                    )}
                  </div>
                ) : null}
                <div className="flex flex-col gap-2">
                  <div className="flex flex-row gap-2">
                    <img
                      src={post.created_by_avatar_url}
                      className="w-12 h-12 rounded-[4px] shadow-sm shadow-black"
                    />
                    <div className="flex flex-col">
                      <div className="text-gray-600 text-[0.9rem] hover:text-indigo-500 hover:cursor-pointer">
                        {post.created_by}
                      </div>
                      <div className="text-gray-400 text-[0.7rem]">
                        #{index + 1}
                      </div>
                      <div className="text-gray-400 text-[0.7rem]">
                        <Moment fromNow>{post.created_at}</Moment>
                      </div>
                    </div>
                  </div>
                  <div className="text-gray-600 text-[0.9rem] mt-4">
                    {editPost && editPostId === post.id ? (
                      <div className="flex flex-col gap 4">
                        {post.type === "post" ? (
                          <Editor
                            currentUserProfile={props.currentUserProfile}
                            currentUserSession={props.currentUserSession}
                            discussion={props.discussion}
                            action={"edit"}
                            post={post}
                            handleError={props.handleError}
                            handleSuccess={props.handleSuccess}
                            postButton={true}
                            abortButton={true}
                            abortButtonAction={() => setEditPost(false)}
                          />
                        ) : null}
                        {post.type === "vote" ? (
                          <div className="flex flex-col gap-2">
                            <div
                              className="group flex flex-row gap-2 hover:cursor-pointer"
                              onClick={() => onClickAddRowVote()}
                            >
                              <FontAwesomeIcon
                                icon={faPlus}
                                className="text-gray-500 text-[1.2rem] group-hover:text-indigo-500 group-hover:cursor-pointer "
                              />
                              <div className="text-gray-500 text-[0.8rem]">
                                Legg til flere valgalternativer
                              </div>
                            </div>
                            <input
                              type="text"
                              id={"voteTitle"}
                              className="border border-gray-300 rounded-[24px] px-4 py-2 focus:outline-indigo-500 mb-1 w-full"
                              placeholder={"Tittel på avstemming"}
                              defaultValue={post.content}
                              required
                            ></input>
                            {post.vote_values?.map((item, index) => (
                              <input
                                type="text"
                                key={index}
                                id={"vote" + index}
                                className="border border-gray-300 rounded-[24px] px-4 py-2 focus:outline-indigo-500 mb-1 w-full"
                                defaultValue={item.text}
                                required
                              ></input>
                            ))}
                            {countVoteAlternative?.map((item, index) => (
                              <input
                                type="text"
                                key={index}
                                id={
                                  "new_vote" + (index + post.vote_values.length)
                                }
                                className="border border-gray-300 rounded-[24px] px-4 py-2 focus:outline-indigo-500 mb-1 w-full"
                                placeholder={
                                  "Valgalternativ " +
                                  (item + post.vote_values.length)
                                }
                                required
                              ></input>
                            ))}
                            {countVoteAlternative.length +
                              post.vote_values.length >
                            2 ? (
                              <div
                                className="group flex flex-row gap-2 cursor-pointer"
                                onClick={() => onClickRemoveRowVote()}
                              >
                                <FontAwesomeIcon
                                  icon={faMinus}
                                  className="text-gray-500 text-[1.2rem] group-hover:text-indigo-500 group-hover:cursor-pointer "
                                />
                                <div className="text-gray-500 text-[0.8rem]">
                                  Fjern valgalternativ
                                </div>
                              </div>
                            ) : null}

                            <div className="flex flex-row gap-2">
                              <button
                                className="bg-red-500 hover:bg-red-600 hover:cursor-pointer text-white rounded-[24px] px-4 py-2 mt-4"
                                onClick={() => setEditPost(false)}
                              >
                                Avbryt
                              </button>
                              <button
                                className="bg-indigo-500 hover:bg-indigo-600 hover:cursor-pointer text-white rounded-[24px] px-4 py-2 mt-4"
                                onClick={() => onClickSaveEditVotePost(post)}
                              >
                                Lagre endringer
                              </button>
                            </div>
                          </div>
                        ) : null}
                      </div>
                    ) : post.type === "post" ? (
                      <div dangerouslySetInnerHTML={{ __html: post.content }} />
                    ) : post.type === "vote" ? (
                      <div className="flex flex-col gap-2">
                        {post.vote_has_voted?.includes(
                          props.currentUserProfile?.user_id
                        ) ? (
                          <div className="text-gray-600 text-[0.9rem]">
                            Du har allerede stemt og kan ikke stemme på nytt.
                          </div>
                        ) : null}
                        <LeafPoll
                          type="multiple"
                          question={post.content}
                          results={post.vote_values}
                          theme={customVoteTheme}
                          onVote={onClickVote}
                          isVoted={
                            post.vote_has_voted?.includes(
                              props.currentUserProfile?.user_id
                            )
                              ? true
                              : false
                          }
                        />
                      </div>
                    ) : null}
                  </div>
                  {props.currentUserSession?.user?.aud === "authenticated" &&
                  !editPost ? (
                    <div className="flex flex-row gap-3">
                      {index === 0 ? (
                        !props.discussion.deleted ? (
                          <div className="group flex flex-row gap-1">
                            {props.currentUserProfile?.bookmarks?.includes(
                              props.discussion.id
                            ) ? (
                              <div
                                className="bg-indigo-500 rounded-[10px] py-2 px-2 group-hover:bg-indigo-600 flex flex-row gap-1"
                                onClick={() =>
                                  onClickBookmark(props.discussion.id)
                                }
                              >
                                <FontAwesomeIcon
                                  icon={faBookmark}
                                  className="text-white text-[15px] group-hover:text-white group-hover:cursor-pointer "
                                />
                                <div className="text-white text-[0.7rem] group-hover:text-white group-hover:cursor-pointer hidden lg:block">
                                  Fjern fra lagrede tråder
                                </div>
                              </div>
                            ) : (
                              <div
                                className="bg-gray-100 rounded-[10px] py-2 px-2 group-hover:bg-indigo-500 flex flex-row gap-1"
                                onClick={() =>
                                  onClickBookmark(props.discussion.id)
                                }
                              >
                                <FontAwesomeIcon
                                  icon={faBookmark}
                                  className="text-gray-400 text-[15px] group-hover:text-white group-hover:cursor-pointer "
                                />
                                <div className="text-gray-400 text-[0.7rem] group-hover:text-white group-hover:cursor-pointer hidden lg:block">
                                  Lagre tråden
                                </div>
                              </div>
                            )}
                          </div>
                        ) : null
                      ) : null}
                      {props.discussion.deleted ? null : (
                        <div className="group flex flex-row gap-1">
                          <div
                            className="bg-gray-100 rounded-[10px] py-2 px-2 group-hover:bg-indigo-500 flex flex-row gap-1"
                            onClick={() => onClickReplyPost(post)}
                          >
                            <FontAwesomeIcon
                              icon={faMessage}
                              className="text-gray-400 text-[15px] group-hover:text-white group-hover:cursor-pointer "
                            />
                            <div className="text-gray-400 text-[0.7rem] group-hover:text-white group-hover:cursor-pointer hidden lg:block">
                              Svar
                            </div>
                          </div>
                        </div>
                      )}
                      {props.currentUserProfile?.user_name ===
                        post.created_by || props.currentUserProfile?.is_mod ? (
                        props.discussion.deleted ? null : (
                          <div className="group flex flex-row gap-1">
                            <div
                              className="bg-gray-100 rounded-[10px] py-2 px-2 group-hover:bg-indigo-500 flex flex-row gap-1"
                              onClick={() => onClickIconEditPost(post)}
                            >
                              <FontAwesomeIcon
                                icon={faPen}
                                className="text-gray-400 text-[15px] group-hover:text-white group-hover:cursor-pointer "
                              />
                              <div className="text-gray-400 text-[0.7rem] group-hover:text-white group-hover:cursor-pointer hidden lg:block">
                                Rediger
                              </div>
                            </div>
                          </div>
                        )
                      ) : null}
                      {index === 0 &&
                      (props.currentUserProfile?.user_name ===
                        props.discussion.created_by ||
                        props.currentUserProfile?.is_mod) ? (
                        <div className="group flex flex-row gap-1">
                          {props.discussion.deleted ? (
                            <div
                              className="bg-indigo-500 rounded-[10px] py-2 px-2 group-hover:bg-indigo-600 flex flex-row gap-1"
                              onClick={() => onClickArchive()}
                            >
                              <FontAwesomeIcon
                                icon={faArchive}
                                className="text-white text-[15px] group-hover:text-white group-hover:cursor-pointer "
                              />
                              <div className="text-white text-[0.7rem] group-hover:text-white group-hover:cursor-pointer hidden lg:block">
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
                                className="text-gray-400 text-[15px] group-hover:text-white group-hover:cursor-pointer "
                              />
                              <div className="text-gray-400 text-[0.7rem] group-hover:text-white group-hover:cursor-pointer hidden lg:block">
                                Arkiver denne tråden
                              </div>
                            </div>
                          )}
                        </div>
                      ) : null}
                      {props.discussion.deleted ? null : (
                        <div className="flex flex-row gap-1">
                          <div
                            className={
                              post.liked_by?.includes(
                                props.currentUserProfile?.user_name
                              )
                                ? "group bg-indigo-500 text-white hover:bg-indigo-600 rounded-[10px] py-2 px-2 flex flex-row gap-1 hover:cursor-pointer"
                                : "group bg-gray-100 rounded-[10px] py-2 px-2 hover:bg-indigo-500 flex flex-row gap-1 hover:cursor-pointer"
                            }
                            onClick={() => onClickLikeButton(post)}
                          >
                            <FontAwesomeIcon
                              icon={faThumbsUp}
                              className={
                                post.liked_by?.includes(
                                  props.currentUserProfile?.user_name
                                )
                                  ? "text-white text-[15px] group-hover:text-white"
                                  : "text-gray-400 text-[15px] group-hover:text-white"
                              }
                            />
                            <div
                              className={
                                post.liked_by?.includes(
                                  props.currentUserProfile?.user_name
                                )
                                  ? "text-white group-hover:text-white"
                                  : "text-gray-400 group-hover:text-white"
                              }
                            >
                              {post.count_likes}
                            </div>
                          </div>
                        </div>
                      )}
                      {props.discussion.deleted ? null : (
                        <div
                          className="group flex flex-row gap-1"
                          onClick={() => onClickDeletePost(post.id)}
                        >
                          <div className="bg-gray-100 rounded-[10px] py-2 px-2 group-hover:bg-indigo-500 flex flex-row gap-1 hover:cursor-pointer">
                            <FontAwesomeIcon
                              icon={faTrashCan}
                              className="text-gray-400 text-[15px] group-hover:text-white"
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
            <div className="flex flex-col gap 4">
              {replyPost ? (
                <Editor
                  disabled={props.discussion.deleted}
                  currentUserProfile={props.currentUserProfile}
                  currentUserSession={props.currentUserSession}
                  discussion={props.discussion}
                  action={"reply"}
                  post={replyToPost}
                  handleError={props.handleError}
                  handleSuccess={props.handleSuccess}
                  postButton={!props.discussion.deleted}
                  abortButton={false}
                />
              ) : (
                <div className="flex flex-col gap-2">
                  {props.discussion.deleted ? null : (
                    <div className="flex flex-row gap-2">
                      <button
                        className={
                          createPostType === "post"
                            ? "bg-indigo-600 hover:bg-indigo-700 hover:cursor-pointer text-white rounded-[24px] px-4 py-2 mt-4"
                            : "bg-indigo-500 hover:bg-indigo-600 hover:cursor-pointer text-white rounded-[24px] px-4 py-2 mt-4"
                        }
                        onClick={() => setCreatePostType("post")}
                      >
                        Normal post
                      </button>
                      <button
                        className={
                          createPostType === "vote"
                            ? "bg-indigo-600 hover:bg-indigo-700 hover:cursor-pointer text-white rounded-[24px] px-4 py-2 mt-4"
                            : "bg-indigo-500 hover:bg-indigo-600 hover:cursor-pointer text-white rounded-[24px] px-4 py-2 mt-4"
                        }
                        onClick={() => setCreatePostType("vote")}
                      >
                        Avstemming
                      </button>
                    </div>
                  )}
                  {createPostType === "post" ? (
                    <Editor
                      disabled={props.discussion.deleted}
                      currentUserProfile={props.currentUserProfile}
                      currentUserSession={props.currentUserSession}
                      discussion={props.discussion}
                      action={"post"}
                      handleError={props.handleError}
                      handleSuccess={props.handleSuccess}
                      postButton={!props.discussion.deleted}
                      abortButton={false}
                    />
                  ) : null}
                  {createPostType === "vote" ? (
                    <div className="flex flex-col gap-2">
                      <div
                        className="group flex flex-row gap-2 hover:cursor-pointer"
                        onClick={() => onClickAddRowVote()}
                      >
                        <FontAwesomeIcon
                          icon={faPlus}
                          className="text-gray-500 text-[1.2rem] group-hover:text-indigo-500 group-hover:cursor-pointer "
                        />
                        <div className="text-gray-500 text-[0.8rem]">
                          Legg til flere valgalternativer
                        </div>
                      </div>
                      <input
                        type="text"
                        id={"voteTitle"}
                        className="border border-gray-300 rounded-[24px] px-4 py-2 focus:outline-indigo-500 mb-1 w-full"
                        placeholder={"Tittel på avstemming"}
                        required
                      ></input>
                      {countVoteAlternative?.map((item, index) => (
                        <input
                          type="text"
                          key={index}
                          id={"vote" + index}
                          className="border border-gray-300 rounded-[24px] px-4 py-2 focus:outline-indigo-500 mb-1 w-full"
                          placeholder={"Valgalternativ " + item}
                          required
                        ></input>
                      ))}
                      {countVoteAlternative.length > 2 ? (
                        <div
                          className="group flex flex-row gap-2 cursor-pointer"
                          onClick={() => onClickRemoveRowVote()}
                        >
                          <FontAwesomeIcon
                            icon={faMinus}
                            className="text-gray-500 text-[1.2rem] group-hover:text-indigo-500 group-hover:cursor-pointer "
                          />
                          <div className="text-gray-500 text-[0.8rem]">
                            Fjern valgalternativ
                          </div>
                        </div>
                      ) : null}
                      {countVoteAlternative.length > 1 ? (
                        <button
                          className={
                            createPostType === "vote"
                              ? "bg-indigo-600 hover:bg-indigo-700 hover:cursor-pointer text-white rounded-[24px] px-4 py-2 mt-4"
                              : "bg-indigo-500 hover:bg-indigo-600 hover:cursor-pointer text-white rounded-[24px] px-4 py-2 mt-4"
                          }
                          onClick={() => onClickCreateVote()}
                        >
                          Opprett avstemming
                        </button>
                      ) : null}
                    </div>
                  ) : null}
                </div>
              )}
            </div>
          ) : null
        ) : null}
      </div>
      <div className="flex flex-col">
        <FontAwesomeIcon
          icon={faArrowDown}
          className="text-gray-400 text-[1rem] hover:text-indigo-500 hover:cursor-pointer mt-1"
          onClick={() => {
            window.scrollTo(0, document.body.scrollHeight);
          }}
        />
      </div>
    </div>
  );
};

export default Posts;
