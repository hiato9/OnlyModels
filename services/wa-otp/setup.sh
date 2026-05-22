#!/usr/bin/env bash
# services/wa-otp/setup.sh
# Sobe o microserviço wa-otp na VM Oracle (1GB AMD Always Free) em 1 comando.
#
# Como usar:
#   1. Da sua máquina local:
#        scp -r services/wa-otp ubuntu@<IP-DA-VM>:~/wa-otp
#   2. SSH na VM:
#        ssh ubuntu@<IP-DA-VM>
#   3. Rodar setup:
#        cd ~/wa-otp && bash setup.sh
#
# O script:
#   - Detecta e instala Docker se faltar (Ubuntu/Debian/Oracle Linux)
#   - Cria .env interativo (ou usa env var WA_OTP_SERVICE_SECRET se já setada)
#   - Sobe o container (docker compose up -d --build)
#   - Segue os logs até aparecer o QR — escaneie com o WhatsApp do chip dedicado
#
# Re-rodar é seguro: o .env é preservado, o volume de auth também.

set -euo pipefail

cd "$(dirname "$0")"

c_green='\033[0;32m'
c_yellow='\033[0;33m'
c_red='\033[0;31m'
c_reset='\033[0m'

info()  { printf "${c_green}[setup]${c_reset} %s\n" "$*"; }
warn()  { printf "${c_yellow}[setup]${c_reset} %s\n" "$*"; }
fatal() { printf "${c_red}[setup] ERRO:${c_reset} %s\n" "$*" >&2; exit 1; }

# ---------- 1. Docker ----------
install_docker() {
    info "Instalando Docker via get.docker.com..."
    curl -fsSL https://get.docker.com | sudo sh
    sudo systemctl enable --now docker
    if ! groups "$USER" | grep -q docker; then
        sudo usermod -aG docker "$USER"
        warn "Usuário '$USER' adicionado ao grupo docker. Saia e entre de novo no SSH, depois rode este script de novo."
        exit 0
    fi
}

if ! command -v docker >/dev/null 2>&1; then
    install_docker
else
    info "Docker já instalado: $(docker --version)"
fi

if ! docker compose version >/dev/null 2>&1; then
    fatal "Docker Compose v2 não encontrado. Atualize o Docker via 'curl -fsSL https://get.docker.com | sudo sh'."
fi

# ---------- 2. .env ----------
ENV_FILE=".env"

if [[ -f "$ENV_FILE" ]]; then
    info ".env já existe — preservando."
else
    info "Criando .env..."
    if [[ -z "${WA_OTP_SERVICE_SECRET:-}" ]]; then
        printf "Cole o WA_OTP_SERVICE_SECRET (mesmo valor configurado no Vercel): "
        read -r WA_OTP_SERVICE_SECRET
    fi
    if [[ -z "$WA_OTP_SERVICE_SECRET" ]]; then
        fatal "WA_OTP_SERVICE_SECRET não pode ser vazio."
    fi
    cat > "$ENV_FILE" <<EOF
WA_OTP_SERVICE_SECRET=${WA_OTP_SERVICE_SECRET}
EOF
    chmod 600 "$ENV_FILE"
    info ".env criado com permissão 600."
fi

# ---------- 3. Subir o container ----------
info "Build + up do compose..."
docker compose up -d --build

# ---------- 4. Status ----------
sleep 3
info "Status:"
docker compose ps

cat <<'NEXT'

==========================================================
PRÓXIMO PASSO — escanear o QR no WhatsApp do chip dedicado:
==========================================================
1. No celular com o chip novo: WhatsApp > Menu > Aparelhos conectados > Conectar
2. Aponta a câmera pro QR code que vai aparecer abaixo
3. Quando aparecer "[wa-otp] WhatsApp conectado.", aperte Ctrl+C pra sair dos logs (o container continua rodando)

Seguindo logs (Ctrl+C pra sair):
==========================================================
NEXT

docker compose logs -f
