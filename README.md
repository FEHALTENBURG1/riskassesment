# Calculadoras & Linha do Tempo — Avaliação Rápida de Risco em Saúde Pública

Ferramenta de apoio à *Ficha de Avaliação Rápida de Risco em Saúde Pública* (metodologia OMS —
WHO/HSE/GAR/ARO/2012.1), com:

- **Calculadoras epidemiológicas**: Taxa de Ataque, Coeficiente de Incidência, Coeficiente de
  Prevalência, Coeficiente de Letalidade (CFR), R0 (dois métodos), Cobertura Vacinal, Razão de
  Risco (Risco Relativo) e uma calculadora genérica.
- **Linha do tempo interativa** do evento, com exportação em imagem (PNG) e dados (CSV).

Elaborado por **Fernanda Haltenburg**.

---

## 🚀 Publicar no GitHub Pages (sem precisar rodar nada)

O site já vem **pré-compilado** — `index.html` + pasta `assets/` — então não é necessário instalar
Node.js nem rodar build para colocá-lo no ar.

1. Crie um repositório novo no GitHub (ex.: `avaliacao-risco-toolkit`).
2. Envie **todo o conteúdo desta pasta** para a branch `main` (raiz do repositório):
   ```bash
   git init
   git add .
   git commit -m "Publica ferramenta de avaliação de risco"
   git branch -M main
   git remote add origin https://github.com/SEU-USUARIO/avaliacao-risco-toolkit.git
   git push -u origin main
   ```
3. No repositório, vá em **Settings → Pages**.
4. Em **Build and deployment → Source**, selecione **Deploy from a branch**.
5. Em **Branch**, escolha **main** e a pasta **/ (root)** → **Save**.
6. Em alguns instantes o GitHub mostrará o link (algo como
   `https://SEU-USUARIO.github.io/avaliacao-risco-toolkit/`).

Pronto — a ferramenta fica pública e acessível de qualquer navegador, sem servidor próprio.

> Se preferir manter o repositório privado, o GitHub Pages a partir de repositórios privados exige
> conta GitHub Pro/Team/Enterprise (ou GitHub Free para organizações). Repositórios públicos
> publicam Pages gratuitamente em qualquer plano.

---

## 📁 Estrutura do projeto

```
├── index.html            # página publicada (já pronta para deploy)
├── assets/
│   ├── app.js             # React + componente, empacotado e minificado
│   └── style.css          # Tailwind CSS compilado (apenas classes usadas)
├── src/
│   ├── App.jsx             # código-fonte do componente (edite aqui)
│   ├── main.jsx            # ponto de entrada (monta o componente na página)
│   └── input.css           # entrada do Tailwind
├── package.json            # scripts de build
└── README.md
```

---

## ✏️ Editar e recompilar localmente

Só é necessário se você (ou o Claude, em uma próxima conversa) quiser alterar o código-fonte em
`src/App.jsx` — o site publicado (`index.html` + `assets/`) já funciona sozinho sem isso.

Pré-requisito: [Node.js](https://nodejs.org) 18 ou superior.

```bash
npm install       # instala React, esbuild e Tailwind CSS
npm run build     # gera assets/app.js e assets/style.css atualizados
```

Durante o desenvolvimento, para recompilar automaticamente a cada alteração:

```bash
npm run watch:js    # em um terminal
npm run watch:css   # em outro terminal
```

Depois de recompilar, é só commitar e enviar (`git push`) — o GitHub Pages atualiza automaticamente
o conteúdo publicado a cada push na branch configurada.

---

## Metodologia de referência

World Health Organization. *Rapid Risk Assessment of Acute Public Health Events*.
WHO/HSE/GAR/ARO/2012.1. Genebra: WHO, 2012.
