"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import toast from "react-hot-toast";

export function RegisterForm() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { register, isLoading } = useAuthStore();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await register(username, password, email || undefined);
      router.push("/chat");
    } catch {
      toast.error("Registration failed. Username may already be taken.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full">
      <Input
        label="Username"
        type="text"
        placeholder="Choose a username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        required
        autoFocus
      />
      <Input
        label="Email (optional)"
        type="email"
        placeholder="your@email.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <Input
        label="Password"
        type="password"
        placeholder="Choose a password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />
      <Button type="submit" loading={isLoading} size="lg" className="w-full mt-2">
        Create account
      </Button>
    </form>
  );
}
