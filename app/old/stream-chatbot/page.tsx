"use client";

import { useState } from "react";
import { generateTextAction, type Message } from "./actions";
import { readStreamableValue } from "ai/rsc";

export default function Page() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Hello, I'm a friendly travel planner. Let me know what kind of vacation you're thinking about and I can help make suggestions.",
      id: Date.now(),
    },
  ]);
  return (
    <div>
      <ul className="space-y-4">
        {messages.map((m, i) => (
          <li key={i}>
            <h3>{m.role}:</h3>
            <p>{m.content as string}</p>
          </li>
        ))}
      </ul>
      <form
        onSubmit={() => {
          setMessages((prev) => [
            ...prev,
            { id: Date.now(), content: input, role: "user" },
          ]);
          setInput("");
        }}
        action={async (data) => {
          const res = await generateTextAction([
            ...messages,
            { id: Date.now(), content: input, role: "user" },
          ]);

          let startedStream = false;

          for await (const delta of readStreamableValue(res)) {
            const newMessage: Message = {
              id: 1,
              role: "assistant",
              content: "",
            };
            if (startedStream) {
              setMessages((prev) => [
                ...prev.slice(0, -1),
                {
                  ...newMessage,
                  content: prev[prev.length - 1].content + delta,
                },
              ]);
            } else {
              setMessages((prev) => [
                ...prev,
                { ...newMessage, content: delta ?? "" },
              ]);
              startedStream = true;
            }
          }
        }}
      >
        <input
          className="dark:text-black"
          required
          name="characteristics"
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button>Generate</button>
      </form>
    </div>
  );
}
