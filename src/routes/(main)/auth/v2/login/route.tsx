import { useEffect, useMemo, useState } from "react";

import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  Eye,
  EyeOff,
  Globe,
  Landmark,
  LockKeyhole,
  Mail,
  ShieldCheck,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { APP_CONFIG } from "@/config/app-config";
import {
  DEMO_USERS,
  USER_ROLES,
  useAuth,
  type UserRole,
} from "@/stores/auth/auth-provider";
import { cn } from "cn";

import { LoginGlobe } from "../../-components/login-globe";

export const Route = createFileRoute("/(main)/auth/v2/login")({
  component: LoginV2,
});

function LoginV2() {
  const navigate = useNavigate();
  const { user, isHydrated, login } = useAuth();
  const [selectedRole, setSelectedRole] = useState<UserRole>("Brand Admin");
  const [email, setEmail] = useState("admin@ipaycash.demo");
  const [password, setPassword] = useState("demo123");
  const [showPassword, setShowPassword] = useState(false);

  const selectedUser = useMemo(
    () => DEMO_USERS.find((candidate) => candidate.role === selectedRole) ?? DEMO_USERS[0],
    [selectedRole],
  );

  useEffect(() => {
    if (isHydrated && user) {
      navigate({ to: "/dashboard/" });
    }
  }, [isHydrated, user, navigate]);

  useEffect(() => {
    if (selectedUser) {
      setEmail(selectedUser.email);
    }
  }, [selectedUser]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    login(selectedRole);
    navigate({ to: "/dashboard/" });
  };

  return (
    <div className="flex min-h-svh bg-background">
      <div className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-zinc-950 lg:flex">
        <div className="relative z-20 flex items-center gap-2.5 p-8">
          <div className="flex size-8 items-center justify-center rounded-lg bg-white text-black">
            <Landmark className="size-4" />
          </div>
          <span className="text-sm font-semibold text-white">{APP_CONFIG.name}</span>
        </div>

        <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
          <LoginGlobe />
        </div>

        <div className="relative z-20 mt-auto p-8">
          <div className="rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
            <blockquote className="text-sm leading-relaxed text-white/80">
              &ldquo;The best time to start investing was yesterday. The second best time is now.&rdquo;
            </blockquote>
            <p className="mt-3 text-xs text-white/50">&mdash; Financial Wisdom</p>
          </div>
        </div>
      </div>

      <div className="flex flex-1 items-center justify-center bg-background px-6 py-12">
        <div className="w-full max-w-sm">
          <div className="mb-8 flex flex-col items-center lg:hidden">
            <div className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <Landmark className="size-5" />
            </div>
            <span className="mt-3 text-sm font-semibold">{APP_CONFIG.name}</span>
          </div>

          <div className="text-center">
            <h1 className="text-2xl font-semibold tracking-tight">Welcome back</h1>
            <p className="mt-1.5 text-sm text-muted-foreground">Sign in to your account</p>
          </div>

          <div className="mt-8 grid grid-cols-2 gap-3">
            <Button type="button" variant="outline" size="lg" className="gap-2">
              <span className="flex size-4 items-center justify-center text-sm font-bold">G</span>
              <span>Google</span>
            </Button>
            <Button type="button" variant="outline" size="lg" className="gap-2">
              <span className="text-base leading-none" aria-hidden="true">
                
              </span>
              <span>Apple</span>
            </Button>
          </div>

          <div className="relative my-6 flex items-center">
            <div className="flex-1 border-t border-border" />
            <span className="mx-3 text-xs text-muted-foreground">or continue with</span>
            <div className="flex-1 border-t border-border" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="login-email" className="mb-1.5 block text-sm font-medium">
                Email
              </label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="login-email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="name@example.com"
                  autoComplete="email"
                  required
                  className="h-9 pl-9"
                />
              </div>
            </div>

            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <label htmlFor="login-password" className="text-sm font-medium">
                  Password
                </label>
                <Link
                  to="/auth/v2/login"
                  className="text-xs text-muted-foreground transition-colors hover:text-foreground"
                  onClick={(event) => event.preventDefault()}
                >
                  Forgot password?
                </Link>
              </div>

              <div className="relative">
                <LockKeyhole className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  required
                  className="h-9 pl-9 pr-10"
                />
                <button
                  type="button"
                  className="absolute right-2 top-1/2 flex size-7 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
                  onClick={() => setShowPassword((current) => !current)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
                </button>
              </div>
            </div>

            <div className="space-y-1.5 pt-1">
              <label htmlFor="demo-role" className="block text-sm font-medium">
                Demo role
              </label>
              <Select
                value={selectedRole}
                onValueChange={(value) => setSelectedRole(value as UserRole)}
              >
                <SelectTrigger id="demo-role" className="h-9 w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {USER_ROLES.map((role) => (
                    <SelectItem key={role} value={role}>
                      <span className="flex items-center gap-2">
                        {role}
                        {role === "SaaS Owner" ? (
                          <span className="text-xs text-muted-foreground">Platform</span>
                        ) : role === "Brand Admin" ? (
                          <span className="text-xs text-muted-foreground">Brand</span>
                        ) : role === "Supervisor" ? (
                          <span className="text-xs text-muted-foreground">Operations</span>
                        ) : role === "Agent" ? (
                          <span className="text-xs text-muted-foreground">Queue</span>
                        ) : (
                          <span className="text-xs text-muted-foreground">Support</span>
                        )}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Demo login will use <span className="font-medium text-foreground">{selectedUser?.email}</span>.
              </p>
            </div>

            <Button type="submit" size="lg" className="h-9 w-full">
              Sign in
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Don&apos;t have an account?{" "}
            <Link
              to="/auth/v2/register"
              className="font-medium text-foreground underline-offset-4 transition-colors hover:underline"
            >
              Sign up
            </Link>
          </p>

          <div className="mt-8 flex items-center justify-center gap-1.5 text-xs text-muted-foreground/60">
            <ShieldCheck className="size-3.5" />
            <span>256-bit SSL encrypted</span>
          </div>

          <div className="mt-8 flex justify-center gap-1 text-xs text-muted-foreground">
            <Globe className="size-3.5" />
            <span>ENG · {APP_CONFIG.copyright}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
