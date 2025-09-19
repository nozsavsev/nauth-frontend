import { Fingerprint, KeyRound, Mails, Server, ShieldCheck, Users } from "lucide-react";
import React from "react";

const Feature = ({
  icon,
  title,
  children,
  reverse = false,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
  reverse?: boolean;
}) => (
  <div className={`flex flex-col items-center gap-8 text-center md:flex-row md:gap-12 md:text-left ${reverse ? "md:flex-row-reverse" : ""}`}>
    <div className="flex h-32 w-32 flex-shrink-0 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800/50">{icon}</div>
    <div className="flex-1">
      <h3 className="mb-3 text-2xl font-bold">{title}</h3>
      <p className="text-lg leading-relaxed text-gray-600 dark:text-gray-400">{children}</p>
    </div>
  </div>
);

export default function Home() {
  return (
    <div className="min-h-screen bg-white text-gray-900 dark:bg-gray-900 dark:text-gray-100">
      <div className="container mx-auto px-4 py-16 sm:py-24">
        <header className="mb-20 text-center">
          <h1 className="mb-4 text-5xl font-extrabold tracking-tight md:text-6xl">
            Welcome to <span className="text-blue-600 dark:text-blue-500">NAUTH</span>
          </h1>
          <p className="mx-auto max-w-3xl text-lg text-gray-600 md:text-xl dark:text-gray-400">
            A modern, secure, and feature-rich authentication and authorization microservice designed to be the backbone of nozsa.com security.
          </p>
        </header>

        <main className="space-y-24">
          <Feature icon={<ShieldCheck className="h-12 w-12 text-blue-500" />} title="Core Authentication">
            Nauth provides a robust and secure authentication suite, featuring Two-Factor Authentication (2FA), seamless Google Login integration, and
            passwordless login with temporary codes. User credentials are protected using the strong Argon2id hashing algorithm.
          </Feature>

          <Feature icon={<Fingerprint className="h-12 w-12 text-green-500" />} title="Advanced Session Management" reverse>
            All sessions are validated against the database for enhanced security, with the ability to instantly revoke any session in real-time.
          </Feature>

          <Feature icon={<KeyRound className="h-12 w-12 text-yellow-500" />} title="Authorization & Permissions">
            A flexible and powerful permission system allows for fine-grained access control. Nauth offers centralized permission management and can
            authenticate other applications on the same domain, storing and managing permissions across all services.
          </Feature>

          <Feature icon={<Users className="h-12 w-12 text-purple-500" />} title="Comprehensive User Management" reverse>
            Administrators have access to a comprehensive set of tools to effectively manage users, including the ability to delete accounts, set
            passwords, and trigger critical email actions like verification and password resets.
          </Feature>

          <Feature icon={<Mails className="h-12 w-12 text-slate-700" />} title="Customizable Transactional Emails">
            Nauth includes a built-in email template system for all transactional emails. Anyone with the right permissions can customize templates
            for various actions, ensuring consistent branding and communication.
          </Feature>

          <Feature icon={<Server className="h-12 w-12 text-indigo-500" />} title="Extensible Service Integration" reverse>
            Designed for extensibility, Nauth allows authorized users (admins only) to register other applications on the domain to use nauth as an
            authentication system. These services can then register their own permissions in real-time.
          </Feature>
        </main>
      </div>
    </div>
  );
}
