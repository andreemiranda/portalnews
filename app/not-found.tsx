import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f1f3f6] dark:bg-[#121316] text-slate-900 dark:text-zinc-100 p-4">
      <div className="text-center max-w-md p-8 bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-sm">
        <h2 className="text-2xl font-black mb-2">404 - Página não encontrada</h2>
        <p className="text-sm text-slate-500 dark:text-zinc-400 mb-6">
          A página ou notícia que você está procurando não foi encontrada.
        </p>
        <Link
          href="/"
          className="px-5 py-2.5 bg-red-600 text-white font-bold text-xs rounded-full hover:bg-red-700 transition"
        >
          Voltar ao Início
        </Link>
      </div>
    </div>
  );
}
