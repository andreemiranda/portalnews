import { NewsItem } from './types';
import { slugify } from './slug';

export function getEditorialSeedNews(): NewsItem[] {
  const now = new Date();

  const rawSeeds: Array<{
    title: string;
    category: string;
    summary: string;
    content: string;
    imageUrl?: string;
    hoursAgo: number;
  }> = [
    {
      title: 'Congresso avança na votação das novas diretrizes orçamentárias e metas fiscais',
      category: 'Política',
      summary: 'Lideranças partidárias articulam consenso em torno dos principais eixos de despesas e investimentos para o próximo exercício financeiro.',
      content: 'Lideranças partidárias no Congresso Nacional concluíram nova rodada de negociações em torno das metas fiscais para o próximo ciclo financeiro. O relatório apresentado em comissão especial estabelece regras mais previsíveis para a alocação de recursos em infraestrutura, saneamento e transição ecológica. Segundo os parlamentares envolvidos, a expectativa é de votação conclusiva no plenário ainda nesta semana, mantendo o equilíbrio das contas públicas.',
      imageUrl: 'https://admin.cnnbrasil.com.br/wp-content/uploads/sites/12/2025/08/2025-08-18T174454Z_1_LOP805718082025RP1_RTRMADP_BASEIMAGE-960X540_UKRAINE-CRISIS-SUMMIT-TRUMP-ZELENSKIY-SUIT-MOMENT.jpg',
      hoursAgo: 1,
    },
    {
      title: 'Balanço financeiro nacional aponta crescimento da produtividade e estabilidade cambial',
      category: 'Economia',
      summary: 'Relatório setorial indica expansão do agronegócio e fortalecimento das exportações industriais no último trimestre.',
      content: 'O setor produtivo nacional registrou avanço contínuo no último trimestre, impulsionado pelo desempenho das cadeias de suprimentos e pela expansão das exportações agrícolas. O índice divulgado hoje demonstra estabilidade nos custos operacionais e elevação na contratação de mão de obra formal nas capitais e polos industriais do país.',
      imageUrl: 'https://classic.exame.com/wp-content/uploads/2026/10/belo_monte.jpg',
      hoursAgo: 2,
    },
    {
      title: 'Brasileirão e Libertadores: clubes intensificam preparação tática para as decisões',
      category: 'Esporte',
      summary: 'Técnicos ajustam escalações e estratégias com foco em confrontos decisivos nas competições continentais e nacionais.',
      content: 'Os principais clubes do futebol brasileiro entraram na reta final de preparação para as rodadas decisivas das competições da temporada. Com calendários intensos, as comissões técnicas priorizam a recuperação física dos atletas titulares e estudos aprofundados sobre a dinâmica defensiva dos adversários. Os treinos táticos desta semana definiram os prováveis titulares para os jogos de mata-mata.',
      imageUrl: 'https://admin.cnnbrasil.com.br/wp-content/uploads/sites/12/2026/05/galvao-bueno.jpg',
      hoursAgo: 3,
    },
    {
      title: 'Flamengo e Palmeiras disputam liderança em rodada com casa cheia nos estádios',
      category: 'Esporte',
      summary: 'Duelo na ponta da tabela atrai atenção dos torcedores com promessa de alto nível técnico e rivalidade em alta.',
      content: 'O clássico interestadual deste fim de semana coloca frente a frente os dois ataques mais produtivos do campeonato. Com ingressos esgotados antecipadamente, os treinadores apostam no equilíbrio entre meio-campo e transição veloz para garantir os três pontos na disputa pela liderança da Série A.',
      imageUrl: 'https://static.gazetaesportiva.com/uploads/2026/10/14102026_cg_palmeiras_5337_96.webp',
      hoursAgo: 4,
    },
    {
      title: 'Supremo Tribunal Federal julga precedentes sobre marcos regulatórios e proteção digital',
      category: 'Justiça',
      summary: 'Plenário analisa repercussão geral em matéria de direitos digitais, transparência institucional e segurança jurídica.',
      content: 'O Supremo Tribunal Federal retomou nesta tarde o julgamento que definirá a aplicação de precedentes em litígios envolvendo serviços de telecomunicações e plataformas digitais. O ministro relator destacou a importância de harmonizar a liberdade de informação com os princípios fundamentais da segurança do usuário e a preservação da privacidade.',
      imageUrl: 'https://admin.cnnbrasil.com.br/wp-content/uploads/sites/12/2026/10/Arqueologa-assalto-RJ.jpg',
      hoursAgo: 5,
    },
    {
      title: 'Ministério da Saúde amplia vacinação e programas de teleatendimento na rede básica',
      category: 'Saúde',
      summary: 'Iniciativa moderniza postos municipais e conecta equipes médicas a regiões com menor cobertura assistencial.',
      content: 'A estratégia de ampliação da atenção primária à saúde ganhou reforço com o anúncio de novas ferramentas de prontuário eletrônico e integração entre centros de saúde municipais. A medida garante rapidez no agendamento de consultas com médicos especialistas e monitoramento contínuo de pacientes crônicos.',
      imageUrl: 'https://s2-g1.glbimg.com/FB6DDwyJg9h_5z36yobKcEKoisQ=/i.s3.glbimg.com/v1/AUTH_59edd422c0c84a879bd37670ae4f538a/internal_photos/bs/2026/B/q/0vCadETtaOS1xJMAVITQ/design-sem-nome-2026-10-16t073405.072.jpg',
      hoursAgo: 6,
    },
    {
      title: 'Centros de pesquisa no Brasil ampliam projetos de inteligência artificial aplicada à agricultura',
      category: 'Tecnologia e Games',
      summary: 'Modelos computacionais preditivos auxiliam no mapeamento de safras e no uso sustentável de recursos hídricos.',
      content: 'Pesquisadores de instituições públicas e privadas apresentaram novos algoritmos capazes de antecipar variações climáticas em microbacias e otimizar o manejo de defensivos biológicos. A inovação tecnológica visa reduzir custos para cooperativas rurais e minimizar o impacto ambiental.',
      imageUrl: 'https://s2-g1.glbimg.com/3iu_ejPK5KHBbcnWBFE0iofSGTA=/i.s3.glbimg.com/v1/AUTH_59edd422c0c84a879bd37670ae4f538a/internal_photos/bs/2026/M/B/C65W8OQzu1EbzbM0lbGA/2026-10-13t134516z-528014761-rc2d2oakls8u-rtrmadp-3-usa-trump-zacharia.jpg',
      hoursAgo: 7,
    },
    {
      title: 'Governo do Pará anuncia novo pacote de obras estruturantes para mobilidade e saneamento',
      category: 'Pará',
      summary: 'Investimentos contemplam Belém e municípios metropolitanos em preparação para grandes eventos internacionais.',
      content: 'O governo estadual detalhou o cronograma de entrega das obras de pavimentação, drenagem e modernização viária na Região Metropolitana de Belém. O plano inclui novas faixas exclusivas para o transporte coletivo e requalificação de canais urbanos para contenção de alagamentos.',
      imageUrl: 'https://s2-g1.glbimg.com/VAwwzg3X32HV1k-JXHygrU7Oluo=/i.s3.glbimg.com/v1/AUTH_59edd422c0c84a879bd37670ae4f538a/internal_photos/bs/2026/r/T/beR0fIRfun20edNpql4g/odivelas-3-.jpg',
      hoursAgo: 8,
    },
    {
      title: 'Tocantins registra expansão na malha logística ferroviária e novos investimentos industriais',
      category: 'Tocantins',
      summary: 'Terminal de integração logística atrai novos operadores e fortalece o escoamento de grãos para portos do norte.',
      content: 'O fluxo de transporte de cargas através do corredor ferroviário central registrou crescimento expressivo no comparativo anual. Empresas de beneficiamento de grãos e operadores logísticos confirmaram a instalação de novas estruturas de armazenagem no estado, gerando empregos diretos.',
      imageUrl: 'https://classic.exame.com/wp-content/uploads/2026/10/belo_monte.jpg',
      hoursAgo: 9,
    },
    {
      title: 'Goiás amplia incentivos para polo farmacêutico e indústria de biotecnologia em Anápolis',
      category: 'Goiás',
      summary: 'Distrito agroindustrial atrai novas plantas de produção de medicamentos e pesquisas em insumos hospitalares.',
      content: 'A ampliação de áreas e benefícios fiscais no polo industrial goiano impulsionou novos investimentos de laboratórios farmacêuticos. O projeto abrange programas de qualificação profissional em parceria com institutos federais e universidades locais.',
      imageUrl: 'https://admin.cnnbrasil.com.br/wp-content/uploads/sites/12/2026/10/Arqueologa-assalto-RJ.jpg',
      hoursAgo: 10,
    },
    {
      title: 'Santa Catarina bate recorde de exportações no setor de tecnologia e metalmecânico',
      category: 'Santa Catarina',
      summary: 'Empresas catarinenses ampliam presença em mercados da América do Norte e Europa no primeiro semestre.',
      content: 'O polo de inovação e engenharia catarinense encerrou o período com alta nas vendas internacionais de componentes automotivos e softwares corporativos. Representantes do setor produtivo apontam a competitividade técnica como diferencial nas negociações.',
      imageUrl: 'https://s2-g1.glbimg.com/FB6DDwyJg9h_5z36yobKcEKoisQ=/i.s3.glbimg.com/v1/AUTH_59edd422c0c84a879bd37670ae4f538a/internal_photos/bs/2026/B/q/0vCadETtaOS1xJMAVITQ/design-sem-nome-2026-10-16t073405.072.jpg',
      hoursAgo: 12,
    },
    {
      title: 'Cúpula internacional debate acordos de transição energética e segurança alimentar',
      category: 'Mundo',
      summary: 'Representantes de mais de 50 nações discutem metas climáticas e financiamento conjunto para projetos renováveis.',
      content: 'Emissários diplomáticos e ministros do meio ambiente reunidos nesta conferência global assinaram memorandos de cooperação para acelerar investimentos em hidrogênio verde e energia solar. O documento final destaca a necessidade de equilibrar custos tarifários com metas de descarbonização até 2035.',
      imageUrl: 'https://admin.cnnbrasil.com.br/wp-content/uploads/sites/12/2025/08/2025-08-18T174454Z_1_LOP805718082025RP1_RTRMADP_BASEIMAGE-960X540_UKRAINE-CRISIS-SUMMIT-TRUMP-ZELENSKIY-SUIT-MOMENT.jpg',
      hoursAgo: 14,
    },
    {
      title: 'Novos programas pedagógicos do MEC focam na valorização docente e conectividade escolar',
      category: 'Educação',
      summary: 'Diretrizes curriculares reforçam laboratórios de ciências e capacitação continuada para professores da rede pública.',
      content: 'A nova portaria do Ministério da Educação estabelece critérios para a instalação de internet de alta velocidade em todas as escolas de ensino fundamental e médio. Paralelamente, bolsas de pós-graduação e formação pedagógica foram disponibilizadas para professores efetivos.',
      imageUrl: 'https://s2-g1.glbimg.com/VAwwzg3X32HV1k-JXHygrU7Oluo=/i.s3.glbimg.com/v1/AUTH_59edd422c0c84a879bd37670ae4f538a/internal_photos/bs/2026/r/T/beR0fIRfun20edNpql4g/odivelas-3-.jpg',
      hoursAgo: 16,
    },
  ];

  return rawSeeds.map((seed, idx) => {
    const itemDate = new Date(now.getTime() - seed.hoursAgo * 3600 * 1000);
    const pubDate = itemDate.toISOString();
    const cleanSlug = slugify(seed.title, `seed-${idx}`);

    return {
      id: `portal-${seed.category.toLowerCase().replace(/\s+/g, '-')}-${idx + 1}`,
      slug: cleanSlug,
      title: seed.title,
      link: `/noticia/${cleanSlug}`,
      pubDate,
      isoDate: pubDate,
      timeAgo: seed.hoursAgo < 1 ? 'Agora mesmo' : `Há ${seed.hoursAgo} horas`,
      category: seed.category,
      categoryId: seed.category,
      source: 'Portal News',
      summary: seed.summary,
      contentHtml: seed.content,
      imageUrl: seed.imageUrl,
      imageCaption: seed.imageUrl ? `Registro jornalístico • ${seed.category} / Portal News` : undefined,
      author: 'Portal News',
    };
  });
}
