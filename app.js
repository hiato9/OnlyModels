// Creator Levels and Badges System
const LEVELS = {
    bronze: { name: 'Bronze', class: 'level-bronze', icon: '🥉', min: 0, max: 1000 },
    silver: { name: 'Prata', class: 'level-silver', icon: '🥈', min: 1000, max: 10000 },
    gold: { name: 'Ouro', class: 'level-gold', icon: '🥇', min: 10000, max: 50000 },
    platinum: { name: 'Platina', class: 'level-platinum', icon: '💎', min: 50000, max: Infinity }
};

const ACHIEVEMENTS = {
    '100-posts': { icon: '🏆', name: '100 Posts' },
    '1k-likes': { icon: '💯', name: '1K Curtidas' },
    '10k-views': { icon: '🎯', name: '10K Views' },
    'verified': { icon: '✓', name: 'Verificado' },
    'top-creator': { icon: '⭐', name: 'Top Creator' },
    'trending': { icon: '🔥', name: 'Em Alta' }
};

const MODELS_PER_PAGE = 8;
const PAGE_FILES = ['index.html', 'pagina-2.html'];

function getCurrentPage() {
    const path = window.location.pathname.toLowerCase();
    const idx = PAGE_FILES.findIndex(f => path.endsWith('/' + f) || path.endsWith(f));
    return idx >= 0 ? idx : 0;
}

function getTotalPages() {
    return Math.ceil(creatorsData.length / MODELS_PER_PAGE);
}

