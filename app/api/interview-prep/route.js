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

  const prompt = `Kamu adalah pelatih interview kerja yang berpengalaman dan JUJUR. Berdasarkan CV dan deskripsi pekerjaan berikut, buatkan daftar pertanyaan interview yang kemungkinan besar akan ditanyakan, beserta tip singkat cara menjawabnya berdasarkan latar belakang kandidat di CV.

CV:
"""
${String(cvText).slice(0, 4000)}
"""

Deskripsi Pekerjaan:
"""
${String(jobDescription).slice(0, 3000)}
"""
${company ? `\nPerusahaan: ${String(company).slice(0, 200)}` : ""}${role ? `\nPosisi: ${String(role).slice(0, 200)}` : ""}

Sebelum membuat pertanyaan, cek dulu: apakah CV dan deskripsi pekerjaan di atas benar-benar berisi konten yang bisa dianalisis (bukan cuma sapaan, teks acak, atau terlalu pendek)?

- Kalau TIDAK valid: set "input_valid" ke false, "questions" jadi array kosong [].
- Kalau valid: set "input_valid" ke true, lalu buat 6-8 pertanyaan yang terbagi rata ke 3 kategori:
  - "Umum": pertanyaan perilaku/motivasi standar
  - "Teknis": spesifik ke skill/tanggung jawab yang disebutkan di deskripsi pekerjaan
  - "Berdasarkan CV": menyasar kemungkinan celah atau hal yang perlu diklarifikasi dari CV kandidat dibanding kebutuhan posisi

Untuk setiap pertanyaan, beri "tip" singkat (1-2 kalimat) soal cara menjawab yang baik berdasarkan latar belakang kandidat di CV — bukan jawaban lengkap yang tinggal dihafal, tapi arahan strategi (poin apa yang perlu ditonjolkan, atau kerangka seperti STAR).

Balas HANYA dengan objek JSON, struktur persis:
{"input_valid": <true/false>, "questions": [{"category": "Umum" atau "Teknis" atau "Berdasarkan CV", "question": "...", "tip": "..."}]}`;

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
            maxOutputTokens: 3072,
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
    return Response.json(
      { error: "Terjadi kesalahan saat membuat persiapan interview." },
      { status: 500 }
    );
  }
}
