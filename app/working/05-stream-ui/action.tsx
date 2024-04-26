"use server";

import { openai } from "@ai-sdk/openai";
import { experimental_streamObject } from "ai";
import {
  StreamableValue,
  createAI,
  createStreamableUI,
  createStreamableValue,
} from "ai/rsc";
import { DeepPartial } from "ai";
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

const ItineraryView = ({ itinerary }: { itinerary?: PartialItinerary }) => (
  <div className="mt-8">
    {itinerary?.days ? (
      <>
        <h2 className="mb-4 text-xl font-bold">Your Itinerary</h2>
        <div className="space-y-4">
          {itinerary.days.map(
            (day, index) =>
              day && (
                <div key={index} className="p-4 border rounded-lg">
                  <h3 className="font-bold">{day.theme ?? ""}</h3>

                  {day.activities?.map(
                    (activity, index) =>
                      activity && (
                        <div key={index} className="mt-4">
                          {activity.name && (
                            <h4 className="font-bold">{activity.name}</h4>
                          )}
                          {activity.description && (
                            <p className="text-gray-500">
                              {activity.description}
                            </p>
                          )}
                          {activity.duration && (
                            <p className="text-sm text-gray-400">{`Duration: ${activity.duration} hours`}</p>
                          )}
                        </div>
                      ),
                  )}
                </div>
              ),
          )}
        </div>
      </>
    ) : null}
  </div>
);

export type PartialItinerary = DeepPartial<typeof itinerarySchema>;
export async function submitItineraryRequest({
  destination,
  lengthOfStay,
}: {
  destination: string;
  lengthOfStay: string;
}) {
  "use server";

  const itineraryComponent = createStreamableUI(<ItineraryView />);
  const isGenerating = createStreamableValue(true);

  experimental_streamObject({
    model: openai("gpt-3.5-turbo"),
    schema: itinerarySchema,
    system:
      `You help planning travel itineraries. ` +
      `Respond to the users' request with a list ` +
      `of the best stops to make in their destination.`,
    prompt:
      `I am planning a trip to ${destination} for ${lengthOfStay} days. ` +
      `Please suggest the best tourist activities for me to do.`,
  })
    // non-blocking: the generateItinerary call returns immediately
    .then(async (result) => {
      try {
        for await (const partialItinerary of result.partialObjectStream) {
          itineraryComponent.update(
            <ItineraryView itinerary={partialItinerary} />,
          );
        }
      } finally {
        isGenerating.done(false);
        itineraryComponent.done();
      }
    });

  return {
    isGenerating: isGenerating.value,
    itineraryComponent: itineraryComponent.value,
  };
}

const initialAIState: {
  destination: string;
  lengthOfStay: string;
} = {
  destination: "",
  lengthOfStay: "",
};

const initialUIState: {
  isGenerating: StreamableValue<boolean>;
  itineraryComponent: React.ReactNode;
} = {
  isGenerating: false,
  itineraryComponent: null,
};

export const GenerateItineraryAI = createAI({
  actions: {
    submitItineraryRequest,
  },
  initialUIState,
  initialAIState,
});