// Creators Data - Real Brazilian Models
const creatorsData = [
    {
        name: "Isabela Martins",
        verified: true,
        level: "platinum",
        badges: ["verified", "top-creator", "trending"],
        bio: "Seja muito bem vindo ao meu mundo secreto! 🤫 Aqui você vê tudo sem censura e com aquela interação que a gente ama. Vem conferir!",
        avatar: "assets/model_upload_12.jpg",
        photos: [
            "assets/Previas Modelos/previas isabelamartins/Captura de tela 2026-01-20 141726.png",
            "assets/Previas Modelos/previas isabelamartins/Captura de tela 2026-01-21 144326.png",
            "assets/Previas Modelos/previas isabelamartins/Captura de tela 2026-01-21 152422.png",
            "assets/Previas Modelos/previas isabelamartins/photo_3_2026-02-01_03-23-26.jpg"
        ],
        stats: { followers: 1560, likes: 8900, posts: 41, views: 25000 },
        achievements: ["100-posts", "1k-likes", "10k-views", "verified", "top-creator", "trending"],
        subscriptionTiers: {
            premium: { price: 39.90, benefits: ["Acesso ao Feed VIP", "Chat Liberado", "Conteúdo Diário"] },
            vip: { price: 99.90, benefits: ["Tudo do Premium", "Vídeos Exclusivos", "Sextou com a Isa (Live)"] }
        }
    },
    {
        name: "Helena Rocha",
        verified: true,
        level: "gold",
        badges: ["verified", "trending"],
        bio: "Carioca da gema 🌊. Pés na areia, olhar travesso. Uma mulher que sabe o que quer e como conseguir. Vem comigo?",
        avatar: "assets/models/novas/helenarocha/perfil.jpg",
        photos: [
            "assets/models/novas/helenarocha/kcu0d8mn.jpg",
            "assets/models/novas/helenarocha/O9PaXpjo.jpg",
            "assets/models/novas/helenarocha/PnnPQvqS.jpg",
            "assets/models/novas/helenarocha/YjUK6tYw.jpg"
        ],
        stats: { followers: 1120, likes: 6800, posts: 38, views: 19500 },
        achievements: ["100-posts", "1k-likes", "10k-views", "verified", "trending"],
        subscriptionTiers: {
            premium: { price: 34.90, benefits: ["Praia Sem Censura", "Chat Aberto", "Conteúdo Semanal"] },
            vip: { price: 84.90, benefits: ["Tudo do Premium", "Vídeos Exclusivos", "Pedidos Personalizados"] }
        }
    },
    {
        name: "Camila Vieira",
        verified: true,
        level: "platinum",
        badges: ["verified", "top-creator", "trending"],
        bio: "Universitária pelo dia, devassa pela noite. 📚🔥 Pronta pra te dar aulas particulares de prazer.",
        avatar: "assets/models/novas/camilavieira/perfil.jpeg",
        photos: [
            "assets/models/novas/camilavieira/D24HYpli.jpeg",
            "assets/models/novas/camilavieira/kzR9OBXw.jpeg",
            "assets/models/novas/camilavieira/O5dojocu.jpeg",
            "assets/models/novas/camilavieira/Q7rOU4Wf.jpeg"
        ],
        stats: { followers: 2340, likes: 17500, posts: 58, views: 62000 },
        achievements: ["100-posts", "1k-likes", "10k-views", "verified", "top-creator", "trending"],
        subscriptionTiers: {
            premium: { price: 44.90, benefits: ["Aulas Particulares", "Stories Exclusivos", "Fotos HD"] },
            vip: { price: 119.90, benefits: ["Tudo Liberado", "Videochamada Privada", "Pacote Mensal"] }
        }
    },
    {
        name: "Yasmin Castro",
        verified: true,
        level: "silver",
        badges: ["verified"],
        bio: "Acabei de chegar na plataforma 💋. Curiosa, safada e disposta a tudo. Vamos explorar juntos?",
        avatar: "assets/models/novas/yasmincastro/perfil.jpeg",
        photos: [
            "assets/models/novas/yasmincastro/eSRFLpGZ.jpeg",
            "assets/models/novas/yasmincastro/np48l3s8.jpeg",
            "assets/models/novas/yasmincastro/pzxnYBhZ.jpeg",
            "assets/models/novas/yasmincastro/T6Omwm5l.jpeg"
        ],
        stats: { followers: 380, likes: 1450, posts: 12, views: 4800 },
        achievements: ["1k-likes", "verified"],
        subscriptionTiers: {
            premium: { price: 19.90, benefits: ["Conteúdo Exclusivo", "Chat Comigo", "Fotos Inéditas"] },
            vip: { price: 54.90, benefits: ["Vídeos +18", "Áudios Picantes", "Pedidos Liberados"] }
        }
    },
    {
        name: "Júlia Rezende",
        verified: true,
        level: "gold",
        badges: ["verified"],
        bio: "Loira do Sul ❄️. Frio lá fora, fogo aqui dentro. Gosto de conversar antes e te mimar depois.",
        avatar: "assets/models/novas/juliarezende/perfil.jpeg",
        photos: [
            "assets/models/novas/juliarezende/5DdHuhKq.jpeg",
            "assets/models/novas/juliarezende/68Vgk9eY.jpeg",
            "assets/models/novas/juliarezende/PNtuJDVO.jpeg",
            "assets/models/novas/juliarezende/weI07nKS.jpeg"
        ],
        stats: { followers: 890, likes: 4900, posts: 28, views: 14000 },
        achievements: ["100-posts", "1k-likes", "10k-views", "verified"],
        subscriptionTiers: {
            premium: { price: 32.90, benefits: ["Feed Premium", "Chat Aberto", "Conteúdo Semanal"] },
            vip: { price: 79.90, benefits: ["Vídeos Exclusivos", "Lives Privadas", "Mimos no DM"] }
        }
    },
    {
        name: "Sophia Mendes",
        verified: true,
        level: "platinum",
        badges: ["verified", "top-creator"],
        bio: "Modelo internacional 🌍. Já desfilei em Milão, agora estou aqui só pra você. Puro luxo, puro prazer.",
        avatar: "assets/models/novas/sophiamendes/perfil.jpeg",
        photos: [
            "assets/models/novas/sophiamendes/gjF4TfOw.jpeg",
            "assets/models/novas/sophiamendes/HmEBLRoi.jpeg",
            "assets/models/novas/sophiamendes/jpWBfQTl.jpeg",
            "assets/models/novas/sophiamendes/yAOxJpT3.jpeg"
        ],
        stats: { followers: 2780, likes: 19500, posts: 64, views: 71000 },
        achievements: ["100-posts", "1k-likes", "10k-views", "verified", "top-creator"],
        subscriptionTiers: {
            premium: { price: 49.90, benefits: ["Ensaios Profissionais", "Bastidores", "Stories Diários"] },
            vip: { price: 139.90, benefits: ["Tudo Incluso", "Sessões Exclusivas 4K", "Atendimento VIP"] }
        }
    },
    {
        name: "Letícia Andrade",
        verified: true,
        level: "silver",
        badges: ["verified"],
        bio: "Pequena, mas com personalidade gigante. 🍒 Doce no rosto, pecaminosa no resto. Vem descobrir.",
        avatar: "assets/models/novas/leticiaandrade/perfil.jpeg",
        photos: [
            "assets/models/novas/leticiaandrade/DZAGd32f.jpeg",
            "assets/models/novas/leticiaandrade/LPjNQNWY.jpeg",
            "assets/models/novas/leticiaandrade/lQQgGI6J.jpeg",
            "assets/models/novas/leticiaandrade/mO9zAxU8.jpeg"
        ],
        stats: { followers: 540, likes: 2100, posts: 15, views: 6300 },
        achievements: ["100-posts", "1k-likes", "verified"],
        subscriptionTiers: {
            premium: { price: 22.90, benefits: ["Fotos Ousadas", "Chat Liberado", "Mural de Recados"] },
            vip: { price: 64.90, benefits: ["Vídeos Caseiros", "Áudios Quentes", "Pedidos Aceitos"] }
        }
    },
    {
        name: "Gabriela Moura",
        verified: true,
        level: "gold",
        badges: ["verified", "trending"],
        bio: "Mineira da gema, cintura fina e jeitinho manhoso 💛. Uai sô, cê vai amar o que tô preparando aqui...",
        avatar: "assets/models/novas/gabrielamoura/perfil.jpeg",
        photos: [
            "assets/models/novas/gabrielamoura/1W3e36mz.jpeg",
            "assets/models/novas/gabrielamoura/FzNf97jW.jpeg",
            "assets/models/novas/gabrielamoura/TWdpY5rT.jpeg",
            "assets/models/novas/gabrielamoura/Yw2abL5J.jpeg"
        ],
        stats: { followers: 1340, likes: 7800, posts: 36, views: 21500 },
        achievements: ["100-posts", "1k-likes", "10k-views", "verified", "trending"],
        subscriptionTiers: {
            premium: { price: 36.90, benefits: ["Fotos Inéditas", "Chat 24h", "Conteúdo Diário"] },
            vip: { price: 89.90, benefits: ["Vídeos Sem Cortes", "Live Privada", "Pacote Surpresa"] }
        }
    },
    {
        name: "Mariana Pires",
        verified: true,
        level: "silver",
        badges: ["verified"],
        bio: "Apaixonada por academia 🏋️‍♀️. Bumbum durinho, abdômen trincado. Tudo natural pra te enlouquecer.",
        avatar: "assets/models/novas/marianapires/perfil.jpeg",
        photos: [
            "assets/models/novas/marianapires/4S45lndb.jpeg",
            "assets/models/novas/marianapires/tbJKOdpr.jpeg",
            "assets/models/novas/marianapires/UGN41Uiy.jpeg",
            "assets/models/novas/marianapires/x42mRyVW.jpeg"
        ],
        stats: { followers: 720, likes: 3400, posts: 22, views: 9800 },
        achievements: ["100-posts", "1k-likes", "verified"],
        subscriptionTiers: {
            premium: { price: 27.90, benefits: ["Treino Sensual", "Pós-Treino", "Dicas Fitness"] },
            vip: { price: 74.90, benefits: ["Vídeos no Vestiário", "Sessões Quentes", "Plano de Treino +18"] }
        }
    },
    {
        name: "Bianca Cardoso",
        verified: true,
        level: "platinum",
        badges: ["verified", "top-creator", "trending"],
        bio: "Ruiva de corpinho perfeito 🔥. Diz a lenda que ruiva é fogo… vem comprovar pessoalmente.",
        avatar: "assets/models/novas/biancacardoso/perfil.jpeg",
        photos: [
            "assets/models/novas/biancacardoso/cPQgIUyp.jpeg",
            "assets/models/novas/biancacardoso/Dx0G4QDy.jpeg",
            "assets/models/novas/biancacardoso/GiTmHtLD.jpeg",
            "assets/models/novas/biancacardoso/ZYTfmYAx.jpeg"
        ],
        stats: { followers: 3450, likes: 24000, posts: 67, views: 89000 },
        achievements: ["100-posts", "1k-likes", "10k-views", "verified", "top-creator", "trending"],
        subscriptionTiers: {
            premium: { price: 54.90, benefits: ["Feed Sem Censura", "Chat Direto", "Stories Exclusivos"] },
            vip: { price: 149.90, benefits: ["Tudo Incluso", "Videochamada Mensal", "Pacote Personalizado"] }
        }
    },
    {
        name: "Carolina Duarte",
        verified: true,
        level: "gold",
        badges: ["verified"],
        bio: "Médica formada que descobriu uma nova vocação 🩺. Vou cuidar muito bem de você, prometo.",
        avatar: "assets/models/novas/carolinaduarte/perfil.jpeg",
        photos: [
            "assets/models/novas/carolinaduarte/5fO4qDWv.jpeg",
            "assets/models/novas/carolinaduarte/76b2Lfty.jpeg",
            "assets/models/novas/carolinaduarte/HG8sjGYa4AAWL0M.jpg",
            "assets/models/novas/carolinaduarte/pQ3w1AsA.jpeg"
        ],
        stats: { followers: 1080, likes: 5600, posts: 33, views: 17200 },
        achievements: ["100-posts", "1k-likes", "10k-views", "verified"],
        subscriptionTiers: {
            premium: { price: 39.90, benefits: ["Consulta Privada", "Bastidores", "Fotos Sem Jaleco"] },
            vip: { price: 94.90, benefits: ["Tratamento Intensivo", "Vídeos Exclusivos", "Atendimento 24h"] }
        }
    },
    {
        name: "Vitória Antunes",
        verified: true,
        level: "bronze",
        badges: ["trending"],
        bio: "Estreando aqui hoje! 🥺 Aceito sugestões, pedidos e feedbacks. Curiosa pra te conhecer melhor.",
        avatar: "assets/models/novas/vitoriaantunes/perfil.jpg",
        photos: [
            "assets/models/novas/vitoriaantunes/photo_1_2026-05-14_02-45-09.jpg",
            "assets/models/novas/vitoriaantunes/photo_2_2026-05-14_02-45-09.jpg",
            "assets/models/novas/vitoriaantunes/photo_3_2026-05-14_02-45-09.jpg",
            "assets/models/novas/vitoriaantunes/photo_4_2026-05-14_02-45-09.jpg"
        ],
        stats: { followers: 145, likes: 520, posts: 5, views: 1100 },
        achievements: ["1k-likes", "trending"],
        subscriptionTiers: {
            premium: { price: 14.90, benefits: ["Apoie meu Início", "Fotos Diárias", "Chat Aberto"] },
            vip: { price: 39.90, benefits: ["Vídeos de Estreia", "Pedido Personalizado", "Atenção Total"] }
        }
    },
    {
        name: "Rafaela Borges",
        verified: true,
        level: "silver",
        badges: ["verified"],
        bio: "Chefe de cozinha, mas o prato principal sou eu 🍽️🔥. Servida com molho extra.",
        avatar: "assets/models/novas/rafaelaborges/photo_1_2026-05-14_02-44-16.jpg",
        photos: [
            "assets/models/novas/rafaelaborges/photo_2_2026-05-14_02-44-16.jpg",
            "assets/models/novas/rafaelaborges/photo_3_2026-05-14_02-44-16.jpg",
            "assets/models/novas/rafaelaborges/photo_4_2026-05-14_02-44-16.jpg",
            "assets/models/novas/rafaelaborges/photo_5_2026-05-14_02-44-16.jpg"
        ],
        stats: { followers: 620, likes: 2700, posts: 19, views: 7400 },
        achievements: ["100-posts", "1k-likes", "verified"],
        subscriptionTiers: {
            premium: { price: 24.90, benefits: ["Receita Picante", "Bastidores Cozinha", "Fotos com Avental"] },
            vip: { price: 64.90, benefits: ["Vídeos Sem Avental", "Chat Direto", "Pedido do Dia"] }
        }
    },
    {
        name: "Manuela Cunha",
        verified: true,
        level: "gold",
        badges: ["verified"],
        bio: "Bailarina clássica desde os 5 anos 🩰. Flexibilidade total, pra todos os gostos.",
        avatar: "assets/models/novas/manuelacunha/perfil.jpg",
        photos: [
            "assets/models/novas/manuelacunha/photo_2_2026-05-14_02-45-01.jpg",
            "assets/models/novas/manuelacunha/photo_3_2026-05-14_02-45-01.jpg",
            "assets/models/novas/manuelacunha/photo_4_2026-05-14_02-45-01.jpg",
            "assets/models/novas/manuelacunha/photo_5_2026-05-14_02-45-01.jpg"
        ],
        stats: { followers: 1180, likes: 6300, posts: 30, views: 16800 },
        achievements: ["100-posts", "1k-likes", "10k-views", "verified"],
        subscriptionTiers: {
            premium: { price: 36.90, benefits: ["Sessão de Alongamento", "Bastidores", "Fotos Sensuais"] },
            vip: { price: 89.90, benefits: ["Coreografia Exclusiva", "Vídeos Privados", "Apresentação Personalizada"] }
        }
    },
    {
        name: "Lorena Bittencourt",
        verified: true,
        level: "silver",
        badges: ["verified"],
        bio: "Empresária de dia, sem pudor de noite 💼. Trato meus assinantes como sócios privilegiados.",
        avatar: "assets/models/novas/lorenabittencourt/perfil.jpg",
        photos: [
            "assets/models/novas/lorenabittencourt/photo_2_2026-05-14_02-44-47.jpg",
            "assets/models/novas/lorenabittencourt/photo_3_2026-05-14_02-44-47.jpg",
            "assets/models/novas/lorenabittencourt/photo_4_2026-05-14_02-44-47.jpg",
            "assets/models/novas/lorenabittencourt/photo_5_2026-05-14_02-44-47.jpg"
        ],
        stats: { followers: 670, likes: 2900, posts: 21, views: 8900 },
        achievements: ["100-posts", "1k-likes", "verified"],
        subscriptionTiers: {
            premium: { price: 29.90, benefits: ["Reunião Privada", "Conteúdo Executivo", "Chat Direto"] },
            vip: { price: 79.90, benefits: ["Sócio VIP", "Videochamadas", "Conteúdo Sob Medida"] }
        }
    },
    {
        name: "Antonella Ribeiro",
        verified: true,
        level: "platinum",
        badges: ["verified", "top-creator"],
        bio: "Italiana descendente 🇮🇹. Bocca dolce, cuore caldo. Ciao amore, vem pra mim e esquece o resto.",
        avatar: "assets/models/novas/antonellaribeiro/perfil.jpg",
        photos: [
            "assets/models/novas/antonellaribeiro/photo_2_2026-05-14_02-44-33.jpg",
            "assets/models/novas/antonellaribeiro/photo_3_2026-05-14_02-44-33.jpg",
            "assets/models/novas/antonellaribeiro/photo_4_2026-05-14_02-44-33.jpg",
            "assets/models/novas/antonellaribeiro/photo_5_2026-05-14_02-44-33.jpg"
        ],
        stats: { followers: 2150, likes: 14500, posts: 52, views: 47000 },
        achievements: ["100-posts", "1k-likes", "10k-views", "verified", "top-creator"],
        subscriptionTiers: {
            premium: { price: 47.90, benefits: ["Dolce Vita", "Stories Diários", "Fotos Exclusivas"] },
            vip: { price: 124.90, benefits: ["Tudo Incluso", "Vídeos Privados", "Atendimento VIP"] }
        }
    }
];

