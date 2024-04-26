"use client";

import { useState } from "react";
import { getItinerary } from "./actions";

export default function Page() {
  const [generation, setGeneration] = useState("");
  return (
    <div className="space-y-4">
      <form
        action={async (data) => {
          const location = data.get("location") as string;
          const response = await getItinerary(location);
          setGeneration(response);
        }}
      >
        <div className="flex flex-col">
          <label>Location</label>
          <input required name="location" />
        </div>
        <button>Get Itinerary</button>
      </form>
      <pre className="bg-neutral-100 p-4 text-wrap">{generation}</pre>
    </div>
  );
}
