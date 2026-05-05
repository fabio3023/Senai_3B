# Como conectar sensor serial ao Project Vale

Guia passo a passo para conectar dispositivos seriais (Arduino, ESP32, ESP8266, Raspberry Pi Pico, ou qualquer placa USB-serial) ao Project Vale.

---

## A. Modo generico (JSON ou CSV por linha)

Funciona com qualquer dispositivo que envie dados por serial em formato JSON ou CSV, uma leitura por linha.

### 1. Preparar o dispositivo

O firmware do dispositivo deve enviar dados pela porta serial (USB) no formato:

**JSON por linha (recomendado):**
```
{"humidity":55.0,"distance_mm":420.0,"temp":23.0}
{"humidity":55.2,"distance_mm":418.0,"temp":23.1}
```

**CSV por linha:**
```
55.0,420.0,23.0
55.2,418.0,23.1
```

Cada leitura deve terminar com `\n` (newline).

### 2. Conectar o dispositivo ao PC

1. Plugar o cabo USB do dispositivo ao computador.
2. Aguardar o sistema operacional reconhecer a porta serial.
   - **Windows**: aparece como `COM3`, `COM4`, etc. (ver Gerenciador de Dispositivos > Portas COM)
   - **Linux**: aparece como `/dev/ttyUSB0`, `/dev/ttyACM0`, etc.
   - **macOS**: aparece como `/dev/cu.usbserial-XXX` ou `/dev/cu.usbmodemXXX`

### 3. Configurar no app (aba Configuracoes)

1. Abrir a aba **Configuracoes**.
2. Em **Origem dos dados**, selecionar **SERIAL**.
3. Em **Porta serial**, digitar a porta (ex: `COM3` ou `/dev/ttyUSB0`).
4. Em **Baudrate**, colocar o mesmo baudrate do firmware (ex: `115200`).
5. Em **Tempo limite da conexao**, manter `0.5` s ou ajustar se necessario.
6. Em **Protocolo serial**, selecionar:
   - `AUTO` — detecta JSON/CSV automaticamente (padrao, recomendado)
   - `GENERIC_JSON` — forca parse como JSON
   - `GENERIC_CSV` — forca parse como CSV

### 4. Configurar perfil dos dados

Se o firmware usa nomes de campo diferentes do padrao:

| Campo no app | Padrao | Exemplos alternativos |
|---|---|---|
| Campo de umidade | `humidity` | `hum`, `h`, `umidade` |
| Campo de distancia | `distance_mm` | `distance`, `dist`, `ultra_mm` |
| Campo de temperatura | `temp` | `temperature`, `t`, `temperatura` |

Para CSV, configurar a **Ordem CSV serial** (ex: `humidity,distance_mm,temp`).
A ordem deve corresponder exatamente a posicao dos valores no CSV.

### 5. Configurar unidade/escala/offset (se necessario)

- **Unidade da distancia**: `mm` (padrao), `cm`, `m`, `in`
- **Escala da distancia**: multiplicador aplicado ao valor bruto (padrao `1.0`)
- **Correcao de distancia (mm)**: offset fixo em mm (padrao `0.0`)

Exemplo: sensor envia distancia em cm → configurar unidade como `cm`.

### 6. Aplicar e conectar

Duas opcoes:
- **Aplicar**: salva config sem conectar.
- **Aplicar e conectar sensor**: salva config E inicia conexao serial.

### 7. Validar na aba Conexao

Ir para a aba **Conexao** e verificar:

1. **Estado conexao**: deve mostrar `CONNECTED`
2. **Ultima linha bruta**: deve mostrar a linha JSON/CSV recebida
3. **Linhas recebidas**: deve estar incrementando
4. **Falhas de parse**: deve ser `0` (ou muito baixo)
5. **Protocolo ativo**: deve mostrar `GENERIC_JSON` ou `GENERIC_CSV`
6. **Causa provavel**: deve mostrar `Leitura normalizada OK`
7. **Ultimo payload normalizado**: deve mostrar os valores interpretados

---

## B. Modo handshake compativel (VALE_SENSOR_V1)

Modo opcional para dispositivos que implementam o protocolo VALE_SENSOR_V1. Permite plug-and-play com autodeteccao.

### Como funciona

1. Ao conectar, o app envia `VALE_HELLO\n` pela serial.
2. Se o dispositivo reconhecer o comando, responde com JSON descrevendo suas capacidades:

```json
{"device":"ESP32","protocol":"VALE_SENSOR_V1","fields":["humidity","distance_mm","temp"],"rate_hz":2}
```

3. O app reconhece o dispositivo como compativel e configura o protocolo como `VALE_SENSOR_V1`.
4. Apos o handshake, o dispositivo envia dados normalmente (JSON por linha).

### Campos da resposta de handshake

| Campo | Tipo | Descricao |
|---|---|---|
| `device` | string | Nome do dispositivo (ex: "ESP32", "Arduino Uno") |
| `protocol` | string | Deve ser exatamente `"VALE_SENSOR_V1"` |
| `fields` | array de strings | Campos que o dispositivo envia (ex: `["humidity","distance_mm","temp"]`) |
| `rate_hz` | number (opcional) | Taxa de atualizacao em Hz |

### O que muda quando compativel