// Helper Functions
function formatNumber(num) {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
}

function getCreatorLevel(followers) {
    for (const [key, level] of Object.entries(LEVELS)) {
        if (followers >= level.min && followers < level.max) {
            return { key, ...level };
        }
    }
    return LEVELS.bronze;
}

function createBadgeHTML(badgeKey) {
    const achievement = ACHIEVEMENTS[badgeKey];
    if (!achievement) return '';

    return `<span class="badge badge-verified" title="${achievement.name}">${achievement.icon}</span>`;
}

function createLevelBadgeHTML(levelKey) {
    const level = LEVELS[levelKey];
    if (!level) return '';

    return `<span class="badge-level ${level.class}">${level.icon} ${level.name}</span>`;
}

// XSS Sanitization Helper
function sanitizeHTML(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

// Render Creators Grid
function renderCreators() {
    const grid = document.getElementById('creatorsGrid');
    if (!grid) return;

    grid.innerHTML = creatorsData.map((creator, index) => `
        <a href="model-profile.html?id=${index}" class="creator-card" style="text-decoration: none; color: inherit;">
            <div class="card-image-container">
                <img src="${sanitizeHTML(creator.avatar || creator.photos[0])}" class="creator-image" loading="lazy" alt="${sanitizeHTML(creator.name)}" style="object-position: ${creator.objectPosition || 'center'};">
            </div>
            <div class="card-content">
                <div class="creator-header">
                    <div class="creator-name">${sanitizeHTML(creator.name)}</div>
                    <div class="creator-badges">
                        ${creator.verified ? '<span class="badge badge-verified">✓</span>' : ''}
                    </div>
                </div>
                ${createLevelBadgeHTML(creator.level)}
                <div class="creator-stats">
                    <span>👁️ ${formatNumber(creator.stats.views)}</span>
                    <span>❤️ ${formatNumber(creator.stats.likes)}</span>
                </div>
                    <button class="btn-subscribe" id="btnSubscribe" onclick="event.preventDefault(); event.stopPropagation(); openCheckoutModal(${index}, 'premium')">Assinar Premium</button>
            </div>
        </a>
    `).join('');
}

// Full Profile Page Logic
// Full Profile Page Logic (HIGH CONVERSION REDESIGN)
function renderFullProfilePage(index) {
    const creator = creatorsData[index];
    const container = document.getElementById('profileContainer');

    if (!creator || !container) return;

    // Remove old classes if any
    container.className = '';

    // Generate Premium Landing Page HTML
    const verifiedBadgeProfile = `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="vertical-align: bottom;">
            <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM10 17L5 12L6.41 10.59L10 14.17L17.59 6.58L19 8L10 17Z" fill="var(--gold-premium)"/>
            <circle cx="12" cy="12" r="11" stroke="var(--gold-premium)" stroke-width="1.5"/>
        </svg>
    `;

    container.innerHTML = `
        <div class="premium-profile-wrapper">
            
            <!-- 1. HEADER (Fixed Premium) -->
            <header class="pp-header">
                <div class="pp-cover" style="background-image: url('${creator.avatar || creator.photos[0]}'); background-position: ${creator.objectPosition || 'center'};"></div>
                
                <div class="pp-header-content">
                    <div class="pp-avatar" onclick="openImageModal('${creator.avatar || creator.photos[0]}')" style="background-image: url('${creator.avatar || creator.photos[0]}'); background-position: ${creator.objectPosition || 'center'}; cursor: pointer;"></div>
                    
                    <h1 class="pp-name">${sanitizeHTML(creator.name)}</h1>
                    <div class="pp-handle">@${sanitizeHTML(creator.name.replace(/\s+/g, '').toLowerCase())}</div>
                    
                    ${creator.verified ?
            `<div style="display:flex; align-items:center; justify-content:center; gap:6px; margin-top:5px; margin-bottom:15px; color:var(--gold-premium); font-size:0.85rem; font-weight:700; letter-spacing:1.5px;">
                            VERIFICADO ${verifiedBadgeProfile}
                         </div>`
            : ''}
                    
                    <p class="pp-bio">${sanitizeHTML(creator.bio)}</p>
                    
                    <!-- Horizontal Stats -->
                    <div class="pp-stats-row-horizontal">
                        <div class="pp-stat-h"><strong>${creator.stats.posts}</strong> Posts</div>
                        <div class="pp-stat-h"><strong>${formatNumber(creator.stats.likes)}</strong> Likes</div>
                        <div class="pp-stat-h"><strong>${formatNumber(creator.stats.followers)}</strong> Membros</div>
                    </div>
                    
                    <div class="pp-actions">
                        <button class="btn-pp-primary" onclick="openCheckoutModal(${index}, 'vip')">
                            🔥 Acessar Conteúdo Exclusivo
                        </button>
                        <a href="chat.html?id=${index}" class="btn-pp-outline" style="text-decoration:none;display:inline-flex;align-items:center;justify-content:center;">
                            💬 Conversar com ${sanitizeHTML(creator.name.split(' ')[0])}
                        </a>
                    </div>
                </div>
            </header>

            <!-- 2. MAIN GRID (Content + Sidebar) -->
            <div class="pp-main-grid">
                
                <!-- FEED SECTION -->
                <section class="pp-content">
                    
                    <!-- MONETIZATION BLOCK (New) -->
                    <div class="pp-monetization-block">
                        <div class="pp-monetization-title">Plano Exclusivo VIP</div>
                        
                        <div class="pp-monetization-features">
                            <div class="pp-feature-item"><span class="pp-feature-check">✓</span> Vídeos completos sem cortes</div>
                            <div class="pp-feature-item"><span class="pp-feature-check">✓</span> Conteúdo exclusivo diário</div>
                            <div class="pp-feature-item"><span class="pp-feature-check">✓</span> Acesso ao grupo VIP</div>
                            <div class="pp-feature-item"><span class="pp-feature-check">✓</span> Conteúdo sem censura</div>
                        </div>

                        <div class="pp-monetization-price">
                            <div class="pp-price-large">R$ ${creator.subscriptionTiers.vip.price.toFixed(0)}</div>
                            <div class="pp-price-period">/mês</div>
                        </div>

                        <button class="btn-pp-primary" style="width:100%; font-size:1.1rem; padding:18px;" onclick="openCheckoutModal(${index}, 'vip')">
                            ASSINAR AGORA
                        </button>
                    </div>

                    <div class="pp-section-title">PRÉVIA DO CONTEÚDO</div>
                    
                    <div class="pp-feed-grid">
                        ${creator.photos.slice(0, 9).map((photo, i) => {
                // Lock logic: 4 free previews for all models
                const freeCount = 4;
                const isLocked = i >= freeCount;
                return `
                                <div class="pp-post-item ${isLocked ? 'pp-locked-container' : ''}" onclick="${isLocked ? "alert('Conteúdo Exclusivo! Assine para ver.')" : "openSwipeGallery(" + index + ", " + i + ")"}">
                                    <img src="${photo}" class="pp-post-img ${isLocked ? 'pp-locked' : ''}" loading="lazy" alt="Post">
                                    
                                    
                                    
                                    ${isLocked ? `
                                        <div class="pp-post-badge-premium">🔒 PREMIUM</div>
                                        <div class="pp-lock-overlay">
                                            <div class="pp-lock-icon">🔒</div>
                                            <span class="pp-lock-text">ASSINE PARA VER</span>
                                        </div>
                                    ` : ''}
                                </div>
                            `;
            }).join('')}
                    </div>

                    <div class="pp-feed-cta">
                        <h3>Quer ver +${creator.stats.posts - 9} fotos e vídeos?</h3>
                        <p style="color:#aaa; margin-bottom:15px;">Desbloqueie acesso completo agora mesmo.</p>
                        <button class="btn-pp-primary" style="max-width: 300px; margin: 0 auto;" onclick="openCheckoutModal(${index}, 'vip')">
                            DESBLOQUEAR ACESSO VIP
                        </button>
                    </div>
                </section>

                <!-- STICKY SIDEBAR (Desktop) -->
                <aside class="pp-sidebar">
                    <div class="pp-offer-title">OFERTA LIMITADA</div>
                    
                    <div class="pp-price-box">
                        <span class="pp-price">R$ ${creator.subscriptionTiers.vip.price.toFixed(0)}</span>
                        <span class="pp-period">/mês</span>
                    </div>

                    <ul class="pp-benefits">
                        <li>Acesso Imediato a tudo</li>
                        <li>Fotos e Vídeos Completos</li>
                        <li>Chat Direto Comigo</li>
                        <li>Lives Exclusivas</li>
                    </ul>

                    <button class="btn-pp-primary" style="width: 100%;" onclick="openCheckoutModal(${index}, 'vip')">
                        ASSINAR AGORA
                    </button>
                    <div style="text-align: center; margin-top: 10px; font-size: 0.8rem; color: #777;">
                        Cancelamento a qualquer momento
                    </div>
                </aside>

            </div>

            <!-- MOBILE STICKY BUTTON -->
            <a href="javascript:void(0)" class="pp-mobile-sticky-btn" onclick="document.querySelector('.pp-section-title').scrollIntoView({behavior:'smooth'})">
                👀 VER PRÉVIAS GRÁTIS
            </a>

        </div>
    `;
}

// Mobile Swipe Gallery implementation
function openSwipeGallery(creatorIndex, startIndex) {
    const creator = creatorsData[creatorIndex];
    // Pegar apenas as fotos desbloqueadas (4 para todas as modelos)
    const freeCount = 4;
    window.currentGalleryPhotos = creator.photos.slice(0, freeCount);
    window.currentGalleryIndex = startIndex;

    if (!window.galleryModalElement) {
        const modal = document.createElement('div');
        modal.id = 'swipeGalleryModal';
        modal.className = 'swipe-gallery-modal';
        document.body.appendChild(modal);
        window.galleryModalElement = modal;

        const style = document.createElement('style');
        style.innerHTML = `
            .swipe-gallery-modal {
                position: fixed; top: 0; left: 0; width: 100%; height: 100%;
                background: rgba(30, 30, 30, 0.95); z-index: 10000; display: none;
                flex-direction: column; align-items: center; justify-content: center;
                overflow: hidden;
            }
            .swipe-gallery-modal.active { display: flex; }
            .swipe-gallery-close {
                position: absolute; top: 15px; right: 15px; color: white;
                font-size: 35px; cursor: pointer; z-index: 10001;
                width: 40px; height: 40px; text-align: center; line-height: 40px;
                background: rgba(0,0,0,0.4); border-radius: 50%;
            }
            .swipe-gallery-container {
                width: auto; height: auto; max-width: 90vw; max-height: 85vh;
                display: flex; align-items: center; justify-content: center;
                position: relative; border-radius: 8px; overflow: hidden;
                background: transparent;
            }
            .swipe-gallery-img {
                max-width: 100%; max-height: 85vh; object-fit: contain;
                display: block; transition: opacity 0.3s ease;
                user-select: none; -webkit-user-drag: none; border-radius: 8px;
            }
            .swipe-gallery-nav {
                position: absolute; top: 50%; transform: translateY(-50%);
                color: white; font-size: 40px; cursor: pointer; z-index: 10001;
                background: rgba(0,0,0,0.4); border-radius: 50%; width: 50px; height: 50px;
                display: flex; align-items: center; justify-content: center; user-select: none;
            }
            .swipe-gal-prev { left: 10px; }
            .swipe-gal-next { right: 10px; }
            .swipe-gallery-dots {
                position: absolute; bottom: 20px; left: 0; width: 100%;
                display: flex; justify-content: center; gap: 8px; z-index: 10001;
            }
            .swipe-gallery-dot {
                width: 8px; height: 8px; border-radius: 50%; background: rgba(255,255,255,0.3);
                transition: background 0.3s;
            }
            .swipe-gallery-dot.active { background: white; }
            @media (max-width: 768px) {
                .swipe-gallery-nav { display: none; /* Hide arrows on mobile */ }
            }
        `;
        document.head.appendChild(style);

        modal.innerHTML = `
            <div class="swipe-gallery-close" onclick="closeSwipeGallery()">&times;</div>
            <div class="swipe-gallery-nav swipe-gal-prev" onclick="handleGallerySwipe(-1)">&#10094;</div>
            <div class="swipe-gallery-nav swipe-gal-next" onclick="handleGallerySwipe(1)">&#10095;</div>
            <div class="swipe-gallery-container" id="galleryContainer" 
                 ontouchstart="handleGalleryTouchStart(event)" 
                 ontouchend="handleGalleryTouchEnd(event)">
                <img id="galleryImg" class="swipe-gallery-img" src="" alt="Gallery Image">
            </div>
            <div id="galleryDots" class="swipe-gallery-dots"></div>
        `;

        modal.onclick = (e) => {
            if (e.target === modal) {
                window.closeSwipeGallery();
            }
        };

        window.touchStartX = 0;
        window.handleGalleryTouchStart = (e) => { window.touchStartX = e.changedTouches[0].screenX; };
        window.handleGalleryTouchEnd = (e) => {
            const touchEndX = e.changedTouches[0].screenX;
            if (touchEndX < window.touchStartX - 50) handleGallerySwipe(1);
            else if (touchEndX > window.touchStartX + 50) handleGallerySwipe(-1);
        };
        window.handleGallerySwipe = (dir) => {
            const newIndex = window.currentGalleryIndex + dir;
            if (newIndex >= 0 && newIndex < window.currentGalleryPhotos.length) {
                window.currentGalleryIndex = newIndex;
                updateGalleryView();
            }
        };
        window.updateGalleryView = () => {
            const img = document.getElementById('galleryImg');
            img.style.opacity = '0';
            setTimeout(() => {
                img.src = window.currentGalleryPhotos[window.currentGalleryIndex];
                img.style.opacity = '1';
                document.getElementById('galleryDots').innerHTML = window.currentGalleryPhotos.map((_, i) =>
                    '<div class="swipe-gallery-dot ' + (i === window.currentGalleryIndex ? 'active' : '') + '"></div>'
                ).join('');
            }, 150);
        };
        window.closeSwipeGallery = () => {
            modal.classList.remove('active');
            document.body.style.overflow = '';
        };
    }

    window.galleryModalElement.classList.add('active');
    document.body.style.overflow = 'hidden';
    window.updateGalleryView();
}



// Profile Modal (Kept for compatibility if needed, but not used in main flow anymore)
let currentCreatorIndex = null;
// ... existing modal functions can stay or be removed if strictly not needed
// modifying existing logic to be simpler if we don't need the modal
// But for now, I'll essentially replace the rendering part to safe-guard

// --- Embedded Checkout Logic ---

function openCheckoutModal(creatorIndex, planType) {
    const creator = creatorsData[creatorIndex];
    let plan;
    let titleText = "Pagamento Seguro";
    let subtitleText = "Desbloqueio Imediato via PIX";
    let planNameText = "";

    plan = creator.subscriptionTiers[planType];
    planNameText = planType === 'vip' ? 'Acesso VIP' : 'Plano Premium';

    document.getElementById('checkoutCreatorAvatar').src = creator.avatar || creator.photos[0];
    document.getElementById('checkoutCreatorName').textContent = creator.name;
    document.getElementById('checkoutPlanName').textContent = planNameText;
    document.getElementById('checkoutPrice').textContent = `R$ ${plan.price.toFixed(2).replace('.', ',')}`;

    // Update Dynamic Headers (if they exist)
    const titleEl = document.getElementById('checkoutModalTitle');
    const subtitleEl = document.getElementById('checkoutModalSubtitle');
    if (titleEl) titleEl.textContent = titleText;
    if (subtitleEl) subtitleEl.textContent = subtitleText;

    document.getElementById('checkoutModal').classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeCheckoutModal() {
    document.getElementById('checkoutModal').classList.remove('active');
    document.body.style.overflow = '';

    // Reset PIX UI
    const pixArea = document.getElementById('pixDisplayArea');
    if (pixArea) pixArea.style.display = 'none';
    const btn = document.getElementById('btnProcessPayment');
    if (btn) {
        btn.style.display = 'block';
        btn.disabled = false;
        btn.innerHTML = 'GERAR PIX AGORA';
    }
}



function selectPayment(method) {
    if (method === 'pix') {
        document.getElementById('btnPix').classList.add('active');
    }
}

// Backend API URL — monorepo Vercel (frontend + backend no mesmo deploy)
const API_BASE_URL = window.location.hostname.includes('localhost') || window.location.hostname.includes('127.0.0.1')
    ? 'http://localhost:3000/api'
    : '/api';

function processPayment() {
    const btn = document.getElementById('btnProcessPayment');
    const originalText = btn.innerHTML;
    btn.innerHTML = `<span style="display:inline-block; animation: spin 1s linear infinite;">↻</span> Gerando PIX...`;
    btn.disabled = true;

    const priceStr = document.getElementById('checkoutPrice').textContent;
    const price = parseFloat(priceStr.replace('R$ ', '').replace(',', '.'));
    const description =
        'OnlyModels ' +
        document.getElementById('checkoutPlanName').textContent +
        ' - ' +
        document.getElementById('checkoutCreatorName').textContent;

    fetch(`${API_BASE_URL}/create-pix`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transactionAmount: price, description }),
    })
        .then(r => r.json())
        .then(data => {
            if (data.error) {
                alert('Erro ao gerar PIX: ' + data.error);
                btn.innerHTML = originalText;
                btn.disabled = false;
                return;
            }
            document.getElementById('pixQrCodeImage').src = data.qr_code_image_url;
            document.getElementById('pixCodeInput').value = data.qr_code;
            document.getElementById('pixDisplayArea').style.display = 'block';
            btn.style.display = 'none';
            document.getElementById('pixDisplayArea').scrollIntoView({ behavior: 'smooth' });
        })
        .catch(err => {
            console.error('Error calling server:', err);
            alert('Erro ao conectar com o servidor.');
            btn.innerHTML = originalText;
            btn.disabled = false;
        });
}

