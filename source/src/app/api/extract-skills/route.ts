import { NextResponse } from "next/server";
import { SOFT_SKILLS, type SoftSkillId } from "@/types";

const SOFT_SKILL_IDS = new Set<string>(SOFT_SKILLS.map((s) => s.id));
const REQUEST_TIMEOUT_MS = 15000;
const MAX_IDEA_LENGTH = 4000;
const MAX_ROLES = 10;
const MIN_ROLES = 1;
const MAX_SKILLS_PER_ROLE = 6;

interface ExtractedRole {
  name: string;
  requiredSkills: string[];
}

interface ExtractResponse {
  roles: ExtractedRole[];
  suggestedSoftSkills: SoftSkillId[];
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const bodyObj = typeof body === "object" && body !== null ? (body as Record<string, unknown>) : {};
  const ideaDescription = String(bodyObj.ideaDescription ?? "");
  const rawRoleCount = Number(bodyObj.roleCount);
  const roleCount = Number.isFinite(rawRoleCount)
    ? Math.min(MAX_ROLES, Math.max(MIN_ROLES, Math.floor(rawRoleCount)))
    : 3;

  if (!ideaDescription.trim()) {
    return NextResponse.json({ error: "ideaDescription is required." }, { status: 400 });
  }
  if (ideaDescription.length > MAX_IDEA_LENGTH) {
    return NextResponse.json({ error: `ideaDescription must be under ${MAX_IDEA_LENGTH} characters.` }, { status: 400 });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "AI skill extraction is not configured (missing OPENAI_API_KEY)." },
      { status: 503 }
    );
  }

  const softSkillList = SOFT_SKILLS.map((s) => `${s.id} (${s.label})`).join(", ");
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      signal: controller.signal,
      body: JSON.stringify({
        model: "gpt-4o-mini",
        response_format: { type: "json_object" },
        temperature: 0.2,
        messages: [
          {
            role: "system",
            content:
              "You design the team roster for a short project idea. The team size is already fixed at " +
              `EXACTLY ${roleCount} role(s) — you do not choose the count. Your job: ` +
              `(1) Name exactly ${roleCount} distinct role(s) (positions) that best cover this idea's work, ` +
              "each with a short, conventional title (e.g. \"Frontend Developer\", \"Backend Developer\", " +
              "\"UI/UX Designer\", \"Mobile Developer\", \"Data Scientist\", \"DevOps Engineer\", \"QA Engineer\"). " +
              `If ${roleCount} is 1, name the single most important generalist role. If ${roleCount} is large, ` +
              "it's fine for roles to specialize narrowly. " +
              "(2) For EACH role separately, list 2-5 concrete required skills (tech stacks/languages/frameworks/tools) " +
              "that specifically belong to that role — do not dump the same full skill list into every role; split skills " +
              "across roles the way a real team would divide the work. " +
              "Respond ONLY with a JSON object: " +
              '{"roles": [{"name": string, "requiredSkills": string[]}], "suggestedSoftSkills": string[]}. ' +
              `The "roles" array must have EXACTLY ${roleCount} entries. ` +
              `suggestedSoftSkills: pick zero or more ids ONLY from this fixed set: ${softSkillList}. ` +
              "Never invent soft skill ids outside that set.",
          },
          { role: "user", content: ideaDescription },
        ],
      }),
    });

    if (!response.ok) {
      const detail = await response.text().catch(() => "");
      return NextResponse.json(
        { error: `AI provider error (${response.status}).`, detail: detail.slice(0, 300) },
        { status: 502 }
      );
    }

    const data = await response.json();
    const content: string | undefined = data?.choices?.[0]?.message?.content;
    if (!content) {
      return NextResponse.json({ error: "AI returned no content." }, { status: 502 });
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(content);
    } catch {
      return NextResponse.json({ error: "AI returned malformed JSON." }, { status: 502 });
    }

    const rawRoles = Array.isArray((parsed as Record<string, unknown>)?.roles)
      ? ((parsed as Record<string, unknown>).roles as unknown[])
      : [];
    const rawSoftSkills = Array.isArray((parsed as Record<string, unknown>)?.suggestedSoftSkills)
      ? ((parsed as Record<string, unknown>).suggestedSoftSkills as unknown[])
      : [];

    const roles: ExtractedRole[] = rawRoles
      .filter((r): r is Record<string, unknown> => typeof r === "object" && r !== null)
      .map((r) => {
        const name = typeof r.name === "string" ? r.name.trim() : "";
        const requiredSkills = Array.isArray(r.requiredSkills)
          ? r.requiredSkills
              .filter((s): s is string => typeof s === "string" && s.trim().length > 0)
              .map((s) => s.trim())
              .slice(0, MAX_SKILLS_PER_ROLE)
          : [];
        return { name, requiredSkills };
      })
      .filter((r) => r.name && r.requiredSkills.length > 0)
      .slice(0, roleCount);

    const result: ExtractResponse = {
      roles,
      suggestedSoftSkills: rawSoftSkills
        .filter((s): s is string => typeof s === "string" && SOFT_SKILL_IDS.has(s))
        .map((s) => s as SoftSkillId),
    };

    return NextResponse.json(result);
  } catch (err) {
    const aborted = err instanceof Error && err.name === "AbortError";
    return NextResponse.json(
      { error: aborted ? "AI request timed out." : "AI request failed." },
      { status: 504 }
    );
  } finally {
    clearTimeout(timeout);
  }
}
