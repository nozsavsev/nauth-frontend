import { Button } from "@/components/ui/button";

export default function Er_404() {
  return (
    <div className="flex h-screen w-full flex-col items-center justify-center text-gray-900">
      <div className="text-primary dark:text-primary-foreground text-7xl font-bold">404</div>
      <h1 className="mt-4 text-3xl font-semibold">Page Not Found</h1>
      <p className="mt-2 text-lg text-gray-600 dark:text-gray-400">The page you are looking for does not exist.</p>
      <Button asChild className="mt-6">
        <a href="/">Go home</a>
      </Button>
    </div>
  );
}