- O protocolo ativo mostra `VALE_SENSOR_V1` na aba Conexao.
- O diagnostico mostra `Dispositivo compativel VALE_SENSOR_V1 detectado`.
- Os campos do handshake podem ser usados para validar o perfil.

### Se o handshake nao responder

- O app continua funcionando em modo generico (JSON/CSV).
- Na aba Conexao, o handshake mostra `Sem resposta (modo generico disponivel)`.
- Nenhuma funcionalidade e perdida.

### Testar dispositivo manualmente

Na aba **Conexao**, clicar em **Testar dispositivo** para enviar o handshake a qualquer momento e verificar a resposta.

---

## C. Troubleshooting

### Porta nao aparece

- Verificar se o cabo USB esta conectado.
- Verificar se o driver da placa esta instalado (CH340, CP2102, FTDI, etc.).
- No Linux, verificar permissoes: `sudo usermod -a -G dialout $USER` e reiniciar sessao.
- Clicar em **Atualizar portas** na aba Conexao.

### Conecta mas nao chega linha

- Verificar se o firmware esta enviando dados pela serial.
- Verificar se o baudrate esta correto (deve ser igual ao do firmware).
- Verificar se o firmware envia `\n` no final de cada linha.
- Aumentar o timeout se o firmware demora para enviar.

### Linha chega mas parse falha

- Verificar formato: o app espera JSON valido ou CSV com delimitador `,` `;` ou tab.
- Verificar se nao ha caracteres extras antes/depois do JSON (ex: debug prints).
- Na aba Conexao, verificar **Ultima linha bruta** para ver exatamente o que chega.
- Verificar **Ultimo erro de parse** para detalhes do erro.

### JSON invalido

- Verificar aspas duplas nos nomes dos campos: `{"humidity":55.0}` (correto) vs `{humidity:55.0}` (errado).
- Verificar virgulas e chaves.
- Garantir que cada linha contem exatamente um objeto JSON completo.

### CSV em ordem errada

- Configurar **Ordem CSV serial** para corresponder a ordem real dos valores.
- Exemplo: se o firmware envia `temp,humidity,distance_mm`, configurar ordem como `temp,humidity,distance_mm`.

### Unidade errada

- Se a distancia aparece multiplicada por 10, provavelmente o sensor envia em cm e o app espera mm.
- Ajustar **Unidade da distancia** ou **Escala da distancia**.

### Sensor repetindo leitura

- O app detecta automaticamente repeticoes consecutivas.
- Apos 4+ repeticoes, mostra flag `SENSOR_STUCK_SUSPECT`.
- Na aba Conexao, a causa provavel mostra `Sensor possivelmente travado/repetindo`.
- Verificar se o firmware esta atualizando as leituras do sensor.

### Estados de leitura

| Estado | Significado |
|---|---|
| `VALID` | Leitura recebida e parseada com sucesso |
| `NO_DATA` | Timeout — nenhuma linha recebida no intervalo |
| `PARSE_ERROR` | Linha recebida mas nao foi possivel parsear |
| `INFRA_ERROR` | Erro de infraestrutura (porta fechada, pyserial nao instalado, etc.) |

---

## D. Exemplos concretos de payload

### JSON por linha (recomendado)

```
{"humidity":55.0,"distance_mm":420.0,"temp":23.0}
```

Com campos customizados:
```
{"hum":55.0,"ultra_mm":420.0,"temperatura":23.0}
```
(configurar nomes dos campos correspondentes no app)

### CSV por linha

Ordem padrao (`humidity,distance_mm,temp`):
```
55.0,420.0,23.0
```

Com ponto-e-virgula:
```
55.0;420.0;23.0
```

Com ordem customizada (`temp,humidity,distance_mm`):
```
23.0,55.0,420.0
```
(configurar `serial_csv_order` como `temp,humidity,distance_mm`)

### Resposta de handshake VALE_SENSOR_V1

```json
{"device":"ESP32","protocol":"VALE_SENSOR_V1","fields":["humidity","distance_mm","temp"],"rate_hz":2}
```

Variante minima:
```json
{"device":"Arduino Uno","protocol":"VALE_SENSOR_V1","fields":["humidity","distance_mm"]}
```

---

## E. Contrato do protocolo VALE_SENSOR_V1

**Nome:** VALE_SENSOR_V1

**Handshake:**
- Opcional. O app envia `VALE_HELLO\n`.
- Se o dispositivo responder com JSON contendo `"protocol":"VALE_SENSOR_V1"`, o app reconhece como compativel.
- Se nao responder, o app opera em modo generico.

**Streaming:**
- Uma leitura por linha, terminada com `\n`.
- JSON preferencial; CSV aceito.

**Campos conhecidos:**
- `humidity` — umidade relativa (%)
- `distance_mm` — distancia do sensor ultrassonico (mm)
- `temp` — temperatura (C)
- `level_pct` — nivel do reservatorio (%) — opcional, derivado de distance se ausente
- `weight` — peso (opcional)

**Taxa de atualizacao:**
- Livre, desde que haja quebra de linha (`\n`) por leitura.
- Tipicamente 1-10 Hz.

**Compatibilidade:**
- Arduino (qualquer modelo com USB serial)
- ESP32 / ESP8266
- Raspberry Pi Pico
- Qualquer placa que apareca como porta serial USB no sistema operacional
