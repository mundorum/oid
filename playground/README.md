## Desenvolvimento local e uso da biblioteca

Este projeto está dividido em dois repositórios:

- [`@mundorum/oid`](../) – a biblioteca principal com os componentes.
- [`playground`](./playground) – aplicação de teste para desenvolvimento e demonstração.

---

### Usando a versão local da biblioteca (`npm run dev:local`)

Para testar a biblioteca **sem precisar publicar no NPM**, você pode usar `npm link`.

#### 1. Na raiz do repositório da biblioteca (`oid`)

```bash
npm install
npm run link
```
> Isso cria um link simbólico local para a biblioteca `@mundorum/oid`.

#### 2. No repositório do playground

```bash
cd playground
npm install
npm link @mundorum/oid
npm run dev:local
```
> Isso conecta o playground à versão local da biblioteca. As alterações feitas na biblioteca serão refletidas imediatamente.

---

### Usando a versão publicada no NPM (`npm run dev`)

Quando quiser testar como a biblioteca funciona **a partir do NPM**, execute:

```bash
cd playground
npm unlink --no--save @mundorum/oid
npm install
npm run dev
```
> Esse fluxo desativa o link local e volta a usar a versão publicada no repositório do NPM.

---

### Importação no HTML

Independente do modo (local ou NPM), o import no HTML deve sempre usar o mesmo caminho:

```html
<script type="module">
  import '@mundorum/oid/components/ui/button-oid.js'
</script>
```

---

### Publicação no NPM

Para publicar uma nova versão da biblioteca:

#### 1. Exporte correto no `package.json`

Para garantir que os arquivos estejam disponíveis ao instalar a lib via NPM, adicione ao `package.json` da biblioteca:

```json
"files": [
  "lib/foundation",
  "src/components",
  "src/infra",
  "src/base"
]
```

#### 2. Atualize a versão no `package.json`

Exemplo:

```json
"version": "0.1.2"
```

#### 3. Gere os arquivos da biblioteca

No repositório `oid`, para gerar a lib:

```bash
npm run build       # para produção (lib/foundation/oidlib.js)
npm run build:dev   # para desenvolvimento (lib/foundation/oidlib-dev.js)
```

#### 4. Faça login no NPM (se ainda não estiver logado)

```bash
npm login
```

#### 5. Publique

```bash
npm publish --access public
```

> Se o pacote for scoped (`@usuario/pacote`), o `--access public` é obrigatório na primeira publicação.

---

### Limpando cache do NPM

Caso enfrente problemas com cache ou links antigos, use:

```bash
npm cache clean --force
```

## Scripts disponíveis no `playground`

O projeto `playground` possui scripts no `package.json` que facilitam o uso e troca entre a versão local da biblioteca `@mundorum/oid` e a versão publicada no NPM.

```bash
npm run dev:local
```

Inicia o playground usando a **versão local da biblioteca `@mundorum/oid`**, que está no repositório irmão (`../`).

Este comando depende de um `pre-script` que executa os seguintes passos automaticamente:

1. Limpa `node_modules` locais e do repositório da biblioteca;
2. Reinstala as dependências da biblioteca (`../`);
3. Executa `npm run build` na biblioteca;
4. Faz o `npm link` da biblioteca;
5. Executa `npm link @mundorum/oid` no `playground`;
6. Reinstala as dependências locais do playground.

> Útil para desenvolvimento ativo da biblioteca, com hot reload no playground.

---

```bash
npm run dev
```

Executa o playground utilizando a **versão publicada no NPM** da biblioteca `@mundorum/oid`.

O `pre-script` executa:

- `npm unlink --no-save @mundorum/oid` – remove o link local, se existir;
- `npm install` – reinstala a dependência a partir do NPM.

> Útil para testar se o pacote publicado está funcionando corretamente.

---

```bash 
npm run clear
```

Remove:

- `node_modules` e `package-lock.json` do `playground`;
- `node_modules` e `package-lock.json` da raiz do monorepo (se houver);
- Limpa o cache do NPM.

> Útil para resolver problemas com dependências corrompidas ou cache.

---