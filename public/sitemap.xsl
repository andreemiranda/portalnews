<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="2.0"
  xmlns:html="http://www.w3.org/TR/REC-html40"
  xmlns:sitemap="http://www.sitemaps.org/schemas/sitemap/0.9"
  xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
  xmlns:news="http://www.google.com/schemas/sitemap-news/0.9"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="html" version="1.0" encoding="UTF-8" indent="yes"/>
  <xsl:template match="/">
    <html xmlns="http://www.w3.org/1999/xhtml" lang="pt-BR">
      <head>
        <title>Portal News • Mapa do Site XML (Sitemap)</title>
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <style type="text/css">
          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Helvetica Neue", sans-serif;
            color: #1e293b;
            background-color: #f8fafc;
            margin: 0;
            padding: 30px 20px;
          }
          .container {
            max-width: 1100px;
            margin: 0 auto;
            background: #ffffff;
            border-radius: 16px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.06);
            border: 1px solid #e2e8f0;
            overflow: hidden;
          }
          .header {
            background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%);
            color: #ffffff;
            padding: 32px 36px;
          }
          .header h1 {
            margin: 0 0 6px 0;
            font-size: 24px;
            font-weight: 900;
            letter-spacing: -0.5px;
          }
          .header p {
            margin: 0;
            font-size: 14px;
            color: #fee2e2;
          }
          .stats {
            display: flex;
            gap: 20px;
            margin-top: 18px;
            font-size: 13px;
          }
          .stat-pill {
            background: rgba(255,255,255,0.18);
            padding: 6px 14px;
            border-radius: 20px;
            font-weight: 600;
          }
          .table-wrapper {
            padding: 24px;
            overflow-x: auto;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            font-size: 13px;
          }
          th {
            background-color: #f1f5f9;
            color: #475569;
            text-align: left;
            padding: 12px 16px;
            font-weight: 700;
            border-bottom: 2px solid #e2e8f0;
            text-transform: uppercase;
            font-size: 11px;
            letter-spacing: 0.5px;
          }
          td {
            padding: 12px 16px;
            border-bottom: 1px solid #f1f5f9;
            vertical-align: middle;
            color: #334155;
          }
          tr:hover td {
            background-color: #f8fafc;
          }
          a {
            color: #dc2626;
            text-decoration: none;
            font-weight: 600;
            word-break: break-all;
          }
          a:hover {
            text-decoration: underline;
          }
          .footer {
            padding: 16px 24px;
            background-color: #f8fafc;
            border-top: 1px solid #e2e8f0;
            font-size: 12px;
            color: #64748b;
            display: flex;
            justify-content: space-between;
            align-items: center;
          }
          .badge {
            display: inline-block;
            background: #e0f2fe;
            color: #0369a1;
            padding: 3px 8px;
            border-radius: 6px;
            font-size: 11px;
            font-weight: 700;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>PORTAL NEWS • Mapa do Site XML</h1>
            <p>Índice padronizado de sitemaps e URLs para mecanismos de busca (Google, Bing)</p>
            <div class="stats">
              <div class="stat-pill">
                <xsl:choose>
                  <xsl:when test="sitemap:sitemapindex">
                    Sitemaps no Índice: <xsl:value-of select="count(sitemap:sitemapindex/sitemap:sitemap)"/>
                  </xsl:when>
                  <xsl:otherwise>
                    Total de URLs: <xsl:value-of select="count(sitemap:urlset/sitemap:url)"/>
                  </xsl:otherwise>
                </xsl:choose>
              </div>
              <div class="stat-pill">Status: Ativo em Tempo Real</div>
            </div>
          </div>

          <div class="table-wrapper">
            <!-- Sitemap Index View -->
            <xsl:if test="sitemap:sitemapindex">
              <table>
                <thead>
                  <tr>
                    <th style="width: 65%;">Sub-Sitemap XML</th>
                    <th style="width: 35%;">Última Atualização</th>
                  </tr>
                </thead>
                <tbody>
                  <xsl:for-each select="sitemap:sitemapindex/sitemap:sitemap">
                    <tr>
                      <td>
                        <a href="{sitemap:loc}">
                          <xsl:value-of select="sitemap:loc"/>
                        </a>
                      </td>
                      <td>
                        <xsl:value-of select="sitemap:lastmod"/>
                      </td>
                    </tr>
                  </xsl:for-each>
                </tbody>
              </table>
            </xsl:if>

            <!-- URL Set View -->
            <xsl:if test="sitemap:urlset">
              <table>
                <thead>
                  <tr>
                    <th style="width: 50%;">Localização (URL)</th>
                    <th style="width: 15%;">Prioridade</th>
                    <th style="width: 15%;">Frequência</th>
                    <th style="width: 20%;">Última Modificação</th>
                  </tr>
                </thead>
                <tbody>
                  <xsl:for-each select="sitemap:urlset/sitemap:url">
                    <tr>
                      <td>
                        <a href="{sitemap:loc}">
                          <xsl:value-of select="sitemap:loc"/>
                        </a>
                        <xsl:if test="image:image">
                          <div style="margin-top: 4px;">
                            <span class="badge">Imagem Anexada</span>
                          </div>
                        </xsl:if>
                        <xsl:if test="news:news">
                          <div style="margin-top: 4px;">
                            <span class="badge" style="background: #fef3c7; color: #92400e;">Google News</span>
                          </div>
                        </xsl:if>
                      </td>
                      <td>
                        <xsl:value-of select="sitemap:priority"/>
                      </td>
                      <td>
                        <xsl:value-of select="sitemap:changefreq"/>
                      </td>
                      <td>
                        <xsl:value-of select="sitemap:lastmod"/>
                      </td>
                    </tr>
                  </xsl:for-each>
                </tbody>
              </table>
            </xsl:if>
          </div>

          <div class="footer">
            <span>© Portal News • Cobertura Jornalística Completa</span>
            <a href="/">← Voltar ao Portal News</a>
          </div>
        </div>
      </body>
    </html>
  </xsl:template>
</xsl:stylesheet>
