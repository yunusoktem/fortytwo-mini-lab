export async function POST(request: Request) {
  try {
    const { message } = await request.json();

    if (!message || typeof message !== "string") {
      return Response.json(
        { error: "Please enter a message." },
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
          messages: [{ role: "user", content: message }],
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
    });
  } catch {
    return Response.json(
      { error: "Something went wrong." },
      { status: 500 }
    );
  }
}
