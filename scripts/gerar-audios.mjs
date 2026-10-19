#!/usr/bin/env node
// Gera os áudios da etapa de escuta com a ElevenLabs, UMA vez, e salva em
// public/audio/nivelamento/. O site só toca esses arquivos estáticos: a chave
// nunca vai para o navegador nem para a Vercel.
//
// Uso:
//   node scripts/gerar-audios.mjs          gera só os arquivos que ainda não existem
//   node scripts/gerar-audios.mjs --force  regera todos
//
// Precisa de ELEVENLABS_API_KEY no .env.local.
// Os textos, as vozes (voiceId), a velocidade e o modelo ficam em
// src/lib/nivelamento/banco.json.

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const raiz = join(dirname(fileURLToPath(import.meta.url)), "..");
const caminhoBanco = join(raiz, "src/lib/nivelamento/banco.json");
const pastaSaida = join(raiz, "public/audio/nivelamento");
const API = "https://api.elevenlabs.io/v1";
const forcar = process.argv.includes("--force");

try {
  process.loadEnvFile(join(raiz, ".env.local"));
} catch {
  // sem .env.local: usa a variável do ambiente, se houver
}

const chave = process.env.ELEVENLABS_API_KEY;
if (!chave) {
  console.error("Falta ELEVENLABS_API_KEY no .env.local.");
  process.exit(1);
}

const banco = JSON.parse(readFileSync(caminhoBanco, "utf8"));
const { modelo, audios } = banco.escuta;

async function api(caminho, opcoes = {}) {
  const resposta = await fetch(`${API}${caminho}`, {
    ...opcoes,
    headers: { "xi-api-key": chave, ...opcoes.headers },
  });
  if (!resposta.ok) {
    throw new Error(`ElevenLabs respondeu ${resposta.status}: ${await resposta.text()}`);
  }
  return resposta;
}

/** Sem voiceId: lista as vozes da conta e sugere uma para cada áudio. */
async function sugerirVozes() {
  const { voices } = await (await api("/voices")).json();
  const descrever = (v) =>
    [v.labels?.gender, v.labels?.accent, v.labels?.age, v.labels?.description]
      .filter(Boolean)
      .join(", ");

  console.log("\nVozes disponíveis na sua conta:\n");
  for (const v of voices) {
    console.log(`  ${v.voice_id}  ${v.name.padEnd(22)} ${descrever(v)}`);
  }

  console.log("\nSugestões (confira ouvindo no site da ElevenLabs):\n");
  for (const audio of audios) {
    const querMulher = /mulher/i.test(audio.voz);
    const querBritanico = /brit/i.test(audio.voz);
    const candidata = voices.find((v) => {
      const genero = (v.labels?.gender ?? "").toLowerCase();
      const sotaque = (v.labels?.accent ?? "").toLowerCase();
      return (
        genero === (querMulher ? "female" : "male") &&
        (querBritanico ? /brit|english/.test(sotaque) : /americ/.test(sotaque))
      );
    });
    console.log(
      `  ${audio.id} (${audio.voz}): ${
        candidata ? `${candidata.voice_id}  ${candidata.name}` : "nenhuma sugestão automática"
      }`,
    );
  }
  console.log(
    `\nCopie os IDs para o campo "voiceId" de cada áudio em src/lib/nivelamento/banco.json e rode de novo.\n`,
  );
}

async function gerar(audio) {
  const destino = join(pastaSaida, `${audio.id}.mp3`);
  if (existsSync(destino) && !forcar) {
    console.log(`= ${audio.id}.mp3 já existe (use --force para regerar)`);
    return;
  }
  const resposta = await api(
    `/text-to-speech/${audio.voiceId}?output_format=mp3_44100_128`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "audio/mpeg" },
      body: JSON.stringify({
        text: audio.texto,
        model_id: modelo,
        voice_settings: {
          stability: 0.55,
          similarity_boost: 0.75,
          // níveis mais baixos falam um pouco mais devagar (faixa aceita: 0,7 a 1,2)
          speed: audio.velocidade,
        },
      }),
    },
  );
  writeFileSync(destino, Buffer.from(await resposta.arrayBuffer()));
  console.log(`✓ ${audio.id}.mp3 (${audio.nivel}, ${audio.voz}, velocidade ${audio.velocidade})`);
}

// process.exitCode em vez de process.exit(): no Windows, sair à força logo
// depois de um fetch dispara um "Assertion failed" do libuv.
try {
  if (audios.some((a) => !a.voiceId)) {
    console.log('Alguns áudios estão sem "voiceId" em banco.json.');
    await sugerirVozes();
    process.exitCode = 1;
  } else {
    mkdirSync(pastaSaida, { recursive: true });
    for (const audio of audios) await gerar(audio);
    console.log(`\nPronto. Ouça os arquivos em public/audio/nivelamento/ e faça o commit.`);
    if (forcar) {
      console.log(
        'Como você regerou com --force, aumente "escuta.versao" no banco.json para o navegador não usar o áudio antigo em cache.',
      );
    }
  }
} catch (erro) {
  console.error(`\n${erro.message}`);
  process.exitCode = 1;
}
