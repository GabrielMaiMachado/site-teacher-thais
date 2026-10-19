// Rode com: npm test
import { test } from "node:test";
import assert from "node:assert/strict";

import {
  contarPalavras,
  embaralharIndices,
  formatarTempo,
  gerarCodigo,
  mascararWhatsapp,
  nivelEscuta,
  nivelEstimado,
  nivelGramatica,
  whatsappValido,
} from "./pontuacao.ts";

test("nível de gramática é o último bloco aprovado em sequência", () => {
  assert.equal(nivelGramatica([]), -1);
  assert.equal(nivelGramatica([2]), -1);
  assert.equal(nivelGramatica([3]), 0);
  assert.equal(nivelGramatica([5, 4, 2]), 1);
  assert.equal(nivelGramatica([5, 5, 5, 5, 5]), 4);
  // um bloco reprovado interrompe a sequência
  assert.equal(nivelGramatica([5, 1, 5]), 0);
});

test("nível de escuta é o maior nível com todas as perguntas certas", () => {
  assert.equal(nivelEscuta([]), 0);
  assert.equal(
    nivelEscuta([
      { nivel: 1, acertos: 2, total: 2 },
      { nivel: 2, acertos: 1, total: 2 },
      { nivel: 3, acertos: 2, total: 2 },
      { nivel: 4, acertos: 0, total: 2 },
    ]),
    3,
  );
  assert.equal(nivelEscuta([{ nivel: 1, acertos: 1, total: 2 }]), 0);
});

test("nível estimado = round(gram × 0,6 + escuta × 0,4) entre A1 e C1", () => {
  assert.equal(nivelEstimado(-1, 0), 0);
  assert.equal(nivelEstimado(-1, 1), 0);
  assert.equal(nivelEstimado(2, 2), 2);
  assert.equal(nivelEstimado(3, 1), 2); // 1,8 + 0,4 = 2,2
  assert.equal(nivelEstimado(4, 2), 3); // 2,4 + 0,8 = 3,2
  assert.equal(nivelEstimado(4, 4), 4);
  assert.equal(nivelEstimado(1, 4), 2); // 0,6 + 1,6 = 2,2
});

test("código do teste segue NIV-AAAAMMDD-XXXX sem caracteres ambíguos", () => {
  const codigo = gerarCodigo(new Date(2026, 9, 19));
  assert.match(codigo, /^NIV-20261019-[A-HJ-NP-Z2-9]{4}$/);
  assert.equal(gerarCodigo(new Date(2026, 0, 5), () => 0), "NIV-20260105-AAAA");
});

test("WhatsApp: máscara e validação", () => {
  assert.equal(mascararWhatsapp("55991359494"), "(55) 99135-9494");
  assert.equal(mascararWhatsapp("5532221234"), "(55) 3222-1234");
  assert.equal(mascararWhatsapp("559"), "(55) 9");
  assert.equal(whatsappValido("(55) 99135-9494"), true);
  assert.equal(whatsappValido("(55) 3222-1234"), true);
  assert.equal(whatsappValido("9913-5949"), false);
});

test("utilitários", () => {
  assert.equal(contarPalavras("  I like   coffee. "), 3);
  assert.equal(contarPalavras(""), 0);
  assert.equal(formatarTempo(720), "12:00");
  assert.equal(formatarTempo(65), "01:05");
  assert.equal(formatarTempo(-3), "00:00");
  assert.deepEqual([...embaralharIndices(4)].sort(), [0, 1, 2, 3]);
});
