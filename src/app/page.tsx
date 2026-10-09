import type { ReactNode } from "react";
import Image from "next/image";
import {
  ArrowUpRight,
  Check,
  MessageCircle,
  MonitorPlay,
  NotebookPen,
  Target,
} from "lucide-react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";

const WHATSAPP_NUMBER = "555591359494";
const WHATSAPP_MESSAGE =
  "Oi, Teacher Thaís! Vi sua página e gostaria de agendar minha aula de inglês. :)";
const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`;
const TIKTOK_URL = "https://www.tiktok.com/@learnwithteacherthais";

const advantages = [
  "Aulas online pelo Meet",
  "Material incluso",
  "Conversação desde o primeiro dia",
];

const credentials = [
  "Certificação nível C2",
  "Letras - Inglês na UFSM",
  "Experiência na KNN Idiomas",
  "Experiência como monitora na faculdade",
];

const steps = [
  {
    number: "01",
    title: "Me conta seu objetivo",
    text: "A gente entende seu nível, sua rotina e o que você quer desenvolver no inglês.",
  },
  {
    number: "02",
    title: "Sua aula é preparada",
    text: "O conteúdo é organizado em torno das suas necessidades, sem seguir uma fórmula engessada.",
  },
  {
    number: "03",
    title: "Você pratica e evolui",
    text: "Fala inglês desde o primeiro dia e continua praticando com material para revisar depois.",
  },
];

const baseBenefits: ReactNode[] = [
  "Material didático digital interativo incluso",
  <>
    Prática de fala em <strong>todas</strong> as aulas
  </>,
  <>
    <strong>Feedback individual</strong> semanal ao longo do processo
  </>,
  "Acesso à plataforma Google Classroom com atividades para realizar",
];

const plans: {
  title: string;
  meta: string;
  benefits: ReactNode[];
  price: string;
  period: string;
  tag?: string;
  featured?: boolean;
}[] = [
  {
    title: "1x por semana",
    meta: "4 aulas ao vivo no mês",
    benefits: baseBenefits,
    price: "R$ 170",
    period: "/mês",
    tag: "10% off no 1º mês se indicar um amigo*",
  },
  {
    title: "2x por semana ou 2h no mesmo dia",
    meta: "8 aulas no mês",
    benefits: [
      ...baseBenefits,
      <strong key="extra">1 aula extra de conversação por mês</strong>,
      <strong key="gravadas">Aulas gravadas</strong>,
    ],
    price: "R$ 350",
    period: "/mês",
    tag: "mais evolução",
    featured: true,
  },
  {
    title: "Em dupla ou trio",
    meta: "Valor equivalente a 1x na semana",
    benefits: baseBenefits,
    price: "R$ 150",
    period: "/mês por pessoa",
  },
];

const testimonials = [
  {
    name: "Rodrigo",
    text: "Estou no meu primeiro mês e já percebo que estou conseguindo destravar algumas frases e falar com mais confiança.",
  },
  {
    name: "Laura",
    text: "Gosto muito de como as aulas são adaptadas ao que eu preciso. Sinto que cada encontro tem um propósito.",
  },
  {
    name: "Clarice",
    text: "A prática de fala em todas as aulas está me ajudando a perder a vergonha e pensar menos antes de responder.",
  },
  {
    name: "Flávia",
    text: "As explicações são claras e eu gosto de ter atividades para continuar praticando depois da aula.",
  },
  {
    name: "Carol",
    text: "Estou conseguindo perceber minha evolução e me sinto muito mais confortável para tentar falar inglês.",
  },
  {
    name: "Lucas",
    text: "O acompanhamento e o feedback ao longo das aulas fazem diferença porque consigo perceber melhor minha evolução no inglês.",
  },
];

const faqs = [
  {
    question: "Preciso já saber inglês?",
    answer: "Não. As aulas são adaptadas ao seu nível e aos seus objetivos.",
  },
  {
    question: "Como acontecem as aulas?",
    answer: "As aulas são online, pelo Google Meet.",
  },
  {
    question: "O material está incluso?",
    answer:
      "Sim. O material didático digital interativo está incluso e fica disponível para você revisar.",
  },
  {
    question: "Posso fazer aula com outra pessoa?",
    answer: "Sim. Existe a opção em dupla ou trio, com valor por pessoa.",
  },
  {
    question: "Como funciona o plano de estudos?",
    answer:
      "Por R$ 10 a mais no mês, você recebe um roteiro de estudos com atividades de segunda a domingo.",
  },
];

const testimonialStyles = [
  "bg-white",
  "bg-[#fff0f3] border-petal",
  "bg-cocoa text-cream-soft border-cocoa",
  "bg-[#fff0f3] border-petal",
  "bg-white",
  "bg-petal/70 border-petal",
];

function Sparkle({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={`sparkle pointer-events-none absolute fill-current ${className}`}
    >
      <path d="M12 0c.6 6.6 5.4 11.4 12 12-6.6.6-11.4 5.4-12 12-.6-6.6-5.4-11.4-12-12 6.6-.6 11.4-5.4 12-12Z" />
    </svg>
  );
}

function SectionHead({
  kicker,
  title,
  text,
  className = "",
}: {
  kicker: string;
  title: ReactNode;
  text?: string;
  className?: string;
}) {
  return (
    <div className={`reveal max-w-4xl ${className}`}>
      <div className="kicker">{kicker}</div>
      <h2 className="mt-6 text-[clamp(2.5rem,5.6vw,4.75rem)] leading-[1.02] tracking-[-0.03em]">
        {title}
      </h2>
      {text && (
        <p className="mt-6 max-w-xl text-lg leading-relaxed text-cocoa-soft">
          {text}
        </p>
      )}
    </div>
  );
}

export default function Home() {
  return (
    <div className="flex flex-1 flex-col overflow-x-clip">
      <header className="fixed inset-x-0 top-4 z-50 px-4">
        <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 rounded-full border bg-cream-soft/80 pr-2 pl-6 shadow-[0_12px_40px_-20px_rgb(74_48_57/0.35)] backdrop-blur-md">
          <a
            href="#inicio"
            className="font-serif text-lg font-semibold tracking-tight whitespace-nowrap"
          >
            <span className="max-sm:hidden">Learn with </span>
            <span className="text-rose-deep italic">Teacher Thaís</span>
          </a>
          <div className="flex items-center gap-7 text-sm">
            <a
              href="#como-funciona"
              className="text-cocoa-soft transition-colors hover:text-cocoa max-md:hidden"
            >
              Como funciona
            </a>
            <a
              href="#planos"
              className="text-cocoa-soft transition-colors hover:text-cocoa max-md:hidden"
            >
              Planos
            </a>
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="cta px-5 py-3 text-[0.6875rem]"
            >
              Agendar minha aula
            </a>
          </div>
        </nav>
      </header>

      <main>
        <section
          id="inicio"
          className="relative px-5 pt-36 pb-16 lg:pt-48 lg:pb-24"
        >
          <div
            aria-hidden="true"
            className="dots absolute top-10 -left-40 size-[38rem]"
          />
          <div
            aria-hidden="true"
            className="absolute top-24 right-[-12rem] size-[34rem] rounded-full bg-petal/60 blur-3xl"
          />
          <div className="relative mx-auto grid max-w-6xl items-center gap-16 lg:grid-cols-[1.25fr_0.75fr] lg:gap-10">
            <div className="relative">
              <Sparkle className="-top-10 left-[62%] size-7 text-blush" />
              <div className="kicker">
                Aulas particulares de inglês • Online
              </div>
              <h1 className="mt-7 text-[clamp(3.25rem,8.6vw,7.25rem)] leading-[0.94] tracking-[-0.045em]">
                Inglês para você{" "}
                <em>
                  finalmente começar a{" "}
                  <span className="relative whitespace-nowrap">
                    falar.
                    <svg
                      viewBox="0 0 200 14"
                      preserveAspectRatio="none"
                      aria-hidden="true"
                      className="absolute -bottom-[0.08em] left-0 h-[0.14em] w-full fill-none stroke-blush"
                    >
                      <path
                        d="M2 9c28-7 52-7 78-2s52 6 118-3"
                        strokeWidth="3.5"
                        strokeLinecap="round"
                      />
                    </svg>
                  </span>
                </em>
              </h1>
              <p className="mt-9 max-w-lg text-lg leading-relaxed text-cocoa-soft sm:text-xl">
                Aulas online e personalizadas, construídas para o seu nível,
                seus objetivos e o{" "}
                <span className="font-serif text-[1.15em] text-cocoa italic">
                  seu ritmo
                </span>{" "}
                — com conversação desde o primeiro dia.
              </p>
              <div className="mt-10 flex flex-wrap items-center gap-x-7 gap-y-4">
                <a
                  href={WHATSAPP_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="cta"
                >
                  Agendar minha aula
                  <ArrowUpRight className="size-4" strokeWidth={2.75} />
                </a>
                <a
                  href="#como-funciona"
                  className="border-b border-cocoa/30 pb-1 text-sm font-semibold transition-colors hover:border-rose-deep hover:text-rose-deep"
                >
                  Conhecer as aulas
                </a>
              </div>
            </div>

            <figure className="relative mx-auto w-full max-w-sm lg:mt-10 lg:max-w-none">
              <div
                aria-hidden="true"
                className="absolute -inset-3 translate-x-3 translate-y-3 rounded-t-full rounded-b-[2.5rem] border border-rose/40"
              />
              <div className="relative aspect-3/4 rotate-2 overflow-hidden rounded-t-full rounded-b-4xl shadow-[0_40px_80px_-30px_rgb(74_48_57/0.5)]">
                <Image
                  src="/images/mesa-de-estudos.jpg"
                  alt="Mesa de estudos com livros, caderno aberto e uma xícara de café"
                  fill
                  preload
                  sizes="(min-width: 1024px) 420px, 384px"
                  className="object-cover"
                />
                <div
                  aria-hidden="true"
                  className="absolute inset-0 bg-linear-to-b from-cocoa-deep/5 via-cocoa-deep/35 to-cocoa-deep/90"
                />
                <blockquote className="absolute inset-x-0 bottom-0 p-7 font-serif text-xl leading-snug text-white sm:p-8 sm:text-[1.4rem]">
                  “O que eu mais amo é ver a hora em que o aluno para de
                  traduzir tudo na cabeça e simplesmente{" "}
                  <span className="text-blush italic">começa a falar.</span>”
                </blockquote>
              </div>
              <div className="drift absolute top-[22%] -left-6 -rotate-6 rounded-full border border-rose/30 bg-white px-4 py-2 text-xs font-bold tracking-wide shadow-[0_14px_30px_-14px_rgb(201_109_138/0.6)] sm:-left-12">
                Certificação nível C2
              </div>
              <Sparkle className="-top-6 right-2 size-10 text-rose" />
              <Sparkle className="top-10 -right-6 size-4 text-blush [animation-delay:1.4s]" />
              <Sparkle className="bottom-16 -left-9 size-6 text-blush-deep [animation-delay:2.3s]" />
            </figure>
          </div>
        </section>

        <div
          aria-label={advantages.join(" • ")}
          role="img"
          className="relative z-10 -mx-6 -rotate-[1.5deg] overflow-hidden bg-cocoa py-5 text-cream-soft shadow-[0_24px_50px_-28px_rgb(74_48_57/0.7)]"
        >
          <div className="marquee-track" aria-hidden="true">
            {[0, 1].map((half) => (
              <div key={half} className="flex shrink-0 items-center">
                {[...advantages, ...advantages, ...advantages].map(
                  (advantage, index) => (
                    <span
                      key={index}
                      className="flex items-center font-serif text-2xl whitespace-nowrap italic sm:text-3xl"
                    >
                      <span className="px-7">{advantage}</span>
                      <svg viewBox="0 0 24 24" className="size-4 fill-blush">
                        <path d="M12 0c.6 6.6 5.4 11.4 12 12-6.6.6-11.4 5.4-12 12-.6-6.6-5.4-11.4-12-12 6.6-.6 11.4-5.4 12-12Z" />
                      </svg>
                    </span>
                  ),
                )}
              </div>
            ))}
          </div>
        </div>

        <section
          id="sobre"
          className="relative scroll-mt-24 px-5 py-24 lg:py-36"
        >
          <div className="mx-auto grid max-w-6xl items-center gap-16 lg:grid-cols-[0.8fr_1.2fr] lg:gap-24">
            <div className="reveal relative mx-auto w-full max-w-xs lg:max-w-none">
              <div
                aria-hidden="true"
                className="absolute inset-0 -translate-x-5 translate-y-5 rotate-[-5deg] rounded-[2.5rem] bg-petal"
              />
              <div
                aria-hidden="true"
                className="dots absolute -bottom-16 -left-20 size-64"
              />
              <div className="relative aspect-3/4 -rotate-2 overflow-hidden rounded-[2.5rem] shadow-[0_40px_80px_-34px_rgb(74_48_57/0.55)]">
                <Image
                  src="/images/teacher-thais.jpg"
                  alt="Teacher Thaís"
                  fill
                  sizes="(min-width: 1024px) 440px, 320px"
                  className="object-cover object-[center_30%]"
                />
              </div>
              <div
                role="img"
                aria-label="Metodologia exclusiva • 100% online"
                className="absolute -top-12 -right-10 flex size-32 items-center justify-center rounded-full bg-blush text-cocoa shadow-[0_18px_40px_-14px_rgb(201_109_138/0.8)] sm:-right-14 sm:size-36"
              >
                <svg
                  viewBox="0 0 120 120"
                  aria-hidden="true"
                  className="spin-slow absolute inset-0 size-full"
                >
                  <defs>
                    <path
                      id="selo-circular"
                      d="M60 60m-45 0a45 45 0 1 1 90 0a45 45 0 1 1-90 0"
                    />
                  </defs>
                  <text className="fill-current text-[9.5px] font-extrabold tracking-[0.12em]">
                    <textPath href="#selo-circular" textLength="278">
                      • METODOLOGIA EXCLUSIVA • 100% ONLINE{" "}
                    </textPath>
                  </text>
                </svg>
                <Sparkle className="static size-7 text-cocoa" />
              </div>
            </div>

            <div>
              <SectionHead
                kicker="Antes de tudo"
                title={
                  <>
                    Uma aula que começa <em>te ouvindo.</em>
                  </>
                }
                text="Antes de traçar o caminho, a ideia é entender seus objetivos, sua experiência com o inglês e o que costuma te travar na hora de falar."
              />
              <div className="reveal mt-10 border-l-2 border-blush pl-6 sm:pl-8">
                <p className="font-serif text-2xl leading-snug sm:text-[1.75rem]">
                  A Teacher Thaís dá aulas de inglês há mais de 2 anos e
                  acredita que a diferença está em{" "}
                  <strong className="font-normal text-rose-deep italic">
                    como o seu inglês vai ser trabalhado
                  </strong>
                  .
                </p>
                <p className="mt-5 text-lg leading-relaxed text-cocoa-soft">
                  As aulas são preparadas considerando seus objetivos e o que
                  for descoberto sobre o seu momento com o idioma.
                </p>
              </div>
              <ul
                aria-label="Formação e experiência"
                className="reveal mt-10 flex flex-wrap gap-2.5"
              >
                {credentials.map((credential, index) => (
                  <li key={credential}>
                    <Badge
                      variant="outline"
                      className={`h-auto px-4 py-2 text-sm font-semibold transition-transform duration-300 hover:-translate-y-0.5 ${
                        index === 0
                          ? "border-cocoa bg-cocoa text-cream-soft"
                          : "border-rose/35 bg-white text-cocoa"
                      }`}
                    >
                      {credential}
                    </Badge>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <section
          id="como-funciona"
          className="relative scroll-mt-24 px-5 py-24 lg:py-32"
        >
          <div
            aria-hidden="true"
            className="absolute inset-x-0 top-0 h-full bg-linear-to-b from-white/70 via-white/40 to-transparent"
          />
          <div className="relative mx-auto max-w-6xl">
            <Sparkle className="top-2 right-[8%] size-9 text-blush [animation-delay:0.8s]" />
            <SectionHead
              kicker="Como funciona"
              title={
                <>
                  Um caminho simples, pensado <em>a partir de você.</em>
                </>
              }
              text="Você não precisa se encaixar em uma aula pronta. A aula é que se adapta ao seu momento."
            />
            <ol className="mt-16 grid gap-12 md:grid-cols-3 md:gap-8">
              {steps.map((step, index) => (
                <li
                  key={step.number}
                  className={`reveal relative ${["", "md:mt-16", "md:mt-32"][index]}`}
                >
                  <span className="outline-numeral block font-serif text-[7.5rem] leading-[0.8] italic lg:text-[9.5rem]">
                    {step.number}
                  </span>
                  <div className="mt-6 border-t border-cocoa/20 pt-6">
                    <h3 className="text-2xl tracking-tight sm:text-[1.75rem]">
                      {step.title}
                    </h3>
                    <p className="mt-3 leading-relaxed text-cocoa-soft">
                      {step.text}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="relative px-5 py-24 lg:py-32">
          <div
            aria-hidden="true"
            className="dots absolute top-0 right-[-10rem] size-[36rem]"
          />
          <div className="relative mx-auto max-w-6xl">
            <SectionHead
              kicker="Como a gente trabalha"
              title={
                <>
                  Carinho no preparo. Inglês na <em>prática.</em>
                </>
              }
              text="Um formato próximo, personalizado e feito para que você use o inglês de verdade."
            />

            <div className="mt-16 grid gap-5 lg:grid-cols-6">
              <article className="group lift reveal relative flex min-h-96 flex-col justify-between overflow-hidden rounded-[2.5rem] border border-petal bg-[#fff0f3] p-8 sm:p-12 lg:col-span-4 lg:row-span-2">
                <svg
                  viewBox="0 0 200 200"
                  aria-hidden="true"
                  className="absolute -right-20 -bottom-24 size-96 fill-none stroke-rose/30 transition-transform duration-700 ease-out group-hover:scale-110 group-hover:rotate-12"
                >
                  <circle cx="100" cy="100" r="98" />
                  <circle cx="100" cy="100" r="74" />
                  <circle cx="100" cy="100" r="50" />
                  <circle cx="100" cy="100" r="26" />
                  <circle
                    cx="100"
                    cy="100"
                    r="7"
                    className="fill-rose stroke-none"
                  />
                </svg>
                <Sparkle className="top-10 right-10 size-8 text-rose" />
                <div className="flex size-14 items-center justify-center rounded-full bg-white text-rose-deep shadow-[0_10px_24px_-12px_rgb(201_109_138/0.7)]">
                  <Target className="size-6" strokeWidth={1.6} />
                </div>
                <div className="relative mt-16 max-w-md">
                  <h3 className="text-4xl leading-[1.02] tracking-[-0.03em] sm:text-6xl">
                    Aula feita <em>pra você</em>
                  </h3>
                  <p className="mt-5 text-lg leading-relaxed text-cocoa-soft">
                    Cada aula é preparada pensando nos seus objetivos e no que
                    for descoberto sobre o seu nível e suas necessidades.
                  </p>
                </div>
              </article>

              <article className="group lift reveal relative overflow-hidden rounded-[2rem] border bg-white p-8 lg:col-span-2">
                <div className="flex size-12 items-center justify-center rounded-full bg-cream text-rose-deep transition-colors duration-300 group-hover:bg-petal">
                  <MessageCircle className="size-5" strokeWidth={1.6} />
                </div>
                <h3 className="mt-6 text-2xl leading-tight tracking-tight">
                  Você fala inglês desde o primeiro dia
                </h3>
                <p className="mt-3 text-cocoa-soft">
                  Aqui a gente aprende conversando, no{" "}
                  <span className="font-serif text-[1.1em] text-rose-deep italic">
                    seu ritmo
                  </span>
                  .
                </p>
              </article>

              <article className="group lift reveal relative overflow-hidden rounded-[2rem] rounded-tr-[5rem] border border-petal bg-petal/60 p-8 lg:col-span-2">
                <div className="flex size-12 items-center justify-center rounded-full bg-white text-rose-deep">
                  <MonitorPlay className="size-5" strokeWidth={1.6} />
                </div>
                <h3 className="mt-6 text-2xl leading-tight tracking-tight">
                  Online pelo Meet
                </h3>
                <p className="mt-3 text-cocoa-soft">
                  O material fica com você para revisar quando quiser, sem
                  pagar nada a mais.
                </p>
              </article>

              <article className="group lift reveal relative flex flex-col gap-8 overflow-hidden rounded-[2rem] bg-cocoa p-8 text-cream-soft sm:p-10 lg:col-span-6 lg:flex-row lg:items-center lg:justify-between">
                <Sparkle className="top-6 right-[38%] size-5 text-blush [animation-delay:1.7s]" />
                <div className="flex max-w-2xl gap-6">
                  <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-white/10 text-blush">
                    <NotebookPen className="size-5" strokeWidth={1.6} />
                  </div>
                  <div>
                    <h3 className="text-2xl leading-tight tracking-tight sm:text-3xl">
                      Plano de estudos <em className="text-blush">só seu</em>
                    </h3>
                    <p className="mt-3 text-petal">
                      Por R$ 10 a mais no mês, você recebe um roteiro de segunda
                      a domingo com atividades para o seu nível.
                    </p>
                  </div>
                </div>
                <div
                  aria-hidden="true"
                  className="flex items-baseline gap-3 font-serif whitespace-nowrap text-blush transition-transform duration-500 group-hover:-translate-x-2"
                >
                  <span className="text-6xl italic sm:text-7xl">R$ 10</span>
                  <span className="font-sans text-sm text-petal">
                    a mais no mês
                  </span>
                </div>
              </article>
            </div>
          </div>
        </section>

        <section
          id="planos"
          className="relative scroll-mt-24 px-5 py-24 lg:py-32"
        >
          <div
            aria-hidden="true"
            className="absolute top-1/3 left-1/2 size-[44rem] max-w-full -translate-x-1/2 rounded-full bg-petal/50 blur-3xl"
          />
          <div className="relative mx-auto max-w-6xl">
            <Sparkle className="top-0 left-[4%] size-6 text-rose max-lg:hidden" />
            <SectionHead
              kicker="Planos e valores"
              title={
                <>
                  Aulas do jeito que combinar melhor com <em>a sua rotina.</em>
                </>
              }
              className="mx-auto text-center [&_.kicker]:after:h-px [&_.kicker]:after:w-8 [&_.kicker]:after:bg-current"
            />
            <div className="mt-20 grid gap-8 lg:grid-cols-[1fr_1.12fr_1fr] lg:items-center lg:gap-5">
              {plans.map((plan) => (
                <article
                  key={plan.title}
                  className={`lift reveal relative flex flex-col rounded-[2.25rem] p-8 sm:p-10 ${
                    plan.featured
                      ? "z-10 border-2 border-blush bg-cocoa text-cream-soft shadow-[0_0_0_8px_rgb(240_161_184/0.18),0_40px_90px_-30px_rgb(74_48_57/0.75)] lg:py-14"
                      : "border bg-white/80 backdrop-blur-sm hover:border-blush"
                  }`}
                >
                  {plan.featured && plan.tag && (
                    <Badge className="absolute -top-4 left-1/2 h-auto -translate-x-1/2 gap-2 bg-blush px-5 py-2 text-xs font-extrabold tracking-[0.18em] text-cocoa uppercase shadow-[0_10px_24px_-8px_rgb(240_161_184/0.9)]">
                      <span aria-hidden="true">✦</span>
                      {plan.tag}
                      <span aria-hidden="true">✦</span>
                    </Badge>
                  )}
                  <h3
                    className={`leading-[1.05] tracking-tight ${plan.featured ? "text-3xl sm:text-4xl" : "text-2xl sm:text-3xl"}`}
                  >
                    {plan.title}
                  </h3>
                  <p
                    className={`mt-3 text-sm ${plan.featured ? "text-petal" : "text-cocoa-soft"}`}
                  >
                    {plan.meta}
                  </p>

                  <div className="mt-8 flex flex-wrap items-baseline gap-x-2">
                    <span
                      className={`font-serif leading-none tracking-[-0.04em] ${
                        plan.featured
                          ? "text-7xl text-blush italic sm:text-8xl"
                          : "text-6xl"
                      }`}
                    >
                      {plan.price}
                    </span>
                    <span
                      className={`text-sm ${plan.featured ? "text-petal" : "text-cocoa-soft"}`}
                    >
                      {plan.period}
                    </span>
                  </div>
                  {!plan.featured && plan.tag && (
                    <p className="mt-4 text-sm font-semibold text-rose-deep">
                      {plan.tag}
                    </p>
                  )}

                  <ul
                    className={`mt-8 flex-1 space-y-3.5 border-t pt-8 text-[0.9375rem] ${
                      plan.featured ? "border-white/15" : ""
                    }`}
                  >
                    {plan.benefits.map((benefit, index) => (
                      <li key={index} className="flex gap-3">
                        <Check
                          className={`mt-1 size-4 shrink-0 ${plan.featured ? "text-blush" : "text-rose-deep"}`}
                          strokeWidth={2.5}
                        />
                        <span>{benefit}</span>
                      </li>
                    ))}
                  </ul>

                  <a
                    href={WHATSAPP_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={
                      plan.featured
                        ? "cta cta-glow mt-10 py-5 text-sm"
                        : "mt-9 inline-flex items-center justify-center rounded-full border border-cocoa/25 px-7 py-4 text-[0.8125rem] font-extrabold tracking-[0.14em] uppercase transition duration-300 hover:border-blush hover:bg-[#fff0f3]"
                    }
                  >
                    Agendar minha aula
                    {plan.featured && (
                      <ArrowUpRight className="size-4" strokeWidth={2.75} />
                    )}
                  </a>
                </article>
              ))}
            </div>

            <div className="reveal mx-auto mt-14 max-w-3xl space-y-4 text-center text-sm leading-relaxed text-cocoa-soft">
              <p>
                Em dupla ou trio, cada pessoa paga menos e estuda junto com
                quem gosta. O plano de estudos personalizado sai por{" "}
                <strong className="text-cocoa">R$ 10 a mais no mês</strong>.
              </p>
              <p className="text-xs">
                *Indique um amigo para as aulas individuais e, caso ele
                contrate um plano, você recebe 10% de desconto em uma
                mensalidade. O benefício é válido para planos individuais, não
                é cumulativo com outros descontos e é aplicado após a
                confirmação da matrícula e do primeiro pagamento do aluno
                indicado.
              </p>
            </div>
          </div>
        </section>

        <section
          id="depoimentos"
          className="relative scroll-mt-24 px-5 py-24 lg:py-32"
        >
          <div className="relative mx-auto max-w-6xl">
            <Sparkle className="top-6 right-[12%] size-8 text-blush [animation-delay:1.1s]" />
            <SectionHead
              kicker="Depoimentos"
              title={
                <>
                  Um espaço para quem vive as aulas contar{" "}
                  <em>como está sendo.</em>
                </>
              }
            />
            <div className="mt-16 gap-5 md:columns-2 lg:columns-3">
              {testimonials.map((testimonial, index) => {
                const dark = index === 2;
                return (
                  <figure
                    key={testimonial.name}
                    className={`lift reveal mb-5 break-inside-avoid rounded-[2rem] border p-8 ${testimonialStyles[index]} ${
                      index % 2 === 0 ? "sm:p-10" : ""
                    }`}
                  >
                    <span
                      aria-hidden="true"
                      className={`block h-9 font-serif text-7xl leading-none ${dark ? "text-blush" : "text-rose"}`}
                    >
                      “
                    </span>
                    <blockquote
                      className={`mt-5 font-serif leading-snug ${
                        index % 2 === 0 ? "text-2xl sm:text-[1.7rem]" : "text-xl"
                      }`}
                    >
                      “{testimonial.text}”
                    </blockquote>
                    <figcaption className="mt-8 flex items-center gap-3 text-sm font-bold tracking-wide">
                      <span
                        aria-hidden="true"
                        className={`flex size-10 items-center justify-center rounded-full font-serif text-lg italic ${
                          dark ? "bg-blush text-cocoa" : "bg-cocoa text-cream-soft"
                        }`}
                      >
                        {testimonial.name[0]}
                      </span>
                      {testimonial.name}
                    </figcaption>
                  </figure>
                );
              })}
            </div>
          </div>
        </section>

        <section id="faq" className="relative scroll-mt-24 px-5 py-24 lg:py-32">
          <div className="mx-auto grid max-w-6xl gap-14 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
            <SectionHead
              kicker="Dúvidas frequentes"
              title={
                <>
                  Antes de começar, <em>talvez você queira saber.</em>
                </>
              }
              text="As respostas mais importantes para você entender como as aulas funcionam."
              className="lg:sticky lg:top-32 lg:self-start [&_h2]:text-[clamp(2.25rem,4.2vw,3.5rem)]"
            />
            <Accordion className="reveal border-t border-cocoa/20">
              {faqs.map((faq, index) => (
                <AccordionItem
                  key={faq.question}
                  value={faq.question}
                  className="border-cocoa/20"
                >
                  <AccordionTrigger className="items-center gap-6 rounded-none py-7 font-serif text-xl font-normal tracking-tight hover:text-rose-deep hover:no-underline sm:text-2xl **:data-[slot=accordion-trigger-icon]:size-5 **:data-[slot=accordion-trigger-icon]:text-rose-deep">
                    <span className="flex items-baseline gap-5">
                      <span className="font-sans text-xs font-bold tracking-widest text-rose-deep">
                        0{index + 1}
                      </span>
                      {faq.question}
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="pr-10 pb-7 pl-10 text-base leading-relaxed text-cocoa-soft">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>

        <section className="px-5 pb-10">
          <div className="reveal relative mx-auto max-w-6xl overflow-hidden rounded-[3rem] bg-cocoa px-7 py-20 text-cream-soft sm:px-14 lg:py-28">
            <div
              aria-hidden="true"
              className="absolute -top-32 -right-24 size-[30rem] rounded-full bg-rose/40 blur-3xl"
            />
            <div
              aria-hidden="true"
              className="absolute -bottom-40 -left-24 size-96 rounded-full bg-blush/15 blur-3xl"
            />
            <Sparkle className="top-12 right-[14%] size-12 text-blush" />
            <Sparkle className="right-[30%] bottom-16 size-5 text-petal [animation-delay:1.5s]" />
            <Sparkle className="top-1/2 right-[6%] size-7 text-rose [animation-delay:2.6s] max-sm:hidden" />
            <div className="relative max-w-4xl">
              <h2 className="text-[clamp(2.5rem,6.2vw,5.25rem)] leading-none tracking-[-0.035em] [&_em]:text-blush">
                Seu inglês não precisa estar perfeito para você{" "}
                <em>começar a falar.</em>
              </h2>
              <p className="mt-8 max-w-xl text-lg leading-relaxed text-petal">
                A gente começa do seu nível, no{" "}
                <span className="font-serif text-[1.15em] text-cream-soft italic">
                  seu ritmo
                </span>{" "}
                e com um plano que faça sentido para a sua rotina.
              </p>
              <a
                href={WHATSAPP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="cta cta-glow mt-11 py-5"
              >
                Quero conversar com a Teacher Thaís
                <ArrowUpRight className="size-4 shrink-0" strokeWidth={2.75} />
              </a>
            </div>
          </div>
        </section>
      </main>

      <footer className="px-5 pt-6 pb-12">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 border-t pt-8 text-sm text-cocoa-soft md:flex-row md:items-center md:justify-between">
          <strong className="font-serif text-lg font-semibold text-cocoa">
            Learn with{" "}
            <span className="text-rose-deep italic">Teacher Thaís</span>
          </strong>
          <span>Aulas particulares de inglês • Online pelo Meet</span>
          <div className="flex items-center gap-3">
            <span>Redes sociais</span>
            <a
              href={TIKTOK_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="TikTok da Teacher Thaís"
              className="inline-flex items-center gap-2 rounded-full border bg-white px-4 py-2 font-semibold text-cocoa transition-colors hover:border-blush hover:text-rose-deep"
            >
              <svg
                viewBox="0 0 24 24"
                aria-hidden="true"
                className="size-4 fill-current"
              >
                <path d="M15.5 4.5c.7 1.9 2 3.1 4 3.5v3.1c-1.5 0-2.9-.4-4-1.2v5.5a5.4 5.4 0 1 1-4.7-5.3v3.2a2.3 2.3 0 1 0 1.6 2.2V4.5h3.1Z" />
              </svg>
              @learnwithteacherthais
            </a>
          </div>
        </div>
        <p className="mx-auto mt-10 max-w-6xl text-center text-xs text-cocoa-soft">
          Desenvolvido por{" "}
          <a
            href="https://www.instagram.com/gabrielmai_/"
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-cocoa underline-offset-4 transition-colors hover:text-rose-deep hover:underline"
          >
            @gabrielmai_
          </a>
        </p>
      </footer>
    </div>
  );
}
