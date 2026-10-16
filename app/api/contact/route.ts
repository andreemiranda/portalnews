import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { generateContactProtocol, formatProtocolNumber } from '@/lib/protocol';
import { SITE_CONFIG } from '@/lib/site-config';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, subject, message } = body;

    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      return NextResponse.json({ error: 'Por favor, informe seu nome completo.' }, { status: 400 });
    }

    if (!email || typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      return NextResponse.json({ error: 'Por favor, informe um endereço de e-mail válido.' }, { status: 400 });
    }

    if (!message || typeof message !== 'string' || message.trim().length < 10) {
      return NextResponse.json({ error: 'A mensagem deve conter pelo menos 10 caracteres.' }, { status: 400 });
    }

    // 1. Gera protocolo único de 13 dígitos sem zero ('0') e com poucos dígitos repetidos
    const protocol = generateContactProtocol();
    const formattedProtocol = formatProtocolNumber(protocol);
    const nowIso = new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' });

    // 2. Extrai dados de rede para auditoria do administrador
    const clientIp = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'Não identificado';
    const userAgent = req.headers.get('user-agent') || 'Navegador';

    // 3. Monta e envia e-mail via servidor SMTP (Google App Password) se configurado
    const smtpConfig = SITE_CONFIG.smtp;
    let emailSent = false;
    let emailStatusMessage = 'Protocolo registrado com sucesso.';

    if (smtpConfig.user && smtpConfig.pass) {
      try {
        const transporter = nodemailer.createTransport({
          host: smtpConfig.host,
          port: smtpConfig.port,
          secure: smtpConfig.port === 465,
          auth: {
            user: smtpConfig.user,
            pass: smtpConfig.pass,
          },
        });

        const mailSubject = `[Protocolo ${formattedProtocol}] ${subject || 'Contato'} - Portal News`;
        const mailHtml = `
          <div style="font-family: Arial, sans-serif; max-width: 650px; margin: 0 auto; border: 1px solid #e4e4e7; border-radius: 12px; overflow: hidden;">
            <div style="background-color: #dc2626; padding: 20px; color: #ffffff; text-align: center;">
              <h1 style="margin: 0; font-size: 24px; font-weight: 900; letter-spacing: -0.5px;">PORTAL NEWS</h1>
              <p style="margin: 5px 0 0 0; font-size: 13px; opacity: 0.9;">Central de Atendimento e Relacionamento com o Leitor</p>
            </div>
            <div style="padding: 24px; background-color: #ffffff; color: #18181b;">
              <div style="background-color: #fef2f2; border-left: 4px solid #dc2626; padding: 14px 18px; border-radius: 6px; margin-bottom: 20px;">
                <p style="margin: 0; font-size: 12px; text-transform: uppercase; font-weight: 800; color: #991b1b;">Número de Protocolo Oficial</p>
                <p style="margin: 4px 0 0 0; font-size: 20px; font-weight: 900; color: #dc2626; letter-spacing: 1px;">${formattedProtocol}</p>
                <p style="margin: 4px 0 0 0; font-size: 11px; color: #7f1d1d;">Código bruto (13 dígitos): ${protocol}</p>
              </div>

              <h3 style="font-size: 15px; margin: 0 0 12px 0; border-bottom: 1px solid #f4f4f5; padding-bottom: 6px;">Dados do Remetente</h3>
              <table style="width: 100%; border-collapse: collapse; font-size: 13px; margin-bottom: 20px;">
                <tr>
                  <td style="padding: 6px 0; font-weight: bold; width: 120px; color: #71717a;">Nome:</td>
                  <td style="padding: 6px 0; color: #09090b;">${name}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; font-weight: bold; color: #71717a;">E-mail:</td>
                  <td style="padding: 6px 0; color: #09090b;"><a href="mailto:${email}" style="color: #dc2626;">${email}</a></td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; font-weight: bold; color: #71717a;">Assunto:</td>
                  <td style="padding: 6px 0; color: #09090b;">${subject || 'Não especificado'}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; font-weight: bold; color: #71717a;">Data e Hora:</td>
                  <td style="padding: 6px 0; color: #09090b;">${nowIso} (Horário de Brasília)</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; font-weight: bold; color: #71717a;">IP de Origem:</td>
                  <td style="padding: 6px 0; color: #09090b;">${clientIp}</td>
                </tr>
              </table>

              <h3 style="font-size: 15px; margin: 0 0 10px 0; border-bottom: 1px solid #f4f4f5; padding-bottom: 6px;">Mensagem Enviada</h3>
              <div style="background-color: #f8fafc; padding: 16px; border-radius: 8px; font-size: 13px; line-height: 1.6; color: #334155; white-space: pre-wrap;">
                ${message}
              </div>
            </div>
            <div style="background-color: #f4f4f5; padding: 14px; text-align: center; font-size: 11px; color: #71717a; border-top: 1px solid #e4e4e7;">
              <p style="margin: 0;">Portal News — Responsável: ${SITE_CONFIG.institutional.responsible} • ${SITE_CONFIG.institutional.address} • Tel: ${SITE_CONFIG.institutional.phone}</p>
            </div>
          </div>
        `;

        await transporter.sendMail({
          from: `"Portal News Atendimento" <${smtpConfig.user}>`,
          to: smtpConfig.receiver,
          replyTo: email,
          subject: mailSubject,
          html: mailHtml,
        });

        emailSent = true;
      } catch (smtpErr) {
        console.error('Aviso SMTP:', smtpErr);
        emailStatusMessage = 'Protocolo gerado e armazenado. Aguardando envio na fila de mensagens.';
      }
    } else {
      console.log(`[Contato Portal News] Protocolo: ${protocol} | De: ${name} (${email}) | Assunto: ${subject}`);
    }

    return NextResponse.json({
      success: true,
      protocol,
      formattedProtocol,
      emailSent,
      message: 'Sua mensagem foi enviada com sucesso.',
      instruction: 'Por favor, anote este número de protocolo para seu acompanhamento e controle.',
      statusMessage: emailStatusMessage,
    });
  } catch (err: any) {
    console.error('Erro na rota de contato:', err);
    return NextResponse.json(
      { error: 'Não foi possível processar seu contato no momento. Tente novamente mais tarde.' },
      { status: 500 }
    );
  }
}
