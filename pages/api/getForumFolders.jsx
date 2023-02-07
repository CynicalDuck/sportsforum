import React from "react";
import { supabase } from "../../lib/supabaseClient";

async function getForumFolders() {
  const { data, error } = await supabase
    .from("folders")
    .select()
    .order("name", { ascending: true });

  return data;
}

export default getForumFolders;
