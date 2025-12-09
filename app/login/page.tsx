"use client";

import { signIn, useSession } from "next-auth/react";
import { useState, FormEvent, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import Image from "next/image";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";
  const { data: session, status } = useSession();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (status === "authenticated" && session?.user) {
      const userRole = (session.user as any)?.role;
      
      if (userRole === "teacher") {
        router.push("/teacher");
      } else if (userRole === "admin" || "super_admin") {
        router.push("/admin");
      } else {
        router.push("/");
      }
    }
  }, [status, session, router]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
        callbackUrl,
      });

      if (result?.error) {
        setError(result.error);
        setIsLoading(false);
      } else if (result?.ok) {
        // Get the session to check user role and redirect accordingly
        const response = await fetch("/api/auth/session");
        const session = await response.json();

        if (session?.user?.role === "teacher") {
          router.push("/teacher");
        } else if (session?.user?.role === "admin" || "super_admin") {
          router.push("/admin");
        }
      }
    } catch (err) {
      setError("An unexpected error occurred");
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8")}>
      <div className="max-w-md w-full">
        <Card>
          <CardHeader className="text-center">
            <Image src="/logo.jpg" alt="The Bridge School Logo" width={100} height={100} className="mx-auto mb-2" />
            <CardTitle className="text-xl">Welcome to The Bridge School Portal</CardTitle>
            <CardDescription>Login with your credentials</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit}>
              <FieldGroup>

                <Field>
                  <FieldLabel htmlFor="email">Email</FieldLabel>
                  <Input
                    id="email"
                    type="email"
                    placeholder="m@example.com"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isLoading}
                  />
                </Field>

                <Field>
                  <div className="flex items-center">
                    <FieldLabel htmlFor="password">Password</FieldLabel>
                    <a href="#" className="ml-auto text-sm underline-offset-4 hover:underline">
                      Forgot your password?
                    </a>
                  </div>
                  <Input
                    id="password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                  />
                </Field>

                {error && (
                  <div className="rounded-md bg-red-50 p-4">
                    <div className="flex">
                      <div className="ml-0">
                        <h3 className="text-sm font-medium text-red-800">{error}</h3>
                      </div>
                    </div>
                  </div>
                )}

                <Field>
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? "Signing in..." : "Login"}
                  </Button>

                </Field>
              </FieldGroup>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
