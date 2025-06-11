
/**
 * Valida um número de CPF.
 * @param cpf String contendo o CPF (pode conter ou não formatação).
 * @returns True se o CPF for válido, false caso contrário.
 */
export function isValidCPF(cpf: string | undefined | null): boolean {
  if (!cpf) return false;

  cpf = cpf.replace(/[^\d]+/g, ''); // Remove caracteres não numéricos

  if (cpf.length !== 11 || /^(\d)\1+$/.test(cpf)) {
    // Verifica se tem 11 dígitos e se não são todos iguais
    return false;
  }

  let sum = 0;
  let remainder;

  for (let i = 1; i <= 9; i++) {
    sum += parseInt(cpf.substring(i - 1, i)) * (11 - i);
  }
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) {
    remainder = 0;
  }
  if (remainder !== parseInt(cpf.substring(9, 10))) {
    return false;
  }

  sum = 0;
  for (let i = 1; i <= 10; i++) {
    sum += parseInt(cpf.substring(i - 1, i)) * (12 - i);
  }
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) {
    remainder = 0;
  }
  if (remainder !== parseInt(cpf.substring(10, 11))) {
    return false;
  }

  return true;
}

/**
 * Formata um CPF para o padrão 000.000.000-00.
 * Se o CPF for inválido ou não puder ser formatado, retorna a string original.
 * @param cpf String contendo o CPF.
 * @returns CPF formatado ou a string original.
 */
export function formatCPF(cpf: string | undefined | null): string {
  if (!cpf) return "";
  const cleaned = cpf.replace(/[^\d]+/g, '');
  if (cleaned.length !== 11) return cpf; // Retorna original se não tiver 11 dígitos
  return cleaned.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
}

/**
 * Remove a formatação de um CPF (pontos e traço).
 * @param cpf String contendo o CPF formatado.
 * @returns CPF com apenas números.
 */
export function unformatCPF(cpf: string | undefined | null): string {
  if (!cpf) return "";
  return cpf.replace(/[^\d]+/g, '');
}
