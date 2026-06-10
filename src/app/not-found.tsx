import Link from "next/link";
import Image from "next/image";
import { Home, Search } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 text-center">
      {/* Logo / Wordmark */}
      <Link href="/" className="mb-8">
        <div className="relative h-[48px] w-[180px] sm:h-[56px] sm:w-[220px]">
          <Image
            src="/LOGO.png"
            alt="HireCar Marketplace"
            fill
            priority
            className="object-contain"
          />
        </div>
      </Link>

      {/* 404 Indicator */}
      <p className="text-7xl font-black tracking-tight text-primary sm:text-8xl">
        404
      </p>

      {/* Message */}
      <h1 className="mt-4 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
        Page not found
      </h1>
      <p className="mt-2 max-w-md text-base text-muted-foreground">
        Sorry, the page you&apos;re looking for doesn&apos;t exist or has been
        moved.
      </p>

      {/* Navigation Links */}
      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:gap-4">
        <Link
          href="/"
          className={cn(
            buttonVariants({ variant: "default", size: "cta" }),
            "gap-2"
          )}
        >
          <Home className="size-4" />
          Back to Home
        </Link>
        <Link
          href="/search"
          className={cn(
            buttonVariants({ variant: "outline", size: "cta" }),
            "gap-2"
          )}
        >
          <Search className="size-4" />
          Search Vehicles
        </Link>
      </div>
    </div>
  );
}
