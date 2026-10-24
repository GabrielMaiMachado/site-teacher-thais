// Rode com: npm test
import { test } from "node:test";
import assert from "node:assert/strict";

import {
  diferencaParaBrasilia,
  interpretarTelefone,
  mascararNumero,
  numeroInternacional,
  rotuloPais,
  tamanhoDoDdi,
  textoDiferencaDeFuso,
  validarTelefone,
} from "./paises.ts";

test("Brasil: máscara (11) 99999-9999, 10 ou 11 dígitos", () => {
  assert.equal(mascararNumero("BR", "55991359494"), "(55) 99135-9494");
  assert.equal(validarTelefone("BR", "(55) 99135-9494"), null);
  assert.equal(validarTelefone("BR", "(55) 3222-1234"), null);
  assert.equal(numeroInternacional("BR", "(55) 99135-9494"), "5555991359494");
  assert.match(validarTelefone("BR", "(55) 9913")!, /Brasil.*10 ou 11 dígitos.*\(11\) 99999-9999/);
});

test("Portugal: 9 dígitos começando com 9, máscara 912 345 678", () => {
  assert.equal(mascararNumero("PT", "912345678"), "912 345 678");
  assert.equal(mascararNumero("PT", "9123456789"), "912 345 678");
  assert.equal(validarTelefone("PT", "912 345 678"), null);
  assert.equal(numeroInternacional("PT", "912 345 678"), "351912345678");
  assert.equal(
    validarTelefone("PT", "212 345 678"),
    "Número de Portugal deve ter 9 dígitos, começando com 9, como 912 345 678.",
  );
  assert.match(validarTelefone("PT", "912 345")!, /Portugal deve ter 9 dígitos/);
});

test("EUA e demais países: só dígitos, 8 a 15 contando o código", () => {
  assert.equal(mascararNumero("US", "(415) 555-0123"), "4155550123");
  assert.equal(validarTelefone("US", "4155550123"), null);
  assert.equal(numeroInternacional("US", "4155550123"), "14155550123");
  assert.match(validarTelefone("US", "41555")!, /dos Estados Unidos.*8 a 15 dígitos.*\+1/);
  assert.match(validarTelefone("GB", "7911")!, /do Reino Unido/);
  assert.equal(validarTelefone("JP", "9012345678"), null);
});

test("Outro país: exige o código e valida o tamanho total", () => {
  assert.equal(validarTelefone("outro", "791234567", ""), "Informe o código do país, como +41.");
  assert.equal(validarTelefone("outro", "791234567", "+41"), null);
  assert.equal(numeroInternacional("outro", "79 123 45 67", "41"), "41791234567");
  assert.equal(rotuloPais("outro", "41"), "Outro (+41)");
  assert.match(validarTelefone("outro", "12", "41")!, /\+41.*8 a 15 dígitos/);
  assert.match(validarTelefone("outro", "1234567890123456", "41")!, /8 a 15/);
});

test("número colado com o código do país troca o país", () => {
  assert.deepEqual(interpretarTelefone("+351 912 345 678", "BR"), { pais: "PT", ddi: "351", numero: "912345678" });
  assert.deepEqual(interpretarTelefone("351912345678", "BR"), { pais: "PT", ddi: "351", numero: "912345678" });
  assert.deepEqual(interpretarTelefone("00351 912345678", "BR"), { pais: "PT", ddi: "351", numero: "912345678" });
  assert.deepEqual(interpretarTelefone("+55 55 99135-9494", "PT"), { pais: "BR", ddi: "55", numero: "55991359494" });
  assert.deepEqual(interpretarTelefone("5555991359494", "BR"), { pais: "BR", ddi: "55", numero: "55991359494" });
  assert.deepEqual(interpretarTelefone("+1 415 555 0123", "BR"), { pais: "US", ddi: "1", numero: "4155550123" });
  // +1 com o Canadá já escolhido continua Canadá
  assert.equal(interpretarTelefone("+1 416 555 0123", "CA")?.pais, "CA");
  assert.deepEqual(interpretarTelefone("+41 79 123 45 67", "BR"), { pais: "outro", ddi: "41", numero: "791234567" });
  assert.deepEqual(interpretarTelefone("14155550123", "US"), { pais: "US", ddi: "1", numero: "4155550123" });
  // número local comum não muda nada
  assert.equal(interpretarTelefone("(55) 99135-9494", "BR"), null);
  assert.equal(interpretarTelefone("912 345 678", "PT"), null);
  assert.equal(interpretarTelefone("415 555 0123", "US"), null);
});

test("tamanho do código do país (E.164)", () => {
  assert.equal(tamanhoDoDdi("14155550123"), 1);
  assert.equal(tamanhoDoDdi("5511999999999"), 2);
  assert.equal(tamanhoDoDdi("351912345678"), 3);
  assert.equal(tamanhoDoDdi("41791234567"), 2);
  assert.equal(tamanhoDoDdi("353851234567"), 3);
});

test("diferença de fuso respeita o horário de verão", () => {
  // Portugal: +3h no inverno europeu (WET), +4h no verão europeu (WEST)
  assert.equal(diferencaParaBrasilia("Europe/Lisbon", new Date("2026-01-15T12:00:00Z")), 180);
  assert.equal(diferencaParaBrasilia("Europe/Lisbon", new Date("2026-07-15T12:00:00Z")), 240);
  assert.equal(
    textoDiferencaDeFuso("PT", "America/Sao_Paulo", new Date("2026-07-15T12:00:00Z")),
    "Em Portugal, são 4 horas a mais neste período.",
  );
  assert.equal(
    textoDiferencaDeFuso("US", "America/Los_Angeles", new Date("2026-07-15T12:00:00Z")),
    "No seu fuso, são 4 horas a menos neste período.",
  );
  assert.equal(
    textoDiferencaDeFuso("US", "America/Sao_Paulo", new Date("2026-01-15T12:00:00Z")),
    "Em Nova York, são 2 horas a menos neste período.",
  );
  assert.equal(
    textoDiferencaDeFuso("AR", "", new Date("2026-01-15T12:00:00Z")),
    "Na Argentina, o horário é o mesmo de Brasília neste período.",
  );
  assert.equal(textoDiferencaDeFuso("BR", "Europe/Lisbon"), null);
  assert.equal(textoDiferencaDeFuso("outro", "America/Sao_Paulo"), null);
});
