export const WHATSAPP_NUMBER = "555591359494";

export function whatsappUrl(mensagem: string) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(mensagem)}`;
}
