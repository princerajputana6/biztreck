// HR document templates — offer letters, appointment letters, internship
// offers, internship certificates, experience certificates and relieving
// letters. Each type resolves to a structured content object (a "letter" or a
// "certificate") that the PDF route renders on the Biztreck letterhead. The
// wording lives here so it's easy to review/adjust; key HR terms are
// env-overridable so nothing company-specific is hard to change.

import { companyProfile } from "@/lib/admin-operations";

export type HrDocType =
  | "offer_letter"
  | "appointment_letter"
  | "internship_offer"
  | "internship_certificate"
  | "experience_certificate"
  | "relieving_letter";

export type HrDocMeta = {
  label: string;
  layout: "letter" | "certificate";
  // Which staff a doc is normally for — used to show the right buttons per person.
  audience: "employee" | "intern";
};

export const HR_DOCS: Record<HrDocType, HrDocMeta> = {
  offer_letter: { label: "Offer letter", layout: "letter", audience: "employee" },
  appointment_letter: { label: "Appointment letter", layout: "letter", audience: "employee" },
  internship_offer: { label: "Internship offer", layout: "letter", audience: "intern" },
  internship_certificate: { label: "Internship certificate", layout: "certificate", audience: "intern" },
  experience_certificate: { label: "Experience certificate", layout: "letter", audience: "employee" },
  relieving_letter: { label: "Relieving letter", layout: "letter", audience: "employee" },
};

export function isHrDocType(v: string): v is HrDocType {
  return Object.prototype.hasOwnProperty.call(HR_DOCS, v);
}

// Company-wide HR terms — override any of these via env without touching code.
function hrConfig() {
  const co = companyProfile();
  return {
    probationMonths: Number(process.env.HR_PROBATION_MONTHS || 3),
    noticeDays: Number(process.env.HR_NOTICE_DAYS || 30),
    probationNoticeDays: Number(process.env.HR_PROBATION_NOTICE_DAYS || 15),
    workingHours:
      process.env.HR_WORKING_HOURS || "10:00 AM to 7:00 PM, Monday to Friday",
    jurisdiction:
      process.env.HR_JURISDICTION || "Gautam Buddh Nagar, Uttar Pradesh",
    signatoryName: process.env.HR_SIGNATORY_NAME || co.signatory.name,
    signatoryTitle: process.env.HR_SIGNATORY_TITLE || co.signatory.title,
  };
}

export type HrEmployee = {
  name?: string;
  role?: string;
  department?: string;
  employmentType?: string; // "full-time" | "intern" | "contract"
  email?: string;
  salaryMonthly?: number | string;
  joiningDate?: string; // start (YYYY-MM-DD)
  endDate?: string; // end / last working day (YYYY-MM-DD)
  location?: string;
  employeeCode?: string;
  status?: string;
  // Optional details that make certificates richer (esp. for interns/students).
  title?: string; // honorific: "Mr." | "Ms." | "Mx." | "Dr." | ""
  pronoun?: string; // "he/him" | "she/her" | "they/them" (you set this, never inferred)
  institution?: string; // college / university
  course?: string; // degree / course
  mentor?: string; // mentor / guide name
  responsibilities?: string; // free-text description of the work done
};

// Pronoun set for a person — YOU choose it on the record; it is never inferred.
function pronounSet(p?: string) {
  const v = String(p || "").toLowerCase();
  if (v.startsWith("she")) return { sub: "she", obj: "her", pos: "her" };
  if (v.startsWith("he")) return { sub: "he", obj: "him", pos: "his" };
  return { sub: "they", obj: "them", pos: "their" };
}
const cap = (s: string) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s);
const article = (word: string) => (/^[aeiou]/i.test(String(word).trim()) ? "an" : "a");

export type LetterDoc = {
  layout: "letter";
  docTitle: string; // header (right side), e.g. "OFFER LETTER"
  fileLabel: string;
  dateLabel: string;
  toBlock: string[]; // addressee lines, or ["TO WHOMSOEVER IT MAY CONCERN"]
  subject: string;
  salutation: string;
  body: string[];
  closing: string[];
  signatory: { name: string; title: string; company: string };
  acceptance: boolean; // show a "candidate acceptance" signature block
};

export type CertificateDoc = {
  layout: "certificate";
  docTitle: string; // e.g. "CERTIFICATE OF INTERNSHIP"
  fileLabel: string;
  eyebrow: string; // "This is to certify that"
  name: string;
  body: string[]; // centred paragraphs
  dateLabel: string;
  signatory: { name: string; title: string; company: string };
};

export type HrDoc = LetterDoc | CertificateDoc;

// ---- helpers ---------------------------------------------------------------

