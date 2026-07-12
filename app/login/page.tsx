import Image from "next/image";
import LoginForm from "./LoginForm";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6">
      <div className="mb-8 text-center">
        <Image
          src="/logo.png"
          alt="ScrapYard"
          width={140}
          height={140}
          className="mx-auto mb-3 rounded-2xl"
          priority
        />
        <h1 className="text-2xl font-extrabold text-slate-50">ScrapYard</h1>
        <p className="text-sm text-slate-400">Smart Scrap Management - Owner Login</p>
      </div>
      <LoginForm />
    </main>
  );
}
