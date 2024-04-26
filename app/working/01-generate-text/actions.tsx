"use server";

import { experimental_generateText as generateText } from "ai";
import { openai } from "@ai-sdk/openai";

export const getItinerary = async (location: string) => {
  const result = await generateText({
    model: openai("gpt-3.5-turbo"),
    prompt:
      "You are a world traveller and an expert travel agent. The user will describe their vacation location, please suggest an itinerary of things to do.\n\n" +
      "Location:\n" +
      location,
  });
  return result.text;
};