function fmtDate(s?: string): string {
  const v = String(s || "").trim();
  if (!v) return "";
  const d = new Date(v.length <= 10 ? `${v}T12:00:00` : v);
  if (Number.isNaN(d.getTime())) return v;
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

function todayLabel(): string {
  return new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

const inr = (v: number) => `INR ${Math.round(v).toLocaleString("en-IN")}`;

function durationText(start?: string, end?: string): string {
  const a = new Date(`${start}T12:00:00`);
  const b = new Date(`${end}T12:00:00`);
  if (Number.isNaN(a.getTime()) || Number.isNaN(b.getTime()) || b < a) return "";
  const days = Math.round((b.getTime() - a.getTime()) / (24 * 3600 * 1000));
  if (days < 45) {
    const weeks = Math.max(1, Math.round(days / 7));
    return `${weeks} week${weeks === 1 ? "" : "s"}`;
  }
  const months = Math.max(1, Math.round(days / 30));
  return `${months} month${months === 1 ? "" : "s"}`;
}

// ---- main builder ----------------------------------------------------------

export function buildHrDoc(type: HrDocType, emp: HrEmployee): HrDoc {
  const co = companyProfile();
  const cfg = hrConfig();
  const company = co.name;
  const name = String(emp.name || "").trim() || "The Candidate";
  const first = name.split(/\s+/)[0];
  const role = String(emp.role || "").trim() || "Team Member";
  const dept = String(emp.department || "").trim();
  const deptClause = dept ? ` in the ${dept} department` : "";
  const location = String(emp.location || "").trim() || co.address;
  const start = emp.joiningDate;
  const end = emp.endDate;
  const startLabel = fmtDate(start) || "the agreed joining date";
  const endLabel = fmtDate(end);
  const monthly = Math.max(0, Number(emp.salaryMonthly || 0));
  const annual = monthly * 12;
  const code = String(emp.employeeCode || "").trim();
  const signatory = { name: cfg.signatoryName, title: cfg.signatoryTitle, company };
  const dur = durationText(start, end);
  const durClause = dur ? ` (a duration of ${dur})` : "";
  const titleWord = String(emp.title || "").trim();
  const titled = titleWord ? `${titleWord} ${name}` : name;
  const P = pronounSet(emp.pronoun);
  const institution = String(emp.institution || "").trim();
  const course = String(emp.course || "").trim();
  const mentor = String(emp.mentor || "").trim();
  const responsibilities = String(emp.responsibilities || "").trim();

  const compLine = (label: string) =>
    monthly > 0
      ? `Your ${label} will be ${inr(monthly)} per month (CTC ${inr(annual)} per annum), subject to applicable statutory deductions and company policy.`
      : "";

  switch (type) {
    case "offer_letter":
      return {
        layout: "letter",
        docTitle: "OFFER LETTER",
        fileLabel: "offer-letter",
        dateLabel: todayLabel(),
        toBlock: [name, ...(emp.email ? [emp.email] : [])],
        subject: `Offer of Employment — ${role}`,
        salutation: `Dear ${first},`,
        body: [
          `We are pleased to offer you the position of ${role}${deptClause} at ${company}. This offer reflects our confidence in your abilities and our belief that you will be a valuable addition to our team.`,
          `Your employment is expected to commence on ${startLabel}, subject to completion of the onboarding formalities. Your place of work will be ${location}.`,
          compLine("compensation"),
          `You will be on probation for a period of ${cfg.probationMonths} months from your date of joining, during which your performance will be reviewed. The detailed terms and conditions of your employment will be set out in your Appointment Letter.`,
          `This offer is contingent upon successful verification of the information and documents provided by you, and your acceptance of the company's policies.`,
        ].filter(Boolean),
        closing: [
          `We are excited to welcome you to ${company} and look forward to a long and rewarding association.`,
          `Please sign and return a copy of this letter as a token of your acceptance.`,
        ],
        signatory,
        acceptance: true,
      };

    case "appointment_letter":
      return {
        layout: "letter",
        docTitle: "APPOINTMENT LETTER",
        fileLabel: "appointment-letter",
        dateLabel: todayLabel(),
        toBlock: [name, ...(emp.email ? [emp.email] : [])],
        subject: `Appointment as ${role}`,
        salutation: `Dear ${first},`,
        body: [
          `With reference to your acceptance of our offer, we are pleased to confirm your appointment as ${role}${deptClause} at ${company}, effective ${startLabel}.`,
          compLine("gross compensation"),
          `Your normal working hours are ${cfg.workingHours}. Your place of posting is ${location}; you may be required to work from other locations as per business needs.`,
          `You will be on probation for ${cfg.probationMonths} months, extendable at the company's discretion. On satisfactory completion, your services will be confirmed in writing.`,
          `After confirmation, either party may terminate this employment by giving ${cfg.noticeDays} days' written notice or salary in lieu thereof; during probation the notice period is ${cfg.probationNoticeDays} days.`,
          `You shall maintain strict confidentiality of all proprietary and client information during and after your employment. Any intellectual property created in the course of your work shall vest solely with the company.`,
          `Your employment is governed by the policies of ${company} as amended from time to time, and any disputes shall be subject to the jurisdiction of the courts at ${cfg.jurisdiction}.`,
        ].filter(Boolean),
        closing: [`We welcome you to ${company} and wish you a long and successful career with us.`],
        signatory,
        acceptance: true,
      };

    case "internship_offer":
      return {
        layout: "letter",
        docTitle: "INTERNSHIP OFFER LETTER",
        fileLabel: "internship-offer",
        dateLabel: todayLabel(),
        toBlock: [name, ...(emp.email ? [emp.email] : [])],
        subject: `Internship Offer — ${role} Intern`,
        salutation: `Dear ${first},`,
        body: [
          `We are delighted to offer you an internship as a ${role} Intern at ${company}. This internship is designed to give you hands-on experience and mentorship in a professional working environment.`,
          endLabel
            ? `Your internship will run from ${startLabel} to ${endLabel}${durClause}. Your place of work will be ${location}.`
            : `Your internship will commence on ${startLabel}. Your place of work will be ${location}.`,
          monthly > 0
            ? `You will receive a stipend of ${inr(monthly)} per month during the internship, subject to applicable deductions.`
            : `This is a learning-focused internship. Any stipend, if applicable, will be communicated separately.`,
          `During the internship you will work on live projects under the guidance of your mentor, and you are expected to maintain confidentiality of all company and client information.`,
          `Please note that this internship does not constitute an offer of employment. On successful completion, you will be issued an Internship Certificate.`,
        ].filter(Boolean),
        closing: [
          `We look forward to your contribution and to supporting your growth during this internship.`,
          `Please sign and return a copy of this letter as a token of your acceptance.`,
        ],
        signatory,
        acceptance: true,
      };

    case "internship_certificate": {
      const studentText = course && institution
        ? `a student of ${course} at ${institution}, `
        : institution
          ? `a student at ${institution}, `
          : "";
      const mentorClause = mentor ? ` under the guidance of ${mentor}` : "";
      const respPara =
        (responsibilities ||
          `${cap(P.pos)} responsibilities included assisting in ${role.toLowerCase()} tasks, contributing to live projects, and gaining practical exposure to the tools and technologies used at ${company}.`) +
        ` During the internship period, ${P.sub} demonstrated good analytical skills, problem-solving ability, and dedication towards the assigned tasks.`;
      return {
        layout: "certificate",
        docTitle: "CERTIFICATE OF INTERNSHIP",
        fileLabel: "internship-certificate",
        eyebrow: "This is to certify that",
        name: titled,
        // Body continues from the prominently-displayed name.
        body: [
          `${studentText}has successfully completed ${P.pos} internship at ${company} from ${startLabel}${endLabel ? ` to ${endLabel}` : ""}${durClause}. During the internship tenure, ${P.sub} worked as ${article(role)} ${role} Intern${mentorClause}.`,
          respPara,
          `We found ${P.obj} to be punctual, sincere, and eager to learn. ${cap(P.pos)} performance during the internship was satisfactory, and ${P.sub} showed professionalism and enthusiasm in completing the assigned responsibilities.`,
          `We wish ${titled} all the best for ${P.pos} future academic and professional endeavours.`,
        ],
        dateLabel: todayLabel(),
        signatory,
      };
    }

    case "experience_certificate":
      return {
        layout: "letter",
        docTitle: "EXPERIENCE CERTIFICATE",
        fileLabel: "experience-certificate",
        dateLabel: todayLabel(),
        toBlock: ["TO WHOMSOEVER IT MAY CONCERN"],
        subject: "",
        salutation: "",
        body: [
          `This is to certify that ${titled}${code ? ` (Employee Code: ${code})` : ""} was employed with ${company} as ${role}${deptClause} from ${startLabel}${endLabel ? ` to ${endLabel}` : ""}.`,
          `During this tenure, ${first} was diligent, professional and committed, handled the assigned responsibilities competently, and maintained good conduct throughout the association.`,
          `We wish ${first} success in all future endeavours.`,
          `This certificate is issued upon request for whatever purpose it may serve.`,
        ],
        closing: [],
        signatory,
        acceptance: false,
      };

    case "relieving_letter":
      return {
        layout: "letter",
        docTitle: "RELIEVING LETTER",
        fileLabel: "relieving-letter",
        dateLabel: todayLabel(),
        toBlock: [name, ...(emp.email ? [emp.email] : [])],
        subject: `Relieving from the services of ${company}`,
        salutation: `Dear ${first},`,
        body: [
          `This is with reference to your separation from the position of ${role}${deptClause} at ${company}. We confirm that you have been relieved from your duties with effect from the close of business on ${endLabel || "your last working day"}.`,
          `We confirm that, as on your last working day, you have completed the necessary handovers and exit formalities and there are no dues pending against you, subject to full and final settlement as per company policy.`,
          `We thank you for your contribution during your association with ${company}${startLabel ? ` from ${startLabel}${endLabel ? ` to ${endLabel}` : ""}` : ""}, and wish you the very best in your future endeavours.`,
        ],
        closing: [`Warm regards,`],
        signatory,
        acceptance: false,
      };
  }
}
