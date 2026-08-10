import { bulletsOf } from "../../lib/utils";

const font = { fontFamily: "'Inter', 'Helvetica Neue', Arial, sans-serif" };
const ACCENT = "#0f766e"; // teal-700, matches app branding

function SectionHeading({ children }) {
  return (
    <div className="flex items-center gap-2 mb-2">
      <div className="w-1 h-4 rounded-sm" style={{ backgroundColor: ACCENT }} />
      <h2 className="text-xs font-bold uppercase tracking-wide" style={{ color: ACCENT }}>
        {children}
      </h2>
    </div>
  );
}

function TagList({ text }) {
  const items = (text || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  if (items.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-1.5">
      {items.map((item, i) => (
        <span
          key={i}
          className="text-xs px-2.5 py-1 rounded-full border"
          style={{ borderColor: ACCENT, color: ACCENT }}
        >
          {item}
        </span>
      ))}
    </div>
  );
}

export default function ModernTemplate({ data }) {
  return (
    <div className="text-slate-800" style={font}>
      <div className="h-2" style={{ backgroundColor: ACCENT }} />
      <div className="p-10">
        <div className="flex justify-between items-center gap-5 mb-5">
          <div className="min-w-0">
            <h1 className="text-3xl font-bold leading-tight break-words text-slate-900">
              {data.fullName || "Nama Lengkap"}
            </h1>
            {data.targetPosition && (
              <p className="text-base font-medium mt-0.5" style={{ color: ACCENT }}>
                {data.targetPosition}
              </p>
            )}
            <p className="text-xs mt-2 text-slate-500">
              {[data.phone, data.email, data.linkedinUrl, data.githubUrl, data.portfolioUrl]
                .filter(Boolean)
                .join("  ·  ")}
            </p>
          </div>
          {data.showPhoto && data.photoDataUrl && (
            // eslint-disable-next-line @next/next/no-img-element -- base64 data URL, must render as-is inside #cv-preview for print/PDF export
            <img
              src={data.photoDataUrl}
              alt="Foto profil"
              className="w-24 h-24 rounded-full object-cover border-2 shrink-0"
              style={{ borderColor: ACCENT }}
            />
          )}
        </div>

        {data.aboutMe && (
          <p className="text-sm leading-relaxed mb-5 text-slate-600">{data.aboutMe}</p>
        )}

        {data.education.length > 0 && (
          <section className="mb-5">
            <SectionHeading>Pendidikan</SectionHeading>
            {data.education.map((edu) => (
              <div key={edu.id} className="mb-2 last:mb-0">
                <p className="font-semibold text-sm text-slate-900">
                  {edu.institution}
                  {edu.major && ` — ${edu.major}`}
                </p>
                <p className="text-xs text-slate-500">
                  {[edu.dateRange, edu.gpa && `IPK ${edu.gpa}`].filter(Boolean).join(" · ")}
                </p>
              </div>
            ))}
          </section>
        )}

        {data.workExperiences.length > 0 && (
          <section className="mb-5">
            <SectionHeading>Pengalaman</SectionHeading>
            {data.workExperiences.map((exp) => (
              <div key={exp.id} className="mb-3 last:mb-0">
                {(exp.title || exp.company) && (
                  <div className="flex items-baseline justify-between flex-wrap gap-1">
                    <p className="font-semibold text-sm text-slate-900">{exp.title}</p>
                    <p className="text-xs text-slate-400">{exp.dateRange}</p>
                  </div>
                )}
                {exp.company && <p className="text-xs text-slate-500 mb-1">{exp.company}</p>}
                {bulletsOf(exp.bulletsText).length > 0 && (
                  <ul className="list-disc list-outside ml-4 text-sm space-y-0.5 text-slate-600">
                    {bulletsOf(exp.bulletsText).map((b, i) => (
                      <li key={i}>{b}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </section>
        )}

        {data.organizations.length > 0 && (
          <section className="mb-5">
            <SectionHeading>Organisasi</SectionHeading>
            {data.organizations.map((org) => (
              <div key={org.id} className="mb-3 last:mb-0">
                {(org.title || org.company) && (
                  <div className="flex items-baseline justify-between flex-wrap gap-1">
                    <p className="font-semibold text-sm text-slate-900">{org.title}</p>
                    <p className="text-xs text-slate-400">{org.dateRange}</p>
                  </div>
                )}
                {org.company && <p className="text-xs text-slate-500 mb-1">{org.company}</p>}
                {bulletsOf(org.bulletsText).length > 0 && (
                  <ul className="list-disc list-outside ml-4 text-sm space-y-0.5 text-slate-600">
                    {bulletsOf(org.bulletsText).map((b, i) => (
                      <li key={i}>{b}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </section>
        )}

        {data.projects.length > 0 && (
          <section className="mb-5">
            <SectionHeading>Projek</SectionHeading>
            {data.projects.map((p) => (
              <div key={p.id} className="mb-3 last:mb-0">
                {p.title && <p className="font-semibold text-sm text-slate-900 mb-1">{p.title}</p>}
                {bulletsOf(p.bulletsText).length > 0 && (
                  <ul className="list-disc list-outside ml-4 text-sm space-y-0.5 text-slate-600">
                    {bulletsOf(p.bulletsText).map((b, i) => (
                      <li key={i}>{b}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </section>
        )}

        {data.certifications.length > 0 && (
          <section className="mb-5">
            <SectionHeading>Sertifikasi</SectionHeading>
            {data.certifications.map((cert) => (
              <div key={cert.id} className="mb-1 last:mb-0 text-sm">
                <span className="font-semibold text-slate-900">{cert.name}</span>
                {(cert.issuer || cert.date) && (
                  <span className="text-slate-500">
                    {" — "}
                    {[cert.issuer, cert.date].filter(Boolean).join(", ")}
                  </span>
                )}
              </div>
            ))}
          </section>
        )}

        {data.hardSkills && (
          <section className="mb-5">
            <SectionHeading>Hard Skill</SectionHeading>
            <TagList text={data.hardSkills} />
          </section>
        )}

        {data.softSkills && (
          <section className={data.languages ? "mb-5" : ""}>
            <SectionHeading>Soft Skill</SectionHeading>
            <TagList text={data.softSkills} />
          </section>
        )}

        {data.languages && (
          <section>
            <SectionHeading>Bahasa</SectionHeading>
            <TagList text={data.languages} />
          </section>
        )}
      </div>
    </div>
  );
}