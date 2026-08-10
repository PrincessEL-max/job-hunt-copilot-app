import { bulletsOf } from "../../lib/utils";

const font = { fontFamily: "'Inter', 'Helvetica Neue', Arial, sans-serif" };
const SIDEBAR_BG = "#0f2f2c"; // deep teal, distinct from the app's own teal-700 accent

function SidebarHeading({ children }) {
  return (
    <h2 className="text-xs font-bold uppercase tracking-wide text-teal-300 mb-2 mt-5 first:mt-0">
      {children}
    </h2>
  );
}

function MainHeading({ children }) {
  return (
    <h2 className="text-sm font-bold uppercase tracking-wide text-slate-900 border-b-2 border-slate-800 pb-1 mb-2">
      {children}
    </h2>
  );
}

function SidebarTags({ text }) {
  const items = (text || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  if (items.length === 0) return null;
  return (
    <ul className="space-y-1">
      {items.map((item, i) => (
        <li key={i} className="text-xs text-slate-200">
          {item}
        </li>
      ))}
    </ul>
  );
}

export default function TwoColumnTemplate({ data }) {
  const contactLines = [
    data.phone,
    data.email,
    data.linkedinUrl,
    data.githubUrl,
    data.portfolioUrl,
  ].filter(Boolean);

  return (
    <div className="flex text-black" style={font}>
      {/* Sidebar */}
      <div className="w-[34%] shrink-0 p-6 text-white" style={{ backgroundColor: SIDEBAR_BG }}>
        {data.showPhoto && data.photoDataUrl && (
          // eslint-disable-next-line @next/next/no-img-element -- base64 data URL, must render as-is inside #cv-preview for print/PDF export
          <img
            src={data.photoDataUrl}
            alt="Foto profil"
            className="w-24 h-24 rounded-full object-cover border-2 border-teal-300 mx-auto mb-4"
          />
        )}

        {contactLines.length > 0 && (
          <>
            <SidebarHeading>Kontak</SidebarHeading>
            <ul className="space-y-1">
              {contactLines.map((line, i) => (
                <li key={i} className="text-xs text-slate-200 break-words">
                  {line}
                </li>
              ))}
            </ul>
          </>
        )}

        {data.education.length > 0 && (
          <>
            <SidebarHeading>Pendidikan</SidebarHeading>
            {data.education.map((edu) => (
              <div key={edu.id} className="mb-2 last:mb-0">
                <p className="text-xs font-semibold text-white">{edu.institution}</p>
                <p className="text-[11px] text-slate-300">{edu.major}</p>
                <p className="text-[11px] text-slate-400">
                  {[edu.dateRange, edu.gpa && `IPK ${edu.gpa}`].filter(Boolean).join(" · ")}
                </p>
              </div>
            ))}
          </>
        )}

        {data.hardSkills && (
          <>
            <SidebarHeading>Hard Skill</SidebarHeading>
            <SidebarTags text={data.hardSkills} />
          </>
        )}

        {data.softSkills && (
          <>
            <SidebarHeading>Soft Skill</SidebarHeading>
            <SidebarTags text={data.softSkills} />
          </>
        )}

        {data.languages && (
          <>
            <SidebarHeading>Bahasa</SidebarHeading>
            <SidebarTags text={data.languages} />
          </>
        )}

        {data.certifications.length > 0 && (
          <>
            <SidebarHeading>Sertifikasi</SidebarHeading>
            <ul className="space-y-1.5">
              {data.certifications.map((cert) => (
                <li key={cert.id} className="text-xs text-slate-200">
                  <p className="font-medium text-white">{cert.name}</p>
                  {(cert.issuer || cert.date) && (
                    <p className="text-[11px] text-slate-400">
                      {[cert.issuer, cert.date].filter(Boolean).join(", ")}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          </>
        )}
      </div>

      {/* Main column */}
      <div className="flex-1 p-6 min-w-0">
        <h1 className="text-2xl font-bold leading-tight break-words text-slate-900">
          {data.fullName || "Nama Lengkap"}
        </h1>
        {data.targetPosition && (
          <p className="text-sm font-medium text-teal-700 mt-0.5 mb-4">{data.targetPosition}</p>
        )}

        {data.aboutMe && (
          <p className="text-sm leading-relaxed mb-4 text-slate-600">{data.aboutMe}</p>
        )}

        {data.workExperiences.length > 0 && (
          <section className="mb-4">
            <MainHeading>Pengalaman</MainHeading>
            {data.workExperiences.map((exp) => (
              <div key={exp.id} className="mb-3 last:mb-0">
                {(exp.title || exp.company) && (
                  <>
                    <p className="font-semibold text-sm text-slate-900">{exp.title}</p>
                    <p className="text-xs text-slate-500 mb-1">
                      {[exp.company, exp.dateRange].filter(Boolean).join(" · ")}
                    </p>
                  </>
                )}
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
          <section className="mb-4">
            <MainHeading>Organisasi</MainHeading>
            {data.organizations.map((org) => (
              <div key={org.id} className="mb-3 last:mb-0">
                {(org.title || org.company) && (
                  <>
                    <p className="font-semibold text-sm text-slate-900">{org.title}</p>
                    <p className="text-xs text-slate-500 mb-1">
                      {[org.company, org.dateRange].filter(Boolean).join(" · ")}
                    </p>
                  </>
                )}
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
          <section>
            <MainHeading>Projek</MainHeading>
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
      </div>
    </div>
  );
}