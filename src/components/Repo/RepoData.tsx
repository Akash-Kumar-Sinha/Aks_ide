interface RepoDataProps {
  label: string;
  title: string;
  description: string;
  refLink: string;
}

const RepoData: RepoDataProps[] = [
  {
    label: "JavaScript",
    title: "JavaScript",
    description:
      "JavaScript is a lightweight, interpreted, or just-in-time compiled programming language. While it is most well-known as the scripting language for Web pages.",
    refLink: "https://developer.mozilla.org/en-US/docs/Web/JavaScript",
  },
  {
    label: "React",
    title: "React",
    description:
      "React declarative, efficient, and flexible JavaScript library for building user interfaces.",
    refLink: "https://reactjs.org/",
  },
  {
    label: "Next.js",
    title: "Nextjs",
    description:
      "Next.js is a React framework that enables functionality such as server-side rendering and generating static websites for React-based web applications.",
    refLink: "https://nextjs.org/",
  },
  {
    label: "TypeScript",
    title: "TypeScript",
    description:
      "TypeScript is an open-source language which builds on JavaScript, one of the world's most used tools, by adding static type definitions.",
    refLink: "https://www.typescriptlang.org/",
  },
  {
    label: "Rust",
    title: "Rust",
    description:
      "Rust is a systems programming language that runs blazingly fast, prevents segfaults, and guarantees thread safety.",
    refLink: "https://www.rust-lang.org/",
  },
  {
    label: "Rust-Cargo",
    title: "Cargo crates",
    description:
      "Cargo is the Rust package manager that manages dependencies, compiles projects, creates distributable packages, and uploads them to crates.io, the Rust community's registry.",
    refLink: "https://doc.rust-lang.org/cargo/",
  },
];

export default RepoData;
