"use client";
import { useState } from "react";
import { supabase } from "../lib/supabaseClient";

import { links } from "../constants";

const SidebarRight = (props) => {
  return (
    <div>
      <div className="bg-white px-4 py-4 mb-1 rounded-[24px]">
        <div className="text-black font-semibold">Tabellen</div>
        <div>
          <iframe
            id="sofa-standings-embed-2-47806"
            width="100%"
            src="https://www.sofascore.com/tournament/5/47806/standings/tables/embed"
            frameborder="0"
            scrolling="no"
            style={{ height: "1000px" }}
          ></iframe>
        </div>
      </div>
    </div>
  );
};

export default SidebarRight;
