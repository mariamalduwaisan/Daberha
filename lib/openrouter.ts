const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";

const SYSTEM_PROMPT = `أنت مساعد دبرها للتحضير للمقابلات الوظيفية في القطاع المصرفي الكويتي والخليجي.
مهمتك مساعدة الطلاب والخريجين الجدد (18-35 سنة) على التحضير للمقابلات في البنوك الكويتية مثل NBK وبوبيان وبنك الخليج وغيرها.
يمكنك:
- إجراء مقابلات تجريبية وتقديم ملاحظات فورية
- شرح مصطلحات القطاع المصرفي الإسلامي والتقليدي
- تحليل إجابات المستخدم باستخدام أسلوب STAR وتقديم اقتراحات للتحسين
- الإجابة على أسئلة حول ثقافة البنوك الكويتية وقيمها
أجب دائماً باللغة العربية. كن محفزاً وداعماً وعملياً.

🎤 وضع التدريب الصوتي:
عندما تبدأ رسالة المستخدم بـ [🎤] فهذا يعني أنه تحدث بصوت عالٍ. في هذه الحالة، أضف في نهاية ردك قسماً خاصاً بعنوان "📊 تقييم الأداء الصوتي" يتضمن:
1. **مستوى الثقة**: هل كانت الإجابة واضحة ومباشرة؟ أم تحتوي على تردد؟ (ابحث في النص عن كلمات تدل على الخجل مثل: ربما، أعتقد، لست متأكد، ممكن، أحياناً)
2. **نقاط القوة**: ما الذي أجاده في الإجابة؟
3. **نصائح لتحسين الثقة**: اذكر 2-3 نصائح عملية لتبدو أكثر ثقة في المقابلة
4. **الجملة البديلة**: أعد صياغة إجابته بأسلوب أكثر ثقة واحترافية
كن محدداً وعملياً. لا تكن قاسياً بل محفزاً.`;

export type Message = { role: "user" | "assistant"; content: string };

// Accept the key under any of these names so Vercel env var naming doesn't matter
function getApiKey(): string | undefined {
  return (
    process.env.chatbotkey ||
    process.env.OPENROUTER_API_KEY ||
    process.env.CHATBOTKEY ||
    process.env.openrouter_api_key
  );
}

export async function streamChat(messages: Message[]): Promise<ReadableStream<Uint8Array>> {
  const apiKey = getApiKey();

  if (!apiKey) {
    const encoder = new TextEncoder();
    return new ReadableStream({
      start(controller) {
        controller.enqueue(
          encoder.encode(
            "data: " +
              JSON.stringify({
                choices: [{ delta: { content: "⚠️ مفتاح API غير موجود. اذهب إلى Vercel → Project Settings → Environment Variables وأضف متغيراً باسم chatbotkey وقيمته مفتاح OpenRouter من https://openrouter.ai/keys ثم أعد النشر (Redeploy)." } }],
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
      "HTTP-Referer": "https://daberha.vercel.app",
      "X-Title": "دبرها – مساعد المقابلات",
    },
    body: JSON.stringify({
      // Primary model + fallback list
      model: "meta-llama/llama-3.3-70b-instruct:free",
      route: "fallback",
      models: [
        "meta-llama/llama-3.3-70b-instruct:free",
        "google/gemma-3-27b-it:free",
        "google/gemma-2-9b-it:free",
        "mistralai/mistral-7b-instruct:free",
        "microsoft/phi-3-mini-128k-instruct:free",
      ],
      messages: [{ role: "system", content: SYSTEM_PROMPT }, ...messages],
      stream: true,
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    // Surface the real error so it shows in the chat instead of a generic message
    throw new Error(`OpenRouter ${response.status}: ${errText}`);
  }
  return response.body!;
}

export async function generateContent(prompt: string): Promise<string> {
  const apiKey = getApiKey();

  if (!apiKey) {
    return "⚠️ مفتاح API غير موجود في متغيرات البيئة.";
  }

  const response = await fetch(OPENROUTER_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "https://daberha.vercel.app",
      "X-Title": "دبرها – مساعد المقابلات",
    },
    body: JSON.stringify({
      model: "meta-llama/llama-3.3-70b-instruct:free",
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
