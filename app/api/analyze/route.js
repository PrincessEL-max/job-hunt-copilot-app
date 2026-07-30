export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch (e) {
    return Response.json({ error: "Body request tidak valid." }, { status: 400 });
  }

  const { cvText, jobDescription } = body || {};

  if (!cvText || !jobDescription) {
    return Response.json({ error: "CV dan deskripsi pekerjaan wajib diisi." }, { status: 400 });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return Response.json(
      {
        error:
          "GEMINI_API_KEY belum diset di server. Cek file .env.local (lokal) atau Environment Variables di Vercel (production).",
      },
      { status: 500 }
    );
  }

  const prompt = `Kamu adalah asisten pencari kerja yang ahli dan jujur. Berdasarkan CV dan deskripsi pekerjaan berikut, berikan analisis.

CV:
"""
${String(cvText).slice(0, 4000)}
"""

Deskripsi Pekerjaan:
"""
${String(jobDescription).slice(0, 3000)}
"""

Balas dengan objek JSON dengan struktur persis:
{"match_score": <angka 0-100>, "strengths": ["poin singkat", "poin singkat", "poin singkat"], "gaps": ["poin singkat", "poin singkat"], "cover_letter": "cover letter 120-160 kata dalam Bahasa Indonesia, profesional, langsung terpakai, tanpa placeholder tanda kurung"}`;

  try {
    const geminiRes = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent",
      {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-goog-api-key": apiKey,
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            responseMimeType: "application/json",
            thinkingConfig: { thinkingLevel: "low" },
            maxOutputTokens: 2048,
          },
        }),
      }
    );

    if (!geminiRes.ok) {
      const errText = await geminiRes.text();
      console.error("Gemini API error:", geminiRes.status, errText);
      return Response.json(
        { error: "Gagal menghubungi AI. Coba lagi sebentar lagi." },
        { status: 502 }
      );
    }

    const data = await geminiRes.json();
    const raw = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!raw) {
      return Response.json({ error: "Tidak ada respons teks dari model." }, { status: 502 });
    }

    let cleaned = raw.trim();
    cleaned = cleaned
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/```\s*$/i, "");

    let parsed;
    try {
      parsed = JSON.parse(cleaned);
    } catch (err) {
      const match = cleaned.match(/\{[\s\S]*\}/);
      if (match) {
        parsed = JSON.parse(match[0]);
      } else {
        throw err;
      }
    }

    return Response.json(parsed);
  } catch (err) {
    console.error(err);
    return Response.json({ error: "Terjadi kesalahan saat analisis." }, { status: 500 });
  }
}
