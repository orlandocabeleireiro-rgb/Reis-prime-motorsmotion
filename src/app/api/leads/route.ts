import { NextResponse } from "next/server";

/**
 * Recebe os pedidos dos formulários ("Pedir informações" e "Vendemos o seu carro").
 *
 * Ponto de integração: aqui pode enviar um email (Resend, SendGrid…), gravar numa
 * base de dados ou num CRM. Por agora apenas valida e regista no log do servidor.
 */
export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Pedido inválido." }, { status: 400 });
  }

  const type = body.type === "venda" || body.type === "informacao" ? body.type : null;
  const name = typeof body.name === "string" ? body.name.trim() : "";
  const phone = typeof body.phone === "string" ? body.phone.trim() : "";
  const email = typeof body.email === "string" ? body.email.trim() : "";

  if (!type || name.length < 2 || (!phone && !email)) {
    return NextResponse.json({ ok: false, error: "Indique o nome e um contacto (telefone ou email)." }, { status: 422 });
  }

  console.info("[lead]", JSON.stringify({ ...body, receivedAt: new Date().toISOString() }));
  return NextResponse.json({ ok: true });
}
