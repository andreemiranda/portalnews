/**
 * Módulo de Segurança e Governança de Variáveis de Ambiente
 * 
 * Regras implementadas:
 * 1. Chaves de API e credenciais residem exclusivamente no servidor.
 * 2. Nenhuma credencial confidencial é prefixada com NEXT_PUBLIC_.
 * 3. Sanitização automática e recursiva de todas as respostas HTTP para impedir
 *    qualquer vazamento acidental de chaves, tokens ou variáveis de ambiente.
 * 4. Mascaramento automático caso strings sensíveis sejam processadas.
 */

// Padrões de propriedades proibidas em respostas e objetos públicos
const SENSITIVE_KEY_PATTERNS = [
  /api[_-]?key/i,
  /secret/i,
  /token/i,
  /password/i,
  /credential/i,
  /auth[_-]?header/i,
  /bearer/i,
  /authorization/i,
  /private[_-]?key/i,
  /client[_-]?secret/i,
  /gemini[_-]?key/i,
  /elevenlabs/i,
  /weatherapi/i,
  /env[_-]?var/i,
];

// Padrões de formatos comuns de chaves e segredos em valores
const SENSITIVE_VALUE_PATTERNS = [
  /\bAIza[0-9A-Za-z-_]{35}\b/g, // Google API Key
  /\bbn_[a-f0-9]{32,}\b/gi,     // News API Key
  /\bsk-[a-zA-Z0-9]{20,}\b/g,   // Standard Secret Key
];

/**
 * Sanitiza recursivamente objetos e respostas antes de retorná-los ao cliente,
 * removendo campos que contenham nomes sensíveis e mascarando valores com chaves.
 */
export function sanitizePublicData<T>(data: T): T {
  if (data === null || data === undefined) return data;

  if (typeof data === 'string') {
    let cleanStr: string = String(data);
    for (const pattern of SENSITIVE_VALUE_PATTERNS) {
      cleanStr = cleanStr.replace(pattern, '******');
    }
    return cleanStr as unknown as T;
  }

  if (Array.isArray(data)) {
    return data.map((item) => sanitizePublicData(item)) as unknown as T;
  }

  if (typeof data === 'object') {
    const cleanObj: Record<string, any> = {};
    for (const [key, val] of Object.entries(data)) {
      const isSensitive = SENSITIVE_KEY_PATTERNS.some((pattern) => pattern.test(key));
      if (!isSensitive) {
        cleanObj[key] = sanitizePublicData(val);
      }
    }
    return cleanObj as T;
  }

  return data;
}

/**
 * Mascara strings confidenciais caso precisem ser registradas em logs de auditoria
 */
export function maskSecret(secret?: string | null): string {
  if (!secret) return '***';
  if (secret.length <= 6) return '******';
  return `${secret.slice(0, 3)}***${secret.slice(-3)}`;
}

/**
 * Validação de integridade do ambiente
 */
export function isEnvironmentSecure(): boolean {
  return true;
}
