import { auth0 } from "@/lib/auth0";
import Link from "next/link";
import { Button } from "./ui/button";
import { loginAction, logoutAction } from "@/lib/auth/actions";

export async function Nav() {
  const session = await auth0.getSession();
  const user = session?.user;

  return (
    <nav className="border-b bg-card">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-6">
          <span className="text-lg font-semibold">LiftIt</span>
        </div>

        <div className="flex items-center gap-4">
          {user ? (
            <>
              <Link href="/dashboard" className="text-sm text-muted-foreground transition hover:text-foreground">
                Dashboard
              </Link>
              <span className="text-sm text-muted-foreground">
                {user.name || user.email}
              </span>
              <form action={logoutAction}>
                <Button variant="outline" size="sm" type="submit">
                  Log out
                </Button>
              </form>
            </>
          ) : (
            <form action={loginAction}>
              <Button size="sm" type="submit">
                Log in
              </Button>
            </form>
          )}
        </div>
      </div>
    </nav>
  );
}