function copyPixCode() {
    const copyText = document.getElementById("pixCodeInput");
    copyText.select();
    copyText.setSelectionRange(0, 99999); // For mobile devices
    navigator.clipboard.writeText(copyText.value);
    alert("Código PIX Copia e Cola copiado com sucesso!");
}

// Utility to mix array
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// Generate Feed Data
function generateFeedData() {
    let posts = [];
    creatorsData.forEach((creator, index) => {
        creator.photos.forEach((photo, photoIndex) => {
            const handle = '@' + creator.name.toLowerCase().replace(/\s+/g, '');
            posts.push({
                creatorIndex: index,
                creatorName: creator.name,
                creatorHandle: handle,
                creatorAvatar: creator.avatar || creator.photos[0], // Use first photo as avatar
                verified: creator.verified,
                level: creator.level, // Pass level for gold badge logic
                image: photo,
                likes: Math.floor(Math.random() * 5000) + 500,
                timeAgo: Math.floor(Math.random() * 23) + 1 + 'h',
                caption: `Corre lá no meu perfil ver o resto! 🔥 #${creator.name.replace(/\s/g, '')} #OnlyModels`
            });
        });
    });
    return shuffleArray(posts);
}

// Render Stories
function renderStories() {
    const container = document.getElementById('storiesContainer');
    if (!container) return;

    container.innerHTML = creatorsData.map((creator, index) => `
        <div class="story-item" onclick="openStory(${index})">
            <div class="story-ring ${creator.stories ? '' : (Math.random() > 0.7 ? 'seen' : '')}" style="${creator.stories ? 'border-color: #00e676;' : ''}">
                <div class="story-avatar" style="background-image: url('${creator.avatar || creator.photos[0]}')"></div>
            </div>
            <span class="story-name">${sanitizeHTML(creator.name.split(' ')[0])}</span>
        </div>
    `).join('');
}

