"use server";

import { experimental_streamObject as streamObject } from "ai";
import { openai } from "@ai-sdk/openai";
import { createStreamableValue } from "ai/rsc";
import { z } from "zod";

const itinerarySchema = z.object({
  days: z.array(
    z.object({
      theme: z.string(),
      activities: z.array(
        z.object({
          name: z.string(),
          description: z.string(),
          duration: z.number(),
        }),
      ),
    }),
  ),
});

export const getItinerary = async (location: string) => {
  const stream = createStreamableValue();
  (async () => {
    const result = await streamObject({
      model: openai("gpt-3.5-turbo"),
      prompt:
        "You are a world traveller and an expert travel agent. The user will describe their vacation location, please suggest an itinerary of things to do.\n\n" +
        "Location:\n" +
        location,
      schema: itinerarySchema,
    });
    for await (const delta of result.partialObjectStream) {
      stream.update(delta);
    }

    stream.done();
  })();
  return stream.value;
};
