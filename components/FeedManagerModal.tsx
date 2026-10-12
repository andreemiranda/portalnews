'use client';

import React from 'react';
import { FeedSource } from '@/lib/types';
import { X, Rss, CheckCircle2, ShieldCheck } from 'lucide-react';

interface FeedManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  feeds: FeedSource[];
}

export const FeedManagerModal: React.FC<FeedManagerModalProps> = ({
  isOpen,
  onClose,
  feeds,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-zinc-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Top Header */}
        <div className="p-5 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/90 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-red-100 dark:bg-red-950/80 text-red-600 dark:text-red-400 rounded-lg">
              <Rss className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                Canais e Fontes Editoriais Oficiais
              </h2>
              <p className="text-xs text-zinc-500">
                Fontes jornalísticas homologadas e transmitidas via API
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-300 dark:hover:bg-zinc-700 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          <div className="p-3.5 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 rounded-xl text-xs text-amber-900 dark:text-amber-200 flex items-center gap-2.5">
            <ShieldCheck className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
            <span>
              Os canais do Portal News são administrados de forma centralizada pelas APIs oficiais cadastradas.
            </span>
          </div>

          {/* Active Feeds List */}
          <div>
            <h3 className="text-xs font-extrabold uppercase text-zinc-500 tracking-wider mb-3">
              Canais Homologados ({feeds.length})
            </h3>
            <div className="space-y-2.5 max-h-[48vh] overflow-y-auto pr-1">
              {feeds.map((feed) => (
                <div
                  key={feed.id}
                  className="p-3.5 bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/80 rounded-xl flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <CheckCircle2 className="w-4 h-4 text-red-600 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100 truncate">
                        {feed.name}
                      </p>
                      <p className="text-[11px] text-zinc-500 truncate">
                        {feed.category} • Portal News API
                      </p>
                    </div>
                  </div>

                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300 shrink-0">
                    Ativo
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