// --- HOME PAGE LOGIC (MARKETPLACE REDESIGN) ---

function renderHomeMarketplace() {
    const container = document.getElementById('feedContainer');
    if (!container) return;

    // Clear existing content
    container.innerHTML = '';
    container.className = 'home-wrapper';

    // 1. HERO SECTION
    const heroSection = document.createElement('section');
    heroSection.className = 'home-hero';
    heroSection.innerHTML = `
        <div class="home-hero-content">
            <h1>DESCUBRA NOSSAS <br> <span style="color:var(--gold-premium)">MODELOS EXCLUSIVAS</span></h1>
            <p>Acesso direto aos perfis mais desejados da plataforma. Sem censura, sem limites.</p>
            <div class="home-hero-actions">
                <button class="btn-pp-primary" onclick="document.getElementById('featuredSection').scrollIntoView({behavior: 'smooth'})">Explorar Modelos</button>
                <button class="btn-pp-outline">Tornar-se Modelo</button>
            </div>
        </div>
    `;
    container.appendChild(heroSection);

    // Marquee Section (Moved from top of screen)
    const marqueeSection = document.createElement('div');
    marqueeSection.className = 'urgent-news-marquee';
    marqueeSection.innerHTML = `
        <div class="marquee-content">
            <span class="news-item"><span class="pulse-dot"></span> <strong>Isabela Martins</strong> acabou de responder aos assinantes VIP.</span>
            <span class="news-item"><span class="pulse-dot"></span> <strong>Camila Vieira</strong> enviou uma mídia secreta no privado.</span>
            <span class="news-item"><span class="pulse-dot"></span> Restam apenas 3 vagas com desconto para o VIP da <strong>Bianca Cardoso</strong>.</span>
            <span class="news-item"><span class="pulse-dot"></span> <strong>Sophia Mendes</strong> acessou a plataforma agora.</span>
        </div>
    `;
    container.appendChild(marqueeSection);

    // 2. FEATURED SECTION (Marketplace Grid) — paginated
    const currentPage = getCurrentPage();
    const totalPages = getTotalPages();
    const sliceStart = currentPage * MODELS_PER_PAGE;
    const sliceEnd = sliceStart + MODELS_PER_PAGE;
    const pagedCreators = creatorsData.slice(sliceStart, sliceEnd);

    const featuredSection = document.createElement('section');
    featuredSection.id = 'featuredSection';
    featuredSection.className = 'home-section';
    featuredSection.innerHTML = `
        <div class="home-section-title">Modelos em Destaque</div>
        <div class="marketplace-grid">
            ${pagedCreators.map((creator, localIndex) => {
        const index = sliceStart + localIndex;
        // Mock Category for Premium Feel
        const categories = ['VIP • Exclusiva', 'Top 1% Global', 'Novidade', 'Trending', 'Diamond', 'Creator'];
        const randomCategory = categories[index % categories.length];

        const verifiedBadge = `
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="margin-left:4px; vertical-align: middle;">
                <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM10 17L5 12L6.41 10.59L10 14.17L17.59 6.58L19 8L10 17Z" fill="var(--gold-premium)"/>
                <circle cx="12" cy="12" r="11" stroke="var(--gold-premium)" stroke-width="1.5"/>
            </svg>
        `;

        return `
                    <a href="model-profile.html?id=${index}" class="marketplace-card" onclick="saveHomeScroll()">
                        <div class="mp-card-img-container">
                            <img src="${creator.avatar || creator.photos[0]}" class="mp-card-img" loading="lazy" alt="${creator.name}">

                            <!-- New Gradient Overlay Content -->
                            <div class="mp-card-overlay">
                                <div class="mp-card-category">${randomCategory}</div>
                                <div class="mp-card-name">
                                    ${sanitizeHTML(creator.name)}
                                    ${creator.verified ? verifiedBadge : ''}
                                </div>
                            </div>
                        </div>

                        <!-- Solid Gold Button Area -->
                        <div class="mp-card-actions">
                            <button class="mp-card-btn">VER PERFIL</button>
                        </div>
                    </a>
                `;
    }).join('')}
        </div>
        ${totalPages > 1 ? `
            <nav class="pagination-nav" aria-label="Paginação de modelos">
                ${PAGE_FILES.slice(0, totalPages).map((file, i) => `
                    <a href="${file}"
                       class="pagination-btn ${i === currentPage ? 'active' : ''}"
                       aria-current="${i === currentPage ? 'page' : 'false'}">
                        ${i + 1}
                    </a>
                `).join('')}
            </nav>
        ` : ''}
    `;
    container.appendChild(featuredSection);

    // 3. TRENDING SECTION — fotos paisagem (ratio > 1.3) selecionadas manualmente
    const trendingPicks = [
        { idx: 5, photo: 'assets/models/novas/sophiamendes/jpWBfQTl.jpeg' }, // Sophia Mendes — 1.42
        { idx: 2, photo: 'assets/models/novas/camilavieira/kzR9OBXw.jpeg' }, // Camila Vieira — 1.33
        { idx: 1, photo: 'assets/models/novas/helenarocha/kcu0d8mn.jpg' }    // Helena Rocha — 1.33
    ];

    const trendingSection = document.createElement('section');
    trendingSection.className = 'home-section';
    trendingSection.innerHTML = `
        <div class="home-section-title">🔥 Modelos em Alta</div>
        <div class="trending-grid">
            ${trendingPicks.map(pick => {
        const creator = creatorsData[pick.idx];
        if (!creator) return '';
        return `
                    <a href="model-profile.html?id=${pick.idx}" class="trending-card">
                        <img src="${pick.photo}" class="trending-bg" loading="lazy" alt="${sanitizeHTML(creator.name)}">
                        <div class="trending-overlay">
                            <div class="trending-info">
                                <h3>${sanitizeHTML(creator.name)}</h3>
                                <span style="color:#ddd; font-size:0.9rem;">${formatNumber(creator.stats.views)} visualizações</span>
                            </div>
                        </div>
                    </a>
                 `;
    }).join('')}
        </div>
    `;
    container.appendChild(trendingSection);

    // 4. CONVERSION FOOTER
    const footerSection = document.createElement('div');
    footerSection.className = 'home-footer-conversion';
    footerSection.innerHTML = `
        <h2>Quer divulgar seu perfil aqui?</h2>
        <p>Junte-se às melhores criadoras e ganhe destaque na OnlyModels.</p>
        <button class="btn-pp-primary" style="padding: 15px 40px; font-size: 1.1rem;">QUERO ME DESTACAR</button>
    `;
    container.appendChild(footerSection);
}

