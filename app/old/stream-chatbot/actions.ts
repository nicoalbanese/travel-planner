"use server";

import { experimental_streamText as streamText } from "ai";
import { openai } from "@ai-sdk/openai";
import { createAI, createStreamableValue } from "ai/rsc";

export type Message = {
  id: number;
  role: "user" | "assistant";
  content: string;
};

export const generateTextAction = async (messages: Message[]) => {
  const stream = createStreamableValue("");
  (async () => {
    const result = await streamText({
      model: openai("gpt-3.5-turbo"),
      system: `You are a world traveller and an expert travel planner. The user will describe their ideal vacation characteristics, please suggest some locations.`,
      messages,
    });
    for await (const delta of result.textStream) {
      stream.update(delta);
    }
    stream.done();
  })();

  return stream.value;
};
