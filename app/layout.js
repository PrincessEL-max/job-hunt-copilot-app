import "./globals.css";

export const metadata = {
  title: "Job Hunt Copilot",
  description:
    "Lacak lamaran kerja dan cek kecocokan CV terhadap deskripsi pekerjaan dengan AI, lengkap dengan draft cover letter otomatis.",
  openGraph: {
    title: "Job Hunt Copilot",
    description: "Lacak lamaran kerja dan cek kecocokan CV dengan AI.",
    type: "website",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}
