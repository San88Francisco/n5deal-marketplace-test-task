"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";

const contactSchema = z.object({
  email: z.string().email("Вкажіть коректну email-адресу"),
});

type ContactForm = z.infer<typeof contactSchema>;

export default function Home() {
  const form = useForm<ContactForm>({
    resolver: zodResolver(contactSchema),
    defaultValues: { email: "" },
  });

  return (
    <main className="mx-auto flex min-h-screen max-w-3xl items-center px-6 py-16">
      <section className="w-full border-l-4 border-teal-700 pl-8">
        <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-teal-700">N5Deal</p>
        <h1 className="text-4xl font-semibold leading-tight">Проєкт готовий до розробки</h1>
        <p className="mt-4 max-w-xl text-lg leading-8 text-slate-600">
          Next.js frontend підключається до NestJS API. Залиште email, щоб перевірити форму з React Hook Form та Zod.
        </p>
        <form className="mt-8 flex max-w-md gap-3" onSubmit={form.handleSubmit(() => form.reset())}>
          <label className="sr-only" htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            placeholder="name@example.com"
            className="min-w-0 flex-1 rounded-md border bg-white px-3 py-2 outline-none ring-teal-700 focus:ring-2"
            {...form.register("email")}
          />
          <Button type="submit">Надіслати</Button>
        </form>
        {form.formState.errors.email && <p className="mt-2 text-sm text-red-700">{form.formState.errors.email.message}</p>}
      </section>
    </main>
  );
}