type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const incoming = Array.isArray(body.messages)
      ? body.messages
      : typeof body.message === "string"
        ? [{ role: "user", content: body.message }]
        : [];

    if (
      incoming.length === 0 ||
      incoming.length > 30 ||
      incoming.some(
        (item: unknown) =>
          !item ||
          typeof item !== "object" ||
          !("role" in item) ||
          !("content" in item) ||
          !["user", "assistant"].includes(String(item.role)) ||
          typeof item.content !== "string" ||
          item.content.length > 20000
      )
    ) {
      return Response.json(
        { error: "Please provide a valid conversation (up to 30 messages)." },
        { status: 400 }
      );
    }

    const messages = incoming as ChatMessage[];
    if (messages[messages.length - 1]?.role !== "user") {
      return Response.json(
        { error: "The latest message must be from the user." },
        { status: 400 }
      );
    }

    const apiKey = process.env.FORTYTWO_API_KEY;

    if (!apiKey) {
      return Response.json(
        { error: "Fortytwo API key is missing." },
        { status: 500 }
      );
    }

    const response = await fetch(
      "https://api.fortytwo.network/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "qwen/qwen3.8-27b",
          messages,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return Response.json(
        { error: data.error?.message || "Fortytwo API error." },
        { status: response.status }
      );
    }

    return Response.json({
      answer: data.choices?.[0]?.message?.content,
      usage: data.usage,
      model: data.model || "qwen/qwen3.8-27b",
    });
  } catch {
    return Response.json(
      { error: "Something went wrong." },
      { status: 500 }
    );
  }
}
