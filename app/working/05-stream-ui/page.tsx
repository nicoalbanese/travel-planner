"use client";

import { readStreamableValue, useUIState } from "ai/rsc";
import { useState } from "react";
import { GenerateItineraryAI, submitItineraryRequest } from "./action";

export default function ItineraryPage() {
  const [destination, setDestination] = useState("");
  const [lengthOfStay, setLengthOfStay] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useUIState<typeof GenerateItineraryAI>();

  return (
    <div className="w-full max-w-2xl p-4 mx-auto md:p-6 lg:p-8">
      <h1 className="mb-6 text-2xl font-bold text-center">
        City Travel Itinerary Planner
      </h1>

      <form
        className="space-y-4"
        onSubmit={async (e) => {
          e.preventDefault();

          const result = await submitItineraryRequest({
            destination,
            lengthOfStay,
          });

          setResult(result);

          const isGeneratingStream = readStreamableValue(result.isGenerating);
          for await (const value of isGeneratingStream) {
            if (value != null) {
              setIsGenerating(value);
            }
          }
        }}
      >
        <div className="space-y-2">
          <label htmlFor="destination">Destination</label>
          <input
            id="destination"
            placeholder="Enter your destination"
            required
            value={destination}
            disabled={isGenerating}
            onChange={(e) => setDestination(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="length-of-stay">Length of Stay (Days)</label>
          <input
            id="length-of-stay"
            placeholder="Enter the length of your stay (up to 7 days)"
            required
            type="number"
            min="1" // Minimum length of stay
            max="7" // Maximum length of stay
            value={lengthOfStay}
            disabled={isGenerating}
            onChange={(e) => setLengthOfStay(e.target.value)}
          />
        </div>
        <button className="w-full" type="submit" disabled={isGenerating}>
          Generate Itinerary
        </button>
      </form>

      {result.itineraryComponent}
    </div>
  );
}
