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

  const prompt = `Kamu adalah penulis surat lamaran kerja profesional. Buatkan surat lamaran kerja formal dalam Bahasa Indonesia untuk pelamar berikut.

Nama: ${String(fullName).slice(0, 200)}
Posisi yang dilamar: ${String(targetPosition).slice(0, 200)}
Perusahaan tujuan: ${String(targetCompany).slice(0, 200)}
Tentang pelamar: ${String(aboutMe || "").slice(0, 1000)}
Pendidikan: ${educationText.slice(0, 500) || "-"}
Pengalaman kerja: ${experienceText.slice(0, 1500) || "-"}
Pengalaman projek: ${projectText.slice(0, 1500) || "-"}
Hard skill: ${String(hardSkills || "").slice(0, 300)}
Soft skill: ${String(softSkills || "").slice(0, 300)}

Tulis surat lamaran kerja lengkap dengan format standar Indonesia: tempat & tanggal (pakai "[Kota], [Tanggal]" sebagai placeholder karena kamu tidak tahu kota/tanggal aslinya), tujuan surat (Kepada Yth. HRD ${String(targetCompany).slice(0, 100)}), salam pembuka, paragraf isi yang menjelaskan kualifikasi pelamar secara meyakinkan dan spesifik berdasarkan data di atas (JANGAN mengarang pengalaman/skill yang tidak ada di data), paragraf penutup, dan nama terang di akhir. Bahasa formal tapi mengalir natural, sekitar 250-350 kata total.

Balas HANYA dengan teks surat lamaran lengkap, tanpa penjelasan tambahan, tanpa markdown.`;

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

    return Response.json({ letter: raw.trim() });
  } catch (err) {
    console.error(err);
    return Response.json(
      { error: "Terjadi kesalahan saat membuat surat lamaran." },
      { status: 500 }
    );
  }
}