// Story Viewer Logic
let currentStoryCreatorIndex = null;
let currentStoryIndex = 0;
let storyTimer = null;

function openStory(creatorIndex) {
    const creator = creatorsData[creatorIndex];
    if (!creator.stories || creator.stories.length === 0) {
        // Fallback to profile if no stories
        window.location.href = `model-profile.html?id=${creatorIndex}`;
        return;
    }

    currentStoryCreatorIndex = creatorIndex;
    currentStoryIndex = 0;

    document.getElementById('storyOverlay').classList.add('active');
    document.body.style.overflow = 'hidden'; // Prevent scrolling

    showStory();
}

function closeStory() {
    document.getElementById('storyOverlay').classList.remove('active');
    document.body.style.overflow = '';
    clearTimeout(storyTimer);
    currentStoryCreatorIndex = null;
}

function showStory() {
    clearTimeout(storyTimer);

    const creator = creatorsData[currentStoryCreatorIndex];
    const story = creator.stories[currentStoryIndex];

    // Update Header
    document.getElementById('storyUserAvatar').style.backgroundImage = `url('${creator.avatar || creator.photos[0]}')`;
    document.getElementById('storyUserName').textContent = creator.name; // textContent handles sanitization
    document.getElementById('storyTimeAgo').textContent = story.date || 'Agora'; // textContent handles sanitization

    // Update Image and Date
    const img = document.getElementById('storyImage');
    img.src = story.image;
    // Apply custom style if exists, otherwise default to cover with !important
    img.style.cssText = story.style || "width: 100vw; height: 100vh; object-fit: cover !important; object-position: center top !important;";
    // document.getElementById('storyDate').textContent = story.date;

    // Update Progress Bars
    const progressContainer = document.getElementById('storyProgressContainer');
    progressContainer.innerHTML = '';

    creator.stories.forEach((_, idx) => {
        const bar = document.createElement('div');
        bar.className = 'story-progress-bar';
        const fill = document.createElement('div');
        fill.className = 'story-progress-fill';

        if (idx < currentStoryIndex) {
            fill.classList.add('completed');
            fill.style.width = '100%';
        } else if (idx === currentStoryIndex) {
            // Animate current
            setTimeout(() => {
                fill.style.width = '100%';
                fill.style.transition = 'width 6s linear';
            }, 10);
        }

        bar.appendChild(fill);
        progressContainer.appendChild(bar);
    });

    // Auto Advance
    storyTimer = setTimeout(nextStory, 6000);
}

