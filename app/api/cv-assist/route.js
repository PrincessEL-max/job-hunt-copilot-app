function buildContextBlock(ctx) {
  const educationSummary = (ctx.education || [])
    .map((e) => `${e.institution || ""} - ${e.major || ""}`)
    .filter((s) => s.trim() !== "-")
    .join("; ");
  const experienceSummary = (ctx.workExperiences || [])
    .map((w) => `${w.title || ""} di ${w.company || ""}`)
    .filter(Boolean)
    .join("; ");
  const projectSummary = (ctx.projects || [])
    .map((p) => p.title || "")
    .filter(Boolean)
    .join("; ");

  return `Nama: ${ctx.fullName || "-"}
Posisi yang dilamar: ${ctx.targetPosition || "-"}
Perusahaan tujuan: ${ctx.targetCompany || "-"}
Pendidikan: ${educationSummary || "-"}
Pengalaman kerja: ${experienceSummary || "-"}
Projek: ${projectSummary || "-"}
Hard skill saat ini: ${ctx.hardSkills || "-"}
Soft skill saat ini: ${ctx.softSkills || "-"}`;
}

function buildPrompt(fieldType, ctx) {
  const contextBlock = buildContextBlock(ctx);
  const targetLine = ctx.targetPosition
    ? `Sesuaikan dengan posisi "${ctx.targetPosition}"${ctx.targetCompany ? ` di ${ctx.targetCompany}` : ""} yang dituju.`
    : "Belum ada posisi spesifik yang dituju, jadi buat yang cukup umum tapi tetap profesional.";

  switch (fieldType) {
    case "about":
      return `Kamu bantu menulis bagian "Tentang Saya" untuk CV. Berdasarkan data berikut:

${contextBlock}

${targetLine} Tulis 2-4 kalimat ringkasan profesional yang jujur berdasarkan data di atas (jangan mengarang pengalaman/skill yang tidak ada). Bahasa Indonesia formal tapi natural. Balas HANYA dengan teks ringkasannya saja, tanpa tanda kutip, tanpa penjelasan tambahan.`;

    case "hardSkills":
      return `Kamu bantu menyarankan hard skill untuk CV. Berdasarkan data berikut:

${contextBlock}

${targetLine} Sarankan 6-10 hard skill yang relevan dan masuk akal berdasarkan latar belakang di atas (kombinasikan dengan skill yang sudah ada kalau ada). Balas HANYA dengan daftar skill dipisahkan koma, tanpa penjelasan tambahan. Contoh format: "Python, SolidWorks, Manajemen Proyek"`;

    case "softSkills":
      return `Kamu bantu menyarankan soft skill untuk CV. Berdasarkan data berikut:

${contextBlock}

${targetLine} Sarankan 5-7 soft skill yang relevan dan masuk akal untuk posisi ini. Balas HANYA dengan daftar skill dipisahkan koma, tanpa penjelasan tambahan. Contoh format: "Kerja tim, Problem solving, Komunikasi"`;

    case "experienceBullets":
      return `Kamu bantu menulis poin tugas/pencapaian untuk bagian pengalaman kerja di CV.

Posisi: ${ctx.entryTitle || "-"}
Perusahaan: ${ctx.entryCompany || "-"}
Catatan kasar dari pengguna (boleh kosong/tidak jelas, abaikan kalau tidak berguna): ${ctx.entryNotes || "-"}

${targetLine} Tulis 3-4 poin tugas/pencapaian yang realistis dan spesifik untuk posisi "${ctx.entryTitle || "posisi tersebut"}" (gunakan kata kerja aktif seperti "Merancang", "Mengelola", dst). Kalau catatan pengguna berisi info berguna, prioritaskan itu; kalau tidak, buat berdasarkan tanggung jawab umum posisi tersebut. Balas HANYA dengan poin-poin, satu per baris, tanpa bullet/tanda apapun di depan, tanpa penjelasan tambahan.`;

    case "projectBullets":
      return `Kamu bantu menulis poin deskripsi untuk bagian projek di CV.

Nama projek: ${ctx.entryTitle || "-"}
Catatan kasar dari pengguna (boleh kosong/tidak jelas, abaikan kalau tidak berguna): ${ctx.entryNotes || "-"}

${targetLine} Tulis 2-4 poin deskripsi yang realistis dan spesifik untuk projek "${ctx.entryTitle || "tersebut"}" (gunakan kata kerja aktif). Kalau catatan pengguna berisi info berguna, prioritaskan itu; kalau tidak, buat berdasarkan asumsi wajar dari nama projeknya. Balas HANYA dengan poin-poin, satu per baris, tanpa bullet/tanda apapun di depan, tanpa penjelasan tambahan.`;

    default:
      return null;
  }
}

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch (e) {
    return Response.json({ error: "Body request tidak valid." }, { status: 400 });
  }

  const { fieldType, context } = body || {};
  const prompt = buildPrompt(fieldType, context || {});
  if (!prompt) {
    return Response.json({ error: "Jenis bantuan tidak dikenali." }, { status: 400 });
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
            maxOutputTokens: 1024,
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

    return Response.json({ text: raw.trim() });
  } catch (err) {
    console.error(err);
    return Response.json({ error: "Terjadi kesalahan saat meminta bantuan AI." }, { status: 500 });
  }
}