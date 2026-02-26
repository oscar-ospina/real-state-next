import Link from "next/link";
import { auth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { SignOutButton } from "./SignOutButton";
import { ThemeToggle } from "./ThemeToggle";

export async function Header() {
  const session = await auth();

  return (
    <header className="sticky top-0 z-50 bg-background border-b shadow-sm">
      <div className="container mx-auto px-4 py-4">
        <nav className="flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/" className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              RealState
            </Link>
            <Link href="/about" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Quiénes Somos
            </Link>
          </div>
          <div className="flex items-center gap-4">
            {session?.user ? (
              <>
                <span className="text-muted-foreground text-sm">
                  {session.user.email}
                </span>
                <Link href="/dashboard">
                  <Button variant="ghost" size="sm">
                    Dashboard
                  </Button>
                </Link>
                {session.user.roles?.includes("admin") && (
                  <Link href="/admin/properties">
                    <Button variant="ghost" size="sm" className="text-amber-600 hover:text-amber-700">
                      Admin
                    </Button>
                  </Link>
                )}
                <ThemeToggle />
                <SignOutButton />
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost">Iniciar Sesión</Button>
                </Link>
                <Link href="/register">
                  <Button>Registrarse</Button>
                </Link>
                <ThemeToggle />
              </>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}
