import Link from "next/link";
import { auth } from "@/lib/auth";
import { Button } from "@/components/ui/button";

export async function Header() {
  const session = await auth();

  return (
    <header className="sticky top-0 z-50 bg-white border-b shadow-sm">
      <div className="container mx-auto px-4 py-4">
        <nav className="flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-blue-600">
            RealState
          </Link>
          <div className="flex items-center gap-4">
            {session?.user ? (
              <>
                <span className="text-gray-600 text-sm">
                  {session.user.email}
                </span>
                <Link href="/dashboard">
                  <Button variant="ghost" size="sm">
                    Dashboard
                  </Button>
                </Link>
                <form action="/api/auth/signout" method="POST">
                  <Button variant="outline" size="sm" type="submit">
                    Cerrar Sesión
                  </Button>
                </form>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost">Iniciar Sesión</Button>
                </Link>
                <Link href="/register">
                  <Button>Registrarse</Button>
                </Link>
              </>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}
