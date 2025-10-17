import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { ShieldX, Home, User, UserCog, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export default async function UnauthorizedPage() {
  const session = await getServerSession(authOptions);
  const userRole = (session?.user as any)?.role;

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="max-w-2xl w-full space-y-6">
        {/* Header Section */}
        <div className="text-center space-y-3">
          <div className="flex justify-center">
            <div className="rounded-full bg-destructive/10 p-3">
              <ShieldX className="h-12 w-12 text-destructive" />
            </div>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Access Denied</h1>
          <p className="text-muted-foreground">
            You don't have permission to access this page.
          </p>
          {userRole && (
            <div className="flex items-center justify-center gap-2">
              <span className="text-sm text-muted-foreground">Your current role:</span>
              <Badge variant="secondary" className="capitalize">
                {userRole.replace("_", " ")}
              </Badge>
            </div>
          )}
        </div>

        {/* Access Levels Card */}
        <Card>
          <CardHeader>
            <CardTitle>Access Levels</CardTitle>
            <CardDescription>
              Each role has access to their own portal only
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
              <User className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div className="flex-1">
                <p className="font-medium text-sm">Teacher</p>
                <p className="text-sm text-muted-foreground">
                  Teacher Dashboard Only
                </p>
              </div>
            </div>

            <Separator />

            <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
              <UserCog className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div className="flex-1">
                <p className="font-medium text-sm">Admin</p>
                <p className="text-sm text-muted-foreground">
                  Admin Dashboard Only
                </p>
              </div>
            </div>

            <Separator />

            <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
              <Crown className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div className="flex-1">
                <p className="font-medium text-sm">Super Admin</p>
                <p className="text-sm text-muted-foreground">
                  Super Admin Dashboard Only
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row justify-center gap-3">
          <Button asChild variant="default">
            <Link href="/">
              <Home className="mr-2 h-4 w-4" />
              Go back home
            </Link>
          </Button>

          {userRole === "teacher" && (
            <Button asChild variant="outline">
              <Link href="/teacher">
                <User className="mr-2 h-4 w-4" />
                Go to Teacher Dashboard
              </Link>
            </Button>
          )}

          {userRole === "admin" && (
            <Button asChild variant="outline">
              <Link href="/admin">
                <UserCog className="mr-2 h-4 w-4" />
                Go to Admin Dashboard
              </Link>
            </Button>
          )}

          {userRole === "super_admin" && (
            <Button asChild variant="outline">
              <Link href="/super_admin">
                <Crown className="mr-2 h-4 w-4" />
                Go to Super Admin Dashboard
              </Link>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
