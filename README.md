# 🌿 Canteiro - Diário de Plantas

O **Canteiro** é uma aplicação Full Stack desenvolvida com o objetivo de gerenciar o cuidado de plantas domésticas. O projeto permite registrar novas plantas, monitorar o status de saúde, definir o ambiente de cultivo e gerenciar os intervalos de rega.

> **🎯 Finalidade do Projeto:** Este é um projeto desenvolvido exclusivamente para **fins de estudo**. O foco principal foi o aprendizado sobre o ciclo de vida completo de uma aplicação, abrangendo desde a estruturação do banco de dados até o deploy automatizado em ambientes de nuvem.

---

## 🚀 Como o Projeto Opera

A aplicação opera através da integração de três camadas principais:

### 1. Frontend (Interface do Usuário)
* **Tecnologias:** HTML, CSS e JavaScript Vanilla.
* **Operação:** A interface consome a API REST hospedada no Render para exibir e manipular os dados em tempo real.
* **Recursos:** Inclui filtros por status, sistema de notificações (*toasts*) e suporte a **Progressive Web App (PWA)** através de um Service Worker para funcionamento otimizado.
* **Hospedagem:** Netlify.

### 2. Backend (API REST)
* **Tecnologias:** Node.js e Express.
* **Segurança:** Utiliza **Helmet** para proteção de headers e **CORS** configurado para permitir acessos apenas do domínio oficial do frontend.
* **Arquitetura:** Organizado seguindo o padrão **MVC** (Models, Routes, Controllers) para facilitar a manutenção e escalabilidade.
* **Hospedagem:** Render.

### 3. Banco de Dados
* **Tecnologias:** MongoDB Atlas (NoSQL).
* **Modelagem:** Utiliza o **Mongoose** para definir esquemas de dados, garantindo que cada planta possua atributos como espécie, localização, data de aquisição e logs de rega.

---

## 🛠️ Tecnologias Utilizadas

* **Runtime:** Node.js
* **Framework Web:** Express
* **Banco de Dados:** MongoDB via Mongoose
* **Segurança e Cross-Origin:** Helmet e CORS
* **Variáveis de Ambiente:** Dotenv
* **Versionamento:** Git (Utilizando `.gitignore` para proteção de arquivos sensíveis e dependências)

---

## ⚙️ Configuração para Estudo Local

Caso deseje clonar este repositório para estudos, siga os passos:

1. **Dependências:** Instale as dependências com `npm install`.
2. **Variáveis de Ambiente:** Crie um arquivo `.env` na raiz do backend e adicione sua string de conexão:
   ```text
   MONGO_URI=sua_string_de_conexão_aqui
   PORT=3000
