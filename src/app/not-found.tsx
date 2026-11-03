import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-[80svh] flex-col items-center justify-center px-5 pt-(--header-h) text-center">
      <p className="label">Erro 404</p>
      <h1 className="font-display text-metal mt-6 text-[clamp(4rem,14vw,10rem)] leading-none font-extrabold">404</h1>
      <p className="mt-6 max-w-md text-paper/60">Esta página saiu da estrada. A viatura pode já ter sido vendida.</p>
      <Link href="/#stand" className="btn btn-primary mt-10">
        Voltar ao stand
      </Link>
    </div>
  );
}
