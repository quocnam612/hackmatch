import type { Project, ProjectRole } from "@/types";

interface RawRole {
  name: string;
  requiredSkills: string[];
}

interface RawProject {
  ownerId: string;
  title: string;
  ideaDescription: string;
  category: Project["category"];
  location?: string;
  deadline?: string;
  roles: RawRole[];
  optionalSoftSkills: Project["optionalSoftSkills"];
  teamSize: number;
  externalLink: string;
}

const RAW_PROJECTS: RawProject[] = [
  {
    ownerId: "seed-1",
    title: "Ứng dụng đặt lịch tình nguyện sinh viên",
    ideaDescription:
      "Nền tảng giúp sinh viên tìm và đăng ký các hoạt động tình nguyện gần trường, với lịch nhắc và xác nhận tham gia theo thời gian thực.",
    category: "hackathon",
    location: "TP. Hồ Chí Minh",
    deadline: "2026-08-23",
    roles: [
      { name: "Frontend Developer", requiredSkills: ["React", "TypeScript", "Tailwind CSS"] },
      { name: "Backend Developer", requiredSkills: ["Node.js", "Express", "MongoDB"] },
      { name: "UI/UX Designer", requiredSkills: ["Figma", "UI/UX Design"] },
    ],
    optionalSoftSkills: ["presentation", "brainstorming"],
    teamSize: 3,
    externalLink: "https://github.com/an/volunteer-scheduler",
  },
  {
    ownerId: "seed-9",
    title: "Blog cá nhân chia sẻ kiến thức lập trình",
    ideaDescription:
      "Một trang blog nhẹ, nhanh, viết bằng Vue, nơi mình đăng các bài học và ghi chú khi tự học lập trình web.",
    category: "personal_project",
    deadline: "2026-09-05",
    roles: [{ name: "Frontend Developer", requiredSkills: ["Vue", "JavaScript", "Tailwind CSS"] }],
    optionalSoftSkills: ["self_learning"],
    teamSize: 2,
    externalLink: "https://github.com/ngoc/dev-blog",
  },
  {
    ownerId: "seed-3",
    title: "Seminar: Nhập môn Machine Learning cho sinh viên năm nhất",
    ideaDescription:
      "Buổi seminar giới thiệu các khái niệm cơ bản của Machine Learning, kèm demo trực quan bằng dữ liệu thực tế của trường.",
    category: "seminar",
    location: "Hội trường A, ĐH KHTN",
    deadline: "2026-08-20",
    roles: [
      { name: "Data Scientist", requiredSkills: ["Python", "Machine Learning", "Data Analysis"] },
      { name: "Slide/Content Designer", requiredSkills: ["Figma", "UI/UX Design"] },
    ],
    optionalSoftSkills: ["presentation", "critical_thinking"],
    teamSize: 2,
    externalLink: "https://github.com/chi/ml-seminar",
  },
  {
    ownerId: "seed-6",
    title: "Startup: Nền tảng thương mại điện tử cho nông sản sạch",
    ideaDescription:
      "Kết nối trực tiếp nông dân với người tiêu dùng, cắt giảm khâu trung gian, tối ưu logistics bằng hệ thống container hóa dịch vụ.",
    category: "startup",
    location: "Remote",
    deadline: "2026-10-01",
    roles: [
      { name: "Backend/DevOps Engineer", requiredSkills: ["Go", "Docker", "Kubernetes"] },
      { name: "Frontend Developer", requiredSkills: ["React", "TypeScript", "Tailwind CSS"] },
      { name: "Data Analyst", requiredSkills: ["Python", "Data Analysis"] },
    ],
    optionalSoftSkills: ["critical_thinking", "self_learning"],
    teamSize: 3,
    externalLink: "https://github.com/khang/nongsan-marketplace",
  },
  {
    ownerId: "seed-13",
    title: "Khóa luận tốt nghiệp: Hệ thống gợi ý sản phẩm cá nhân hóa",
    ideaDescription:
      "Xây dựng mô hình gợi ý sản phẩm dựa trên hành vi người dùng, so sánh hiệu quả giữa collaborative filtering và deep learning.",
    category: "thesis",
    deadline: "2026-12-15",
    roles: [{ name: "ML Researcher", requiredSkills: ["Python", "Machine Learning", "Data Analysis"] }],
    optionalSoftSkills: ["critical_thinking", "self_learning"],
    teamSize: 2,
    externalLink: "https://github.com/trang/recommendation-thesis",
  },
  {
    ownerId: "seed-5",
    title: "Workshop: Thiết kế UI/UX cho người mới bắt đầu",
    ideaDescription:
      "Chuỗi buổi thực hành thiết kế giao diện bằng Figma, từ wireframe đến prototype, dành cho sinh viên chưa có kinh nghiệm thiết kế.",
    category: "workshop",
    location: "Online",
    deadline: "2026-08-30",
    roles: [
      { name: "UI/UX Designer", requiredSkills: ["Figma", "UI/UX Design"] },
      { name: "Frontend Developer", requiredSkills: ["JavaScript", "Tailwind CSS"] },
    ],
    optionalSoftSkills: ["presentation", "brainstorming"],
    teamSize: 2,
    externalLink: "https://github.com/hoangyen/uiux-workshop",
  },
  {
    ownerId: "seed-14",
    title: "Hackathon nội bộ: App quản lý chi tiêu sinh viên",
    ideaDescription:
      "Ứng dụng theo dõi chi tiêu hàng ngày, gợi ý tiết kiệm dựa trên thói quen, xây trong 48 giờ cho cuộc thi hackathon nội bộ khoa CNTT.",
    category: "hackathon",
    location: "TP. Hồ Chí Minh",
    deadline: "2026-08-16",
    roles: [
      { name: "Backend Developer", requiredSkills: ["Node.js", "TypeScript", "GraphQL"] },
      { name: "UI/UX Designer", requiredSkills: ["Figma"] },
      { name: "Frontend Developer", requiredSkills: ["React", "TypeScript"] },
    ],
    optionalSoftSkills: ["brainstorming", "self_learning"],
    teamSize: 3,
    externalLink: "https://github.com/tuan/expense-tracker-hackathon",
  },
  {
    ownerId: "seed-17",
    title: "Dự án cá nhân: Ví blockchain đơn giản",
    ideaDescription:
      "Xây dựng một ví crypto tối giản để học cách ký giao dịch, quản lý khóa riêng tư và tương tác với smart contract trên testnet.",
    category: "personal_project",
    deadline: "2026-09-20",
    roles: [{ name: "Smart Contract Developer", requiredSkills: ["Solidity", "TypeScript"] }],
    optionalSoftSkills: ["self_learning", "critical_thinking"],
    teamSize: 2,
    externalLink: "https://github.com/xuan/simple-crypto-wallet",
  },
  {
    ownerId: "seed-22",
    title: "Startup: Nền tảng đặt phòng học nhóm theo giờ",
    ideaDescription:
      "Cho phép sinh viên đặt trước phòng học nhóm trống trong trường theo khung giờ, tránh tình trạng tranh chỗ vào mùa thi.",
    category: "startup",
    location: "Hà Nội",
    deadline: "2026-10-10",
    roles: [
      { name: "Backend Developer", requiredSkills: ["Python", "FastAPI", "PostgreSQL"] },
      { name: "Frontend Developer", requiredSkills: ["React", "TypeScript"] },
    ],
    optionalSoftSkills: ["self_learning"],
    teamSize: 2,
    externalLink: "https://github.com/giang/room-booking-platform",
  },
  {
    ownerId: "seed-24",
    title: "Hackathon: Chatbot hỗ trợ sinh viên tra cứu lịch học",
    ideaDescription:
      "Chatbot trả lời tự động các câu hỏi về lịch học, lịch thi, phòng học dựa trên dữ liệu thời khóa biểu của trường.",
    category: "hackathon",
    location: "Cần Thơ",
    deadline: "2026-08-18",
    roles: [
      { name: "Frontend Developer", requiredSkills: ["React", "Redux"] },
      { name: "Backend Developer", requiredSkills: ["Node.js", "TypeScript", "GraphQL"] },
      { name: "QA/Test Engineer", requiredSkills: ["Jest", "TypeScript"] },
    ],
    optionalSoftSkills: ["brainstorming", "critical_thinking"],
    teamSize: 3,
    externalLink: "https://github.com/dang/schedule-chatbot",
  },
  {
    ownerId: "seed-23",
    title: "Workshop: Xây dựng API với NestJS",
    ideaDescription:
      "Buổi thực hành xây dựng REST API có xác thực, phân quyền và kết nối cơ sở dữ liệu bằng NestJS cho người mới bắt đầu backend.",
    category: "workshop",
    location: "Đà Nẵng",
    deadline: "2026-09-02",
    roles: [{ name: "Backend Instructor", requiredSkills: ["Node.js", "NestJS", "PostgreSQL"] }],
    optionalSoftSkills: ["presentation", "self_learning"],
    teamSize: 2,
    externalLink: "https://github.com/nam/nestjs-api-workshop",
  },
  {
    ownerId: "seed-27",
    title: "Dự án cá nhân: Ứng dụng quản lý chi tiêu trên Android",
    ideaDescription:
      "Ứng dụng Android đơn giản để ghi lại thu chi hàng ngày, thống kê theo tuần/tháng, lưu dữ liệu cục bộ trên máy.",
    category: "personal_project",
    deadline: "2026-09-25",
    roles: [{ name: "Mobile Developer", requiredSkills: ["Java", "Kotlin"] }],
    optionalSoftSkills: ["self_learning"],
    teamSize: 2,
    externalLink: "https://github.com/long/expense-tracker-android",
  },
];

function toRoles(projectId: string, rawRoles: RawRole[]): ProjectRole[] {
  return rawRoles.map((role, index) => ({
    id: `${projectId}-r${index + 1}`,
    name: role.name,
    requiredSkills: role.requiredSkills,
  }));
}

export function seedProjects(): Project[] {
  const now = new Date().toISOString();
  return RAW_PROJECTS.map((raw, index) => {
    const id = `seed-project-${index + 1}`;
    const { roles, ...rest } = raw;
    return {
      id,
      ...rest,
      roles: toRoles(id, roles),
      followedBy: [],
      createdAt: now,
    };
  });
}
