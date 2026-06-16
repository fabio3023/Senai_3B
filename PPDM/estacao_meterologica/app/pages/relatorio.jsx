import { View, Text, FlatList, StyleSheet } from 'react-native';

const medicoes = [
  { id: 1, temp: 30, hum: 50, vento: 20, mes: 'Janeiro' },
  { id: 2, temp: 28, hum: 48, vento: 25, mes: 'Fevereiro' },
  { id: 3, temp: 40, hum: 60, vento: 30, mes: 'Março' },
  { id: 4, temp: 30, hum: 30, vento: 10, mes: 'Abril' },
];

function ItemLista({ item }) {
  return (
    <View style={styles.card}>
      <View style={styles.badge}>
        <Text style={styles.mes}>{item.mes}</Text>
      </View>
      <View style={styles.dados}>
        <View style={styles.coluna}>
          <Text style={styles.rotulo}>🌡️ Temp.</Text>
          <Text style={styles.valor}>{item.temp}°C</Text>
        </View>
        <View style={styles.coluna}>
          <Text style={styles.rotulo}>💧 Hum.</Text>
          <Text style={styles.valor}>{item.hum}%</Text>
        </View>
        <View style={styles.coluna}>
          <Text style={styles.rotulo}>💨 Vento</Text>
          <Text style={styles.valor}>{item.vento} km/h</Text>
        </View>
      </View>
    </View>
  );
}

export default function Relatorio() {
  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Relatório de Medições Meteorológicas</Text>
      <FlatList
        data={medicoes}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => <ItemLista item={item} />}
        contentContainerStyle={styles.lista}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F4F8',
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  titulo: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 20,
    textAlign: 'center',
  },
  lista: {
    paddingBottom: 30,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 18,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
    alignItems: 'center',
  },
  badge: {
    backgroundColor: '#E0F2FE',
    paddingVertical: 6,
    paddingHorizontal: 20,
    borderRadius: 20,
    marginBottom: 16,
  },
  mes: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0369A1',
    letterSpacing: 0.5,
    textTransform: 'capitalize',
  },
  dados: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  coluna: {
    alignItems: 'center',
    flex: 1,
  },
  rotulo: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 4,
  },
  valor: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#334155',
  },
});