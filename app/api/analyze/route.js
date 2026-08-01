export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch (e) {
    return Response.json({ error: "Body request tidak valid." }, { status: 400 });
  }

  const { cvText, jobDescription, company, role } = body || {};

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

  const prompt = `Kamu adalah asisten pencari kerja yang ahli dan JUJUR — jangan memuji atau mengarang kekuatan yang sebenarnya tidak ada di teks.

CV:
"""
${String(cvText).slice(0, 4000)}
"""

Deskripsi Pekerjaan:
"""
${String(jobDescription).slice(0, 3000)}
"""
${company ? `\nPerusahaan yang dilamar: ${String(company).slice(0, 200)}` : ""}${role ? `\nPosisi yang dilamar: ${String(role).slice(0, 200)}` : ""}
${
  company || role
    ? `\nKalau nama perusahaan dan/atau posisi di atas diisi, sebut secara natural di cover letter (misalnya di kalimat pembuka) supaya terasa personal dan tidak generik. JANGAN mengarang fakta spesifik tentang perusahaan tersebut (budaya kerja, produk, sejarah, dll) yang tidak kamu ketahui kebenarannya — cukup pakai nama & posisinya untuk personalisasi, bukan untuk klaim yang tidak pasti.\n`
    : ""
}
Sebelum menganalisis, cek dulu: apakah teks CV dan deskripsi pekerjaan di atas benar-benar berisi konten CV/lowongan kerja yang bisa dianalisis (bukan cuma sapaan, teks acak, atau terlalu pendek untuk dinilai)?

- Kalau TIDAK valid: set "input_valid" ke false, "match_score" ke 0, "strengths" dan "gaps" jadi array kosong [], dan "cover_letter" berisi penjelasan singkat (1 kalimat) bahwa CV/deskripsi pekerjaan yang dimasukkan belum cukup lengkap untuk dianalisis.
- Kalau valid: set "input_valid" ke true, lalu analisis dengan jujur. Kekuatan (strengths) HARUS didasarkan pada kecocokan nyata antara isi CV dan kebutuhan di deskripsi pekerjaan, bukan basa-basi seperti "punya niat melamar" atau "bahasa sopan".

Balas HANYA dengan objek JSON, struktur persis:
{"input_valid": <true/false>, "match_score": <angka 0-100>, "strengths": ["poin singkat", "poin singkat", "poin singkat"], "gaps": ["poin singkat", "poin singkat"], "cover_letter": "cover letter 120-160 kata dalam Bahasa Indonesia, profesional, langsung terpakai, tanpa placeholder tanda kurung"}`;

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
