"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { Truck } from "lucide-react";

const IndexSkeleton = () => {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <header className="container mx-auto px-4 py-3 sm:py-4 border-b border-gray-100 dark:border-gray-800">
        <nav className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-1.5 rounded-lg">
              <Truck className="h-5 w-5 text-white opacity-50" />
            </div>
            <Skeleton className="h-7 w-32 rounded" />
          </div>
          <div className="flex gap-2 sm:gap-3">
            <Skeleton className="h-9 w-20 rounded-lg" />
            <Skeleton className="h-9 w-28 rounded-lg" />
          </div>
        </nav>
      </header>

      <main>
        <section className="container mx-auto px-4 py-16 sm:py-20 md:py-28 text-center">
          <Skeleton className="h-10 w-48 mx-auto mb-6 rounded-full" />
          <Skeleton className="h-12 sm:h-16 md:h-20 w-full max-w-4xl mx-auto mb-4 rounded" />
          <Skeleton className="h-10 w-3/4 max-w-3xl mx-auto mb-8 rounded" />
          <Skeleton className="h-6 w-2/3 max-w-2xl mx-auto mb-10 rounded" />
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Skeleton className="h-14 w-56 rounded-xl" />
            <Skeleton className="h-14 w-56 rounded-xl" />
          </div>
        </section>

        <section className="bg-gradient-to-r from-orange-600 to-orange-500 py-10 sm:py-14">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-12 text-center">
              {[1, 2, 3, 4].map((i) => (
                <div key={i}>
                  <Skeleton className="h-10 w-24 mx-auto mb-2 rounded bg-orange-400" />
                  <Skeleton className="h-4 w-20 mx-auto rounded bg-orange-400" />
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="container mx-auto px-4 py-16 sm:py-20">
          <Skeleton className="h-10 w-64 mx-auto mb-4 rounded" />
          <Skeleton className="h-5 w-48 mx-auto mb-12 rounded" />
          <div className="grid md:grid-cols-2 gap-8 sm:gap-12 max-w-6xl mx-auto">
            {[1, 2].map((i) => (
              <div key={i} className="bg-white dark:bg-gray-900 p-6 sm:p-10 rounded-2xl sm:rounded-3xl border border-gray-100 dark:border-gray-800">
                <div className="flex items-center mb-6 sm:mb-8">
                  <Skeleton className="h-12 w-12 sm:h-14 sm:w-14 rounded-xl mr-4" />
                  <Skeleton className="h-7 w-36 rounded" />
                </div>
                <div className="space-y-4">
                  {[1, 2, 3, 4, 5, 6].map((j) => (
                    <div key={j} className="flex items-start">
                      <Skeleton className="h-5 w-5 mr-3 rounded-full shrink-0" />
                      <Skeleton className="h-5 w-full rounded" />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="bg-gray-900 py-12 sm:py-20">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Skeleton className="h-8 w-8 rounded-lg bg-gray-800" />
            <Skeleton className="h-7 w-36 rounded bg-gray-800" />
          </div>
          <Skeleton className="h-4 w-48 mx-auto rounded bg-gray-800" />
        </div>
      </footer>
    </div>
  );
};

export default IndexSkeleton;
