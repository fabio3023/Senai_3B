# AutoSales BI

Projeto didático de integração SQLite, JavaScript, ETL, API REST e Power BI.
A base é fictícia, recriada a partir do documento de contexto (não é uma cópia da base original).
São 15 países, 4 redes, 60 concessionárias e 36 meses de janeiro de 2023 a dezembro de 2025.

## Executar

1. Extraia o ZIP e abra a pasta `autosales-bi` no VS Code.
2. No terminal, execute `node -v`. Use Node.js 22.13 ou superior (24 recomendado).
3. Execute `npm start` ou `node src/app.js`. Não é necessário `npm install`.
4. Abra http://localhost:3000/api/bi/vendas no navegador.
5. Para parar, pressione Ctrl+C.

## ETL

O banco inicial possui somente paises, redes, concessionarias, periodos e vendas_mensais.
Ao iniciar, a aplicação recria bi_vendas dentro de uma transação, consulta as cinco tabelas com JOIN,
calcula os 17 campos em JavaScript e grava os resultados. Não usa views.
Valores monetários em dólares; cálculos intermediários em centavos. Desconto 8 representa 8%.
A tabela analítica é descartável. Não realize lançamentos manuais nela.

## Power BI Desktop

1. Página Inicial > Obter dados > Web. Informe http://localhost:3000/api/bi/vendas.
2. Selecione autenticação Anônima. Converta a lista em tabela e expanda os registros, se necessário.
3. Configure Data como data; Ano, Mes, Desconto_Pct e Unidades_Vendidas como inteiros;
   valores em USD como decimal fixo; demais colunas como texto.
4. Renomeie a consulta para Vendas e selecione Fechar e aplicar.
5. Para atualizar a base analítica, reinicie a API e clique em Atualizar no Power BI.
   É importação atualizável, não transmissão em tempo real.

### Medidas DAX

```dax
Total Vendas = SUM(Vendas[Unidades_Vendidas])
Faturamento Total = SUM(Vendas[Receita_USD])
Lucro Total = SUM(Vendas[Lucro_Operacional_USD])
Margem de Lucro = DIVIDE([Lucro Total], [Faturamento Total], 0)
Desconto Efetivo = DIVIDE(SUM(Vendas[Desconto_Total_USD]), [Faturamento Total] + SUM(Vendas[Desconto_Total_USD]), 0)
```
Use ponto e vírgula no lugar de vírgulas entre argumentos se a configuração regional do DAX exigir.
Formate margem e desconto efetivo como porcentagem.

### Visuais

- Barras clusterizadas: eixo Y Pais e Concessionaria; eixo X Total Vendas. Ordene decrescente.
- Barras por Rede: compare volume, faturamento e lucro.
- Linhas: eixo X Data (sem hierarquia, contínuo), eixo Y Total Vendas e legenda Rede.
- Principais influenciadores: Analisar Lucro_Operacional_USD sem resumir; Explicar por Faixa_Desconto,
  Pais, Ano e Mes sem resumir. Deixe Expandir por vazio. Analise aumento do lucro.
  Duplique e troque Analisar por Unidades_Vendidas.

A base foi simulada para favorecer a hipótese de que descontos moderados aumentam o lucro,
enquanto descontos elevados favorecem o volume. Os resultados do visual podem diferir da versão anterior.
Associação estatística não prova causalidade. A API é local, sem autenticação, apenas para uso didático.
