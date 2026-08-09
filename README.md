# hackmatch

Team-Matching prototype built for **SPD Challenge 2026** (Trường ĐH Khoa học Tự nhiên, ĐHQG-HCM), a 360-minute hackathon. See `topic.pdf` for the official brief.

## Application context

**A team-matching platform for hackathon/project teammate discovery.** Users register a profile (name, hard skills like tech stack/languages/frameworks, and soft skills), then either:

- **Find a team** — two modes, as tabs on the same page: "Opportunities for me" shows which specific *open roles*, across all projects, currently need skills the user actually has (filterable by how close a fit you are — fully matched, missing 1 skill, missing 2, missing 3+), with a request to join a specific role subject to the owner's approval; "Recruit" flips the direction — project owners pick one of their own projects and an open role, and browse the *candidate pool* ranked by skill match, sending an invite that the candidate then accepts or declines, or
- **Host a project** — set the team size first, then define named roles (e.g. "Frontend Developer", "UI/UX Designer") each with its own required tech stack, entered manually or auto-suggested by AI from the idea description (the AI generates **exactly** as many roles as the team size you set), then trigger a team suggestion for whatever roles aren't already filled by accepted members.

## What it does

Given the candidate pool and a project's roles, the system:

- Breaks a project down into **named roles**, each with its own required skills — not one flat skill list for the whole team.
- Recommends a valid team for open roles: no repeated members, respects the team-size limit, covers every role's required skills, and satisfies any additional (soft-skill) constraints; assigns each role to a specific best-fit member and explains why.
- Accounts for who's already been accepted onto the team — the "suggested team" panel only searches for people to fill the roles that are still open, and shows the confirmed roster separately.
- Recomputes live when candidates, roles, or constraints change, immediately dropping results that no longer qualify.
- Fails gracefully when no valid team exists, clearly stating what's missing — never fabricating data, repeating a member, hanging, or crashing.
- Lets a project owner review and accept/reject incoming role-targeted join requests, and notifies both sides (bell icon) when that happens.
- Gives each project a group chat: a collapsible top-right drawer (synced visually with the left sidebar) that opens to a group list, then a message thread with a back button.
- Supports light/dark mode — an actual sliding switch (not emoji) with hand-drawn sun/moon icons in the header, respects system preference by default, and persists your choice.
- Supports English/Vietnamese UI language (toggle in the header; **Vietnamese is the default**). Coverage spans nav, headings, buttons, form labels, empty states, and status text app-wide; project body copy (which is itself Vietnamese seed *data*, not UI chrome) and validation-error messages remain English — see `CLAUDE.md` for the exact scope.
- Every name in the app (project owner, matched team members, join-request senders) links to a public profile page (`/users/[id]`) showing avatar, location, GitHub link, skills, and every project joined — each labeled with the person's actual role on that project (or "Project owner").
- **Follow, not "like"** — you can follow both people and projects, each with its own follower count and a Follow/Following toggle. A collapsible left sidebar (account settings, my projects (hosted), projects joined, projects followed, people followed) sits alongside the main content once you're logged in.
- Requests flow both ways: candidates apply to open roles, **or** an owner recruiting on the "Recruit" tab can invite a specific candidate to a specific role. Whoever didn't initiate it gets to accept/reject — applications are approved by the owner, invites are accepted by the candidate — and both directions notify the right person and show up correctly in "My requests" / the project's "Join requests" list.
- Every project detail page has a **"Potential participants" section** (owner-only) that ranks the whole candidate pool against each still-open role by matched/missing skills, right below the "Suggested team" panel — the owner can invite anyone straight from there (which notifies them the same way the Recruit tab does) or click through to their public profile, without leaving the project page.
- User profiles carry a **languages** field (English, Vietnamese, Korean, Japanese, Chinese, French, German, Spanish — multi-select), shown on the public profile alongside hard/soft skills and editable from registration and profile edit.
- AI-assisted role planning: you set the team size, and the AI generates **exactly** that many roles, naming each one and splitting the required tech stack across them — it doesn't dump one flat skill list onto every role, and it doesn't pick its own role count anymore.
- A wider soft-skill pool (10 total: presentation, self-learning, critical thinking, brainstorming, teamwork, leadership, time management, adaptability, communication, problem solving) for both candidate profiles and project constraints.
- Project cards can carry an external link — a repo URL for code projects, or an event page for hackathons — shown as a button on the project detail page instead of a generic "copy link."
- A custom logo (three linked nodes, representing matched teammates) replaces the default Next.js branding, in the header and as the browser favicon.
- **Home is a landing page**, not a browse list: hero + a live stats bar (total candidates, total projects, open roles, matches made) + a 3-step "how it works" section. Project browsing (search + category filter) lives at `/projects`.

