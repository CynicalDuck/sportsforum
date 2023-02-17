// React functional component

// Imports
import React, { useState, useRef } from "react";
import { Editor } from "@tinymce/tinymce-react";
import { supabase } from "../lib/supabaseClient";

const EditorComponent = (props) => {
  const editorRef = useRef(null);
  // States
  // Preliminary
  if (props.action === "reply") {
    editorRef.current.setContent(
      "<blockquote><strong>" +
        props.post.created_by +
        "</strong><br />" +
        props.post.content +
        "</blockquote><br /><br /><br />"
    );

    window.scrollTo(0, document.body.scrollHeight);
  }

  // Functions

  // Create new post
  async function createDiscussionPost() {
    if (editorRef.current.getContent().length > 1) {
      const { data, error } = await supabase.from("posts").insert({
        content: editorRef.current.getContent(),
        created_by: props.currentUserProfile.user_name
          ? props.currentUserProfile.user_name
          : props.currentUserSession?.user?.user_metadata?.user_name,
        discussion: props.discussion.id,
        created_by_id: props.currentUserSession?.user?.id,
        created_by_avatar_url: props.currentUserProfile?.avatar_url,
      });

      if (error) {
        props.handleError(error.message);
      }
      if (!error) {
        // Update discussion
        const { data: dataDiscussion, error: errorDiscussion } = await supabase
          .from("discussions")
          .update({
            total_posts: props.discussion.total_posts + 1,
            last_post_by: props.currentUserProfile.user_name
              ? props.currentUserProfile.user_name
              : props.currentUserSession?.user?.user_metadata?.user_name,
            last_post_at: new Date(),
          })
          .eq("id", props.discussion.id);

        if (errorDiscussion) {
          props.handleError(errorDiscussion.message);
        }
        if (!errorDiscussion) {
          // Update folder
          const { data: dataFolder, error: errorFolder } = await supabase
            .from("folders")
            .update({
              total_posts: props.folder.total_posts + 1,
              last_post_by: props.currentUserProfile.user_name
                ? props.currentUserProfile.user_name
                : props.currentUserSession?.user?.user_metadata?.user_name,
              last_post_at: new Date(),
              latest_activity_discussion: props.discussion.title,
              latest_activity_discussion_id: props.discussion.id,
            })
            .eq("id", props.discussion.parent_folder);

          if (errorFolder) {
            props.handleError(errorFolder.message);
          }
          if (!errorFolder) {
            props.handleSuccess("Posten er opprettet");
            window.location.reload();
          }
        }
      }
    }
  }

  // On click edit post
  async function onClickEditPost() {
    const { error } = await supabase
      .from("posts")
      .update({
        created_at: new Date(),
        content: editorRef.current.getContent(),
      })
      .eq("id", props.post.id);

    var last_post_at = new Date();

    if (error) {
      props.handleError(error.message);
    }

    const { error: errorDiscussion } = await supabase
      .from("discussions")
      .update({
        last_post_at: last_post_at,
      })
      .eq("id", props.discussion.id);

    if (errorDiscussion) {
      props.handleError(errorDiscussion.message);
    }
    if (!error && !errorDiscussion) {
      props.handleSuccess("Tråden er oppdatert");
    }

    window.location.reload();
  }

  return (
    <div>
      <Editor
        disabled={props.disabled}
        apiKey="5h30failckzmzz86haynxp1vhk7mvvc10go0aulj7v0f4llh"
        onInit={(evt, editor) => (editorRef.current = editor)}
        placeHolder={
          props.disabled
            ? "Denne tråden har blitt arkivert og man ikke lenger ikke lenger poste nye meldinger"
            : null
        }
        initialValue={props.action === "edit" ? props.post.content : null}
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
        {props.abortButton ? (
          <button
            className="bg-red-500 text-white rounded-[24px] px-4 py-2 mt-4"
            onClick={() => props.abortButtonAction()}
          >
            Avbryt
          </button>
        ) : null}
        {props.postButton ? (
          <button
            className="bg-primary-indigo text-white rounded-[24px] px-4 py-2 mt-4"
            onClick={
              props.action === "edit"
                ? () => onClickEditPost()
                : () => createDiscussionPost()
            }
          >
            Post
          </button>
        ) : null}
      </div>
    </div>
  );
};

export default EditorComponent;
