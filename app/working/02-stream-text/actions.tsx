"use server";

import { experimental_streamText as streamText } from "ai";
import { openai } from "@ai-sdk/openai";
import { createStreamableValue } from "ai/rsc";

export const getItinerary = async (location: string) => {
  const stream = createStreamableValue();
  (async () => {
    const result = await streamText({
      model: openai("gpt-3.5-turbo"),
      prompt:
        "You are a world traveller and an expert travel agent. The user will describe their vacation location, please suggest an itinerary of things to do.\n\n" +
        "Location:\n" +
        location,
    });
    for await (const delta of result.textStream) {
      stream.update(delta);
    }

    stream.done();
  })();
  return stream.value;
};
