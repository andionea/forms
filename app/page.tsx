import { TeacherForm } from "@/components/form/TeacherForm";

export default function Home() {
  return (
    <main className="min-height-screen bg-slate-50 py-12 px-4">
      <div className="max-w-5xl mx-auto mb-8 text-center">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
          Platformă Înregistrare Activitate Academică
        </h1>
        <p className="mt-2 text-lg text-slate-600">
          Completați cursurile, publicațiile și activitățile remediale din ultimii 5 ani.
        </p>
      </div>
      <TeacherForm />
    </main>
  );
}