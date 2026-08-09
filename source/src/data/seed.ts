import { SEED_PASSWORD_HASH } from "@/lib/auth";
import type { LanguageId, UserProfile } from "@/types";

interface RawSeedUser {
  name: string;
  username: string;
  location: string;
  hardSkills: string[];
  softSkills: UserProfile["softSkills"];
  languages: LanguageId[];
}

const RAW_SEED: RawSeedUser[] = [
  { name: "Nguyễn An", username: "an", location: "TP. Hồ Chí Minh", hardSkills: ["React", "TypeScript", "Tailwind CSS", "Next.js", "Redux", "Jest", "HTML/CSS"], softSkills: ["presentation", "brainstorming"], languages: ["vietnamese", "english"] },
  { name: "Trần Bình", username: "binh", location: "Hà Nội", hardSkills: ["Node.js", "Express", "MongoDB", "TypeScript", "REST API", "Docker", "Redis"], softSkills: ["self_learning", "teamwork"], languages: ["vietnamese", "english"] },
  { name: "Lê Chi", username: "chi", location: "Đà Nẵng", hardSkills: ["Python", "Machine Learning", "Data Analysis", "TensorFlow", "Pandas", "NumPy", "SQL"], softSkills: ["critical_thinking"], languages: ["vietnamese", "english", "japanese"] },
  { name: "Phạm Dũng", username: "dung", location: "Cần Thơ", hardSkills: ["Java", "Spring Boot", "MySQL", "Hibernate", "REST API", "Docker", "Maven"], softSkills: ["self_learning", "critical_thinking"], languages: ["vietnamese", "english"] },
  { name: "Hoàng Yến", username: "hoangyen", location: "Huế", hardSkills: ["Figma", "UI/UX Design", "Adobe XD", "Prototyping", "Wireframing", "Illustrator"], softSkills: ["presentation", "brainstorming"], languages: ["vietnamese", "english", "korean"] },
  { name: "Vũ Khang", username: "khang", location: "Nha Trang", hardSkills: ["Go", "Docker", "Kubernetes", "AWS", "CI/CD", "Terraform", "Linux"], softSkills: ["critical_thinking", "problem_solving"], languages: ["vietnamese", "english"] },
  { name: "Đặng Linh", username: "linh", location: "Hải Phòng", hardSkills: ["React", "Next.js", "GraphQL", "TypeScript", "Apollo Client", "Tailwind CSS", "Redux"], softSkills: ["brainstorming"], languages: ["vietnamese", "english"] },
  { name: "Bùi Minh", username: "minh", location: "Bình Dương", hardSkills: ["C++", "Rust", "DevOps", "Linux", "Docker", "CI/CD", "Bash"], softSkills: ["self_learning"], languages: ["vietnamese", "english", "german"] },
  { name: "Ngô Ngọc", username: "ngoc", location: "Vũng Tàu", hardSkills: ["Vue", "JavaScript", "Tailwind CSS", "Vuex", "HTML/CSS", "Vite", "Nuxt"], softSkills: ["presentation"], languages: ["vietnamese", "english"] },
  { name: "Đỗ Phong", username: "phong", location: "Đà Lạt", hardSkills: ["AWS", "Docker", "DevOps", "Kubernetes", "Terraform", "CI/CD", "Linux"], softSkills: ["critical_thinking", "self_learning"], languages: ["vietnamese", "english"] },
  { name: "Trịnh Quân", username: "quan", location: "TP. Hồ Chí Minh", hardSkills: ["Python", "Django", "PostgreSQL", "REST API", "Docker", "Redis", "Celery"], softSkills: ["brainstorming", "leadership"], languages: ["vietnamese", "english", "chinese"] },
  { name: "Lý Sơn", username: "son", location: "Hà Nội", hardSkills: ["Swift", "Flutter", "React Native", "iOS", "Android", "Dart", "Kotlin"], softSkills: ["presentation", "self_learning"], languages: ["vietnamese", "english"] },
  { name: "Mai Trang", username: "trang", location: "Đà Nẵng", hardSkills: ["Data Analysis", "Python", "Machine Learning", "SQL", "Pandas", "Tableau", "Scikit-learn"], softSkills: ["critical_thinking"], languages: ["vietnamese", "english", "korean"] },
  { name: "Phan Tuấn", username: "tuan", location: "Cần Thơ", hardSkills: ["Node.js", "TypeScript", "GraphQL", "Apollo Server", "MongoDB", "Docker", "REST API"], softSkills: ["self_learning", "brainstorming"], languages: ["vietnamese", "english"] },
  { name: "Đinh Uyên", username: "uyen", location: "Huế", hardSkills: ["Figma", "UI/UX Design", "JavaScript", "HTML/CSS", "Prototyping", "Adobe XD", "React"], softSkills: ["presentation", "critical_thinking"], languages: ["vietnamese", "english", "french"] },
  { name: "Cao Việt", username: "viet", location: "Nha Trang", hardSkills: ["Kotlin", "Java", "Android", "Jetpack Compose", "SQLite", "REST API"], softSkills: ["self_learning", "time_management"], languages: ["vietnamese", "english"] },
  { name: "Hồ Xuân", username: "xuan", location: "Hải Phòng", hardSkills: ["Solidity", "TypeScript", "Node.js", "Web3.js", "Ethereum", "Hardhat", "Smart Contracts"], softSkills: ["critical_thinking", "brainstorming"], languages: ["vietnamese", "english"] },
  { name: "Dương Yên", username: "duongyen", location: "Bình Dương", hardSkills: ["React", "Node.js", "MongoDB", "TypeScript", "Express", "REST API", "Tailwind CSS"], softSkills: ["presentation", "communication"], languages: ["vietnamese", "english"] },
  { name: "Tô Bảo", username: "bao", location: "Vũng Tàu", hardSkills: ["C#", "AWS", "MySQL", ".NET", "ASP.NET", "REST API", "Docker"], softSkills: ["self_learning", "critical_thinking"], languages: ["vietnamese", "english", "chinese"] },
  { name: "Vương Chinh", username: "chinh", location: "Đà Lạt", hardSkills: ["GCP", "Kubernetes", "Go", "Docker", "Terraform", "CI/CD", "Microservices"], softSkills: ["brainstorming", "self_learning"], languages: ["vietnamese", "english"] },
  { name: "Lâm Hà", username: "ha", location: "TP. Hồ Chí Minh", hardSkills: ["Angular", "TypeScript", "RxJS", "HTML/CSS", "NgRx", "REST API", "Jest"], softSkills: ["critical_thinking", "adaptability"], languages: ["vietnamese", "english"] },
  { name: "Đoàn Giang", username: "giang", location: "Hà Nội", hardSkills: ["Python", "FastAPI", "Docker", "PostgreSQL", "REST API", "Pytest", "Redis"], softSkills: ["self_learning"], languages: ["vietnamese", "english", "japanese"] },
  { name: "Vũ Nam", username: "nam", location: "Đà Nẵng", hardSkills: ["Node.js", "NestJS", "PostgreSQL", "TypeScript", "Docker", "REST API", "Redis"], softSkills: ["brainstorming", "teamwork"], languages: ["vietnamese", "english"] },
  { name: "Trương Đăng", username: "dang", location: "Cần Thơ", hardSkills: ["React", "Redux", "Jest", "TypeScript", "JavaScript", "Tailwind CSS", "REST API"], softSkills: ["presentation"], languages: ["vietnamese", "english"] },
  { name: "Huỳnh Vy", username: "vy", location: "Huế", hardSkills: ["Figma", "UI/UX Design", "Illustrator", "Adobe XD", "Prototyping", "Wireframing", "Photoshop"], softSkills: ["presentation", "brainstorming"], languages: ["vietnamese", "english", "korean"] },
  { name: "Đặng Thảo", username: "thao", location: "Nha Trang", hardSkills: ["Python", "Data Analysis", "SQL", "Pandas", "Tableau", "NumPy", "Excel"], softSkills: ["critical_thinking", "problem_solving"], languages: ["vietnamese", "english"] },
  { name: "Nguyễn Long", username: "long", location: "Hải Phòng", hardSkills: ["Java", "Kotlin", "Android", "Jetpack Compose", "SQLite", "REST API", "Firebase"], softSkills: ["self_learning"], languages: ["vietnamese", "english"] },
  { name: "Phan Hải", username: "hai", location: "Bình Dương", hardSkills: ["Go", "gRPC", "Kubernetes", "Docker", "Microservices", "Terraform", "Linux"], softSkills: ["critical_thinking", "self_learning"], languages: ["vietnamese", "english", "spanish"] },
  { name: "Lê My", username: "my", location: "Vũng Tàu", hardSkills: ["JavaScript", "Vue", "Nuxt", "TypeScript", "Tailwind CSS", "Vuex", "HTML/CSS"], softSkills: ["presentation", "adaptability"], languages: ["vietnamese", "english"] },
  { name: "Trần Phúc", username: "phuc", location: "Đà Lạt", hardSkills: ["C#", ".NET", "Azure", "ASP.NET", "SQL Server", "REST API", "Docker"], softSkills: ["self_learning", "brainstorming"], languages: ["vietnamese", "english", "french"] },
];

export function seedUsers(): UserProfile[] {
  const now = new Date().toISOString();
  return RAW_SEED.map((raw, index) => ({
    id: `seed-${index + 1}`,
    username: raw.username,
    name: raw.name,
    location: raw.location,
    githubUrl: `https://github.com/${raw.username}`,
    hardSkills: raw.hardSkills,
    softSkills: raw.softSkills,
    languages: raw.languages,
    passwordHash: SEED_PASSWORD_HASH,
    followedBy: [],
    isSeed: true,
    createdAt: now,
  }));
}
