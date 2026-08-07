export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch (e) {
    return Response.json({ error: "Body request tidak valid." }, { status: 400 });
  }

  const {
    fullName,
    aboutMe,
    education,
    workExperiences,
    projects,
    hardSkills,
    softSkills,
    targetPosition,
    targetCompany,
    jobSource,
  } = body || {};

  if (!fullName || !targetPosition || !targetCompany) {
    return Response.json(
      { error: "Nama, posisi yang dilamar, dan perusahaan tujuan wajib diisi." },
      { status: 400 }
    );
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

  const educationText = (education || [])
    .map(
      (e) =>
        `${e.institution || ""} - ${e.major || ""} (${e.dateRange || ""})${e.gpa ? `, IPK ${e.gpa}` : ""}`
    )
    .join("; ");
  const experienceText = (workExperiences || [])
    .map(
      (w) => `${w.title || ""} di ${w.company || ""} (${w.dateRange || ""}): ${w.bulletsText || ""}`
    )
    .join("; ");
  const projectText = (projects || [])
    .map((p) => `${p.title || ""}: ${p.bulletsText || ""}`)
    .join("; ");

  const prompt = `Kamu adalah penulis surat lamaran kerja profesional. Berdasarkan data pelamar berikut, tulis TIGA bagian narasi untuk surat lamaran kerja formal Bahasa Indonesia. Struktur surat (kop, data diri, penutup resmi) akan disusun terpisah oleh sistem — kamu HANYA menulis tiga paragraf narasinya.

Nama: ${String(fullName).slice(0, 200)}
Posisi yang dilamar: ${String(targetPosition).slice(0, 200)}
Perusahaan tujuan: ${String(targetCompany).slice(0, 200)}
${jobSource ? `Sumber info lowongan: ${String(jobSource).slice(0, 200)}` : ""}
Tentang pelamar: ${String(aboutMe || "").slice(0, 1000)}
Pendidikan: ${educationText.slice(0, 500) || "-"}
Pengalaman kerja: ${experienceText.slice(0, 1500) || "-"}
Pengalaman projek: ${projectText.slice(0, 1500) || "-"}
Hard skill: ${String(hardSkills || "").slice(0, 300)}
Soft skill: ${String(softSkills || "").slice(0, 300)}

Balas HANYA dengan objek JSON, struktur persis:
{
  "opening": "1 paragraf pembuka (2-3 kalimat) yang menyatakan maksud melamar posisi ini${jobSource ? ", menyebutkan sumber info lowongan secara natural" : ""}. JANGAN sertakan salam 'Dengan hormat' atau data diri, itu akan ditambahkan terpisah.",
  "body": "1-2 paragraf isi yang menjelaskan kualifikasi, pengalaman, dan skill pelamar secara meyakinkan dan SPESIFIK berdasarkan data di atas. JANGAN mengarang informasi yang tidak ada di data.",
  "closing": "1 paragraf penutup (2-3 kalimat) yang menyebutkan lampiran dokumen pendukung, menyatakan harapan untuk wawancara, dan ucapan terima kasih. JANGAN sertakan 'Hormat saya' atau nama, itu akan ditambahkan terpisah."
}`;

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
    return Response.json(
      { error: "Terjadi kesalahan saat membuat surat lamaran." },
      { status: 500 }
    );
  }
}