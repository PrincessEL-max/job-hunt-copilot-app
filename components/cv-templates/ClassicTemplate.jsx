import { bulletsOf } from "../../lib/utils";

export const templateFont = { fontFamily: "Georgia, 'Times New Roman', Times, serif" };

export default function ClassicTemplate({ data }) {
  return (
    <div className="p-10 text-black" style={templateFont}>
      <div className="flex justify-between items-start border-b-2 border-black pb-3 mb-3 gap-4">
        <div className="min-w-0">
          <h1 className="text-3xl leading-tight break-words">{data.fullName || "Nama Lengkap"}</h1>
          {data.targetPosition && <p className="text-sm italic mt-0.5">{data.targetPosition}</p>}
          <p className="text-xs mt-1.5">
            {[data.phone, data.email, data.linkedinUrl, data.githubUrl, data.portfolioUrl]
              .filter(Boolean)
              .join(" | ")}
          </p>
        </div>
        {data.showPhoto && data.photoDataUrl && (
          // eslint-disable-next-line @next/next/no-img-element -- base64 data URL, must render as-is inside #cv-preview for print/PDF export
          <img
            src={data.photoDataUrl}
            alt="Foto profil"
            className="w-24 h-24 rounded-md object-cover border border-slate-300 shrink-0"
          />
        )}
      </div>

      {data.aboutMe && <p className="text-sm leading-relaxed mb-4">{data.aboutMe}</p>}

      {data.education.length > 0 && (
        <section className="mb-4">
          <h2 className="text-sm font-bold uppercase border-b border-black pb-1 mb-2">
            Pendidikan
          </h2>
          {data.education.map((edu) => (
            <div key={edu.id} className="mb-2 last:mb-0">
              <p className="font-bold text-sm uppercase">
                {edu.institution}
                {edu.dateRange && ` (${edu.dateRange})`}
                {edu.major && ` - ${edu.major}`}
              </p>
              {edu.gpa && <p className="text-xs">IPK: {edu.gpa}</p>}
            </div>
          ))}
        </section>
      )}

      {data.workExperiences.length > 0 && (
        <section className="mb-4">
          <h2 className="text-sm font-bold uppercase border-b border-black pb-1 mb-2">
            Pengalaman
          </h2>
          {data.workExperiences.map((exp) => (
            <div key={exp.id} className="mb-3 last:mb-0">
              {(exp.title || exp.company) && (
                <>
                  <p className="font-bold text-sm uppercase">{exp.title}</p>
                  <p className="text-xs italic mb-1">
                    {[exp.company, exp.dateRange].filter(Boolean).join(" | ")}
                  </p>
                </>
              )}
              {bulletsOf(exp.bulletsText).length > 0 && (
                <ul className="list-disc list-outside ml-4 text-sm space-y-0.5">
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
        <section className="mb-4">
          <h2 className="text-sm font-bold uppercase border-b border-black pb-1 mb-2">
            Organisasi
          </h2>
          {data.organizations.map((org) => (
            <div key={org.id} className="mb-3 last:mb-0">
              {(org.title || org.company) && (
                <>
                  <p className="font-bold text-sm uppercase">{org.title}</p>
                  <p className="text-xs italic mb-1">
                    {[org.company, org.dateRange].filter(Boolean).join(" | ")}
                  </p>
                </>
              )}
              {bulletsOf(org.bulletsText).length > 0 && (
                <ul className="list-disc list-outside ml-4 text-sm space-y-0.5">
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
        <section className="mb-4">
          <h2 className="text-sm font-bold uppercase border-b border-black pb-1 mb-2">Projek</h2>
          {data.projects.map((p) => (
            <div key={p.id} className="mb-3 last:mb-0">
              {p.title && <p className="font-bold text-sm uppercase mb-1">{p.title}</p>}
              {bulletsOf(p.bulletsText).length > 0 && (
                <ul className="list-disc list-outside ml-4 text-sm space-y-0.5">
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
        <section className="mb-4">
          <h2 className="text-sm font-bold uppercase border-b border-black pb-1 mb-2">
            Sertifikasi
          </h2>
          {data.certifications.map((cert) => (
            <div key={cert.id} className="mb-1 last:mb-0 text-sm">
              <span className="font-bold">{cert.name}</span>
              {(cert.issuer || cert.date) && (
                <span>
                  {" — "}
                  {[cert.issuer, cert.date].filter(Boolean).join(", ")}
                </span>
              )}
            </div>
          ))}
        </section>
      )}

      {data.hardSkills && (
        <section className="mb-4">
          <h2 className="text-sm font-bold uppercase border-b border-black pb-1 mb-2">
            Hard Skill
          </h2>
          <p className="text-sm">{data.hardSkills}</p>
        </section>
      )}

      {data.softSkills && (
        <section className={data.languages ? "mb-4" : ""}>
          <h2 className="text-sm font-bold uppercase border-b border-black pb-1 mb-2">
            Soft Skill
          </h2>
          <p className="text-sm">{data.softSkills}</p>
        </section>
      )}

      {data.languages && (
        <section>
          <h2 className="text-sm font-bold uppercase border-b border-black pb-1 mb-2">Bahasa</h2>
          <p className="text-sm">{data.languages}</p>
        </section>
      )}
    </div>
  );
}