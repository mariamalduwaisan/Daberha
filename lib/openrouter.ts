const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";

const SYSTEM_PROMPT = `أنت مساعد دبرها للتحضير للمقابلات الوظيفية في القطاع المصرفي الكويتي والخليجي.
مهمتك مساعدة الطلاب والخريجين الجدد (18-35 سنة) على التحضير للمقابلات في البنوك الكويتية مثل NBK وبوبيان وبنك الخليج وغيرها.
يمكنك:
- إجراء مقابلات تجريبية وتقديم ملاحظات فورية
- شرح مصطلحات القطاع المصرفي الإسلامي والتقليدي
- تحليل إجابات المستخدم باستخدام أسلوب STAR وتقديم اقتراحات للتحسين
- الإجابة على أسئلة حول ثقافة البنوك الكويتية وقيمها
أجب دائماً باللغة العربية. كن محفزاً وداعماً وعملياً.`;

export type Message = { role: "user" | "assistant"; content: string };

export async function streamChat(messages: Message[]): Promise<ReadableStream<Uint8Array>> {
  const apiKey = process.env.OPENROUTER_API_KEY;

  if (!apiKey || apiKey === "your-openrouter-api-key-here") {
    const encoder = new TextEncoder();
    return new ReadableStream({
      start(controller) {
        controller.enqueue(
          encoder.encode(
            "data: " +
              JSON.stringify({
                choices: [{ delta: { content: "⚠️ يرجى إضافة مفتاح OpenRouter API في ملف .env.local لتفعيل المساعد الذكي. احصل على مفتاح مجاني من https://openrouter.ai/keys" } }],
              }) +
              "\n\n"
          )
        );
        controller.enqueue(encoder.encode("data: [DONE]\n\n"));
        controller.close();
      },
    });
  }

  const response = await fetch(OPENROUTER_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
      "X-Title": "دبرها – مساعد المقابلات",
    },
    body: JSON.stringify({
      model: "meta-llama/llama-3.3-70b-instruct:free",
      messages: [{ role: "system", content: SYSTEM_PROMPT }, ...messages],
      stream: true,
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`OpenRouter ${response.status}: ${errText}`);
  }
  return response.body!;
}

export async function generateContent(prompt: string): Promise<string> {
  const apiKey = process.env.OPENROUTER_API_KEY;

  if (!apiKey || apiKey === "your-openrouter-api-key-here") {
    return "⚠️ يرجى إضافة مفتاح OpenRouter API لتفعيل توليد المحتوى.";
  }

  const response = await fetch(OPENROUTER_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
      "X-Title": "دبرها – مساعد المقابلات",
    },
    body: JSON.stringify({
      model: "anthropic/claude-3.5-haiku",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: prompt },
      ],
    }),
  });

  if (!response.ok) throw new Error(`OpenRouter error: ${response.status}`);
  const data = await response.json();
  return data.choices[0].message.content;
}
