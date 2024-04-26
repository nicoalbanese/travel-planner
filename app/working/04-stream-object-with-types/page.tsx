"use client";

import { useState } from "react";
import { PartialItinerary, getItinerary } from "./actions";
import { readStreamableValue } from "ai/rsc";

export default function Page() {
  const [generation, setGeneration] = useState<PartialItinerary>();
  return (
    <div className="space-y-4">
      <form
        action={async (data) => {
          const location = data.get("location") as string;
          const result = await getItinerary(location);
          for await (const delta of readStreamableValue(result)) {
            setGeneration(delta);
          }
        }}
      >
        <div className="flex flex-col">
          <label>Location</label>
          <input required name="location" />
        </div>
        <button>Get Itinerary</button>
      </form>
      <ul className="space-y-4">
        {generation?.days?.map((day, i) => (
          <li key={i}>
            <h3>{day?.theme}</h3>
            <ul>
              {day?.activities?.map((activity) => (
                <li key={activity?.name}>
                  {activity?.name} - {activity?.duration} hours
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
    </div>
  );
}