function nextStory(e) {
    if (e) e.stopPropagation();

    const creator = creatorsData[currentStoryCreatorIndex];
    if (currentStoryIndex < creator.stories.length - 1) {
        currentStoryIndex++;
        showStory();
    } else {
        closeStory();
    }
}

function prevStory(e) {
    if (e) e.stopPropagation();

    if (currentStoryIndex > 0) {
        currentStoryIndex--;
        showStory();
    } else {
        showStory();
    }
}

// Initialize on page load
// Initialize on page load
// Initialize Logic
// Initialize Logic
document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const profileId = urlParams.get('id');

    if (profileId !== null) {
        // --- PROFILE ROUTE ---
        if (typeof renderFullProfilePage === 'function') {
            renderFullProfilePage(parseInt(profileId));
        }

        // Hide Home Container
        const feed = document.getElementById('feedContainer');
        if (feed) feed.style.display = 'none';

        // Show Profile Container
        const profileContainer = document.getElementById('profileContainer');
        if (profileContainer) profileContainer.style.display = 'block';

    } else {
        // --- HOME ROUTE (MARKETPLACE) ---
        // Ensure Home Container is visible
        const feed = document.getElementById('feedContainer');
        if (feed) {
            feed.style.display = 'block';
            if (typeof renderHomeMarketplace === 'function') {
                renderHomeMarketplace();

                // Restore Scroll Position if returning from profile
                const savedScroll = sessionStorage.getItem('homeScrollPos');
                if (savedScroll) {
                    setTimeout(() => {
                        window.scrollTo(0, parseInt(savedScroll));
                        sessionStorage.removeItem('homeScrollPos'); // Clean up
                    }, 0);
                }
            }
        }
    }
});
// Image Modal Viewer
function openImageModal(src) {
    const modal = document.createElement('div');
    modal.style.position = 'fixed';
    modal.style.top = '0';
    modal.style.left = '0';
    modal.style.width = '100%';
    modal.style.height = '100%';
    modal.style.backgroundColor = 'rgba(0,0,0,0.95)';
    modal.style.zIndex = '10000';
    modal.style.display = 'flex';
    modal.style.alignItems = 'center';
    modal.style.justifyContent = 'center';
    modal.style.cursor = 'zoom-out';
    modal.onclick = () => document.body.removeChild(modal);

    const img = document.createElement('img');
    img.src = src;
    img.style.maxWidth = '90%';
    img.style.maxHeight = '90%';
    img.style.borderRadius = '8px';
    img.style.boxShadow = '0 0 20px rgba(0,0,0,0.5)';
    img.style.objectFit = 'contain';

    modal.appendChild(img);
    document.body.appendChild(modal);
}

// Scroll Persistence
function saveHomeScroll() {
    sessionStorage.setItem('homeScrollPos', window.scrollY);
}
