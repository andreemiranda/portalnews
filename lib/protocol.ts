/**
 * Gerador de Protocolo de Atendimento do Portal News
 * 
 * Regras:
 * - Exatamente 13 dígitos numéricos
 * - Não contém o dígito zero ('0')
 * - Poucos dígitos repetidos (sem dígitos adjacentes iguais e distribuição balanceada)
 */

export function generateContactProtocol(): string {
  const allowedDigits = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];
  const length = 13;
  const result: string[] = [];

  // Contagem de frequência de cada dígito para garantir poucos dígitos repetidos
  const usageCount: Record<string, number> = {
    '1': 0, '2': 0, '3': 0, '4': 0, '5': 0,
    '6': 0, '7': 0, '8': 0, '9': 0,
  };

  for (let i = 0; i < length; i++) {
    const previousDigit = result[i - 1] || '';

    // Filtra opções: não pode ser igual ao dígito anterior e prioriza os menos usados
    const candidates = allowedDigits.filter((d) => d !== previousDigit);

    // Ordena priorizando dígitos com menor contagem de repetição
    candidates.sort((a, b) => {
      const diff = usageCount[a] - usageCount[b];
      if (diff !== 0) return diff;
      return Math.random() - 0.5;
    });

    // Seleciona entre os melhores candidatos com menor repetição
    const pool = candidates.slice(0, 3);
    const chosen = pool[Math.floor(Math.random() * pool.length)];

    result.push(chosen);
    usageCount[chosen] = (usageCount[chosen] || 0) + 1;
  }

  return result.join('');
}

/**
 * Formata o protocolo de 13 dígitos para visualização agradável (ex: 7492-8315-62841)
 */
export function formatProtocolNumber(protocol: string): string {
  const clean = protocol.replace(/\D/g, '');
  if (clean.length === 13) {
    return `${clean.slice(0, 4)}-${clean.slice(4, 8)}-${clean.slice(8)}`;
  }
  return protocol;
}
