import { auth0 } from "@/lib/auth0";
import Link from "next/link";
import { Button } from "./ui/button";
import { loginAction, logoutAction } from "@/lib/auth/actions";
import {
  AppNav,
  AppNavBrand,
  AppNavContainer,
  AppNavUserText,
  appNavUserLinkClass,
} from "./ui/nav-primitives";

export async function Nav() {
  const session = await auth0.getSession();
  const user = session?.user;

  return (
    <AppNav>
      <AppNavContainer>
        <div className="flex items-center gap-6">
          <AppNavBrand>LiftIt</AppNavBrand>
        </div>

        <div className="flex items-center gap-4">
          {user ? (
            <>
              <Link href="/dashboard" className={appNavUserLinkClass}>
                Dashboard
              </Link>
              <Link href="/profile" className={appNavUserLinkClass}>
                Profile
              </Link>
              <Link href="/weight" className={appNavUserLinkClass}>
                Body Weight
              </Link>
              <AppNavUserText>{user.name || user.email}</AppNavUserText>
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
      </AppNavContainer>
    </AppNav>
  );
}
