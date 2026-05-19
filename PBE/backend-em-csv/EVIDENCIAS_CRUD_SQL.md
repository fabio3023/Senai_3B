# Evidências - INSERT, UPDATE e DELETE no banco db_em

## Identificação
Nome: Fábio Hideki Yamada Fujimoto
Turma: 3 Médio B
Data: 2026-05-19

---

# 1. SELECT final - Leituras do dia 2026-04-04
Execute no DBeaver:
```sql
SELECT *
FROM leituras
WHERE timestamp >= '2026-04-04' AND timestamp < '2026-04-05'
ORDER BY timestamp ASC;
```
Cole abaixo a saída obtida:
```text
 id |   station_id    |       timestamp        | temperature_c | humidity_pct
----+-----------------+------------------------+---------------+--------------
  9 | EM-ARACATUBA-01 | 2026-04-04 08:00:00+00 |          23.4 |         76.2
 10 | EM-ARACATUBA-01 | 2026-04-04 09:00:00+00 |          25.2 |         72.0
 11 | EM-ARACATUBA-01 | 2026-04-04 10:00:00+00 |          25.9 |         70.5
(3 rows)
```

---

# 2. SELECT final - Conferência do UPDATE
Execute no DBeaver:
```sql
SELECT *
FROM leituras
WHERE station_id = 'EM-ARACATUBA-01' AND timestamp = '2026-04-04 09:00:00';
```
Cole abaixo a saída obtida:
```text
 id |   station_id    |       timestamp        | temperature_c | humidity_pct
----+-----------------+------------------------+---------------+--------------
 10 | EM-ARACATUBA-01 | 2026-04-04 09:00:00+00 |          25.2 |         72.0
(1 row)
```

---

# 3. SELECT final - Conferência do DELETE
Execute no DBeaver:
```sql
SELECT *
FROM leituras
WHERE station_id = 'EM-ARACATUBA-01' AND timestamp = '2026-04-04 11:00:00';
```
Cole abaixo a saída obtida:
```text
 id | station_id | timestamp | temperature_c | humidity_pct
----+------------+-----------+---------------+--------------
(0 rows)
```
Se o DELETE foi feito corretamente, esse SELECT não deverá retornar registros.

---

# 4. SELECT final - Todas as leituras ordenadas
Execute no DBeaver:
```sql
SELECT *
FROM leituras
ORDER BY id ASC;
```
Cole abaixo a saída obtida:
```text
 id |   station_id    |       timestamp        | temperature_c | humidity_pct
----+-----------------+------------------------+---------------+--------------
  1 | EM-ARACATUBA-01 | 2026-04-01 11:00:00+00 |          24.5 |         72.1
  2 | EM-ARACATUBA-01 | 2026-04-01 12:00:00+00 |          25.1 |         70.3
  3 | EM-ARACATUBA-01 | 2026-04-01 13:00:00+00 |          26.0 |         68.5
  4 | EM-ARACATUBA-01 | 2026-04-02 08:00:00+00 |          22.0 |         80.0
  5 | EM-ARACATUBA-01 | 2026-04-02 08:30:00+00 |          22.3 |         79.5
  6 | EM-ARACATUBA-01 | 2026-04-02 09:00:00+00 |          22.8 |         78.5
  7 | EM-ARACATUBA-01 | 2026-04-02 09:30:00+00 |          23.1 |         77.2
  8 | EM-ARACATUBA-01 | 2026-04-02 10:00:00+00 |          23.5 |         75.8
  9 | EM-ARACATUBA-01 | 2026-04-04 08:00:00+00 |          23.4 |         76.2
 10 | EM-ARACATUBA-01 | 2026-04-04 09:00:00+00 |          25.2 |         72.0
 11 | EM-ARACATUBA-01 | 2026-04-04 10:00:00+00 |          25.9 |         70.5
(11 rows)
```

---

# 5. Teste pela API
Acesse no navegador:
```text
http://localhost:3000/api/leituras/data/2026-04-04
```
Cole abaixo o resultado retornado pela API:
```json
{
  "dataPesquisada": "2026-04-04",
  "total": 3,
  "leituras": [
    {
      "id": 9,
      "station_id": "EM-ARACATUBA-01",
      "timestamp": "2026-04-04T08:00:00.000Z",
      "temperature_c": 23.4,
      "humidity_pct": 76.2
    },
    {
      "id": 10,
      "station_id": "EM-ARACATUBA-01",
      "timestamp": "2026-04-04T09:00:00.000Z",
      "temperature_c": 25.2,
      "humidity_pct": 72.0
    },
    {
      "id": 11,
      "station_id": "EM-ARACATUBA-01",
      "timestamp": "2026-04-04T10:00:00.000Z",
      "temperature_c": 25.9,
      "humidity_pct": 70.5
    }
  ]
}
```

---

# 6. Conclusão
Explique com suas palavras a diferença entre INSERT, UPDATE e DELETE.
```text
INSERT adiciona novos registros à tabela, fornecendo os valores para cada coluna.
UPDATE modifica dados já existentes, alterando campos de registros específicos.
DELETE remove registros permanentemente.
Em todos esses comandos, a cláusula WHERE é essencial para evitar alterações ou exclusões em massa acidentais.
```
```