## Accounts

There's a lightweight mock login system (no real backend — see Security note below):

- Login is by **username + password**, not display name — a user has both (e.g. name "Nguyễn An", username `an`).
- **30 seeded mock candidates**, each with username = their given name (lowercase, no diacritics — e.g. `an`, `binh`, `chi`), password `12345678`, a realistic 6-7 skill tech stack sized to their role (e.g. a frontend dev has React, TypeScript, Tailwind CSS, Next.js, Redux, Jest, HTML/CSS), and 2-3 spoken languages (everyone speaks Vietnamese + English; a distributed subset adds a third). Log in via the "Quick demo login" list on `/login`, or register your own account (name + username + real password, ≥8 characters).
- Passwords are hashed client-side (SHA-256) before being stored in LocalStorage — this is a UX nicety, **not real security**, since anyone with access to the browser already has full access to LocalStorage. Do not reuse a real password here.

## Tech stack

Next.js (App Router) + TypeScript + Tailwind CSS. One serverless API route (`/api/extract-skills`) calls the OpenAI API server-side to auto-suggest required skills from a project idea's free text; the key is read from `source/.env.local` (git-ignored) and never reaches the client.

## Getting started

```bash
cd source
npm install
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000). Log in as any seeded mock candidate (password `12345678`) from `/login` for fast demoing, or register your own profile.

Other scripts (run from `source/`): `npm run build`, `npm run lint`.

To enable AI-assisted skill suggestion when hosting a project, create `source/.env.local` with:
```
OPENAI_API_KEY=sk-...
```
Without it, the "Let AI suggest required skills" button reports the feature is unavailable and required skills can still be entered manually.

## Project structure

```
hackmatch/
├── README.md              # this file
├── chatlog.md             # log of AI-assisted prompts/decisions made during the build
├── submission.json        # submission metadata
├── .gitignore
├── topic.pdf               # official contest brief
├── LICENSE
└── source/                # Next.js + TypeScript app
    └── src/
        ├── app/            # routes: /, /login, /register, /profile/edit, /users/[id],
        │                   # /projects, /projects/new, /projects/[id], /find-team,
        │                   # /my-requests, /api/extract-skills
        ├── components/     # Header, UserMenu, NotificationBell, ChatDrawer, LeftSidebar,
        │                   # ThemeToggle, LanguageToggle, Logo, Avatar, UserLink, icons.tsx,
        │                   # ProjectCard/ProjectBrowser, shared UI primitives
        ├── lib/            # store.ts (reactive LocalStorage data layer incl. notifications/
        │                   # chat/likes), matching.ts (team-formation engine),
        │                   # auth.ts (password hashing), slug.ts (username suggestion),
        │                   # i18n.ts (EN/VI dictionary + language store),
        │                   # uiStore.ts (chat drawer open/active-project UI state)
        ├── data/           # skill taxonomy, 30 seeded mock candidates, 12 seeded mock projects (each with named roles)
        └── types/          # shared TypeScript types
```

## License

MIT — see `LICENSE`.
