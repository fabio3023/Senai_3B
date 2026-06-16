import React from 'react';
import {
  View,
  Text,
  ScrollView,
  Dimensions,
  StyleSheet,
  StatusBar,
} from 'react-native';
import { LineChart, PieChart } from 'react-native-chart-kit';

const { width } = Dimensions.get('window');

const dadosLinha = {
  labels: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'],
  datasets: [{ data: [39, 37, 33, 28, 27, 25] }],
};

const dadosPizza = [
  { name: 'Jd Paulista', temp: 18, color: '#38BDF8' },
  { name: 'Portal dos Nobres', temp: 20, color: '#0284C7' },
  { name: 'Três Pontes', temp: 15, color: '#0EA5E9' },
  { name: 'Jd Alto da Boa Vista', temp: 15, color: '#7DD3FC' },
];

const chartConfig = {
  backgroundGradientFrom: '#FFFFFF',
  backgroundGradientFromOpacity: 1,
  backgroundGradientTo: '#F0F4F8',
  backgroundGradientToOpacity: 1,
  color: (opacity = 1) => `rgba(2, 132, 199, ${opacity})`, // Azul mais sóbrio
  strokeWidth: 2,
  barPercentage: 0.5,
  useShadowColorFromDataset: false,
  labelColor: (opacity = 1) => `rgba(15, 23, 42, ${opacity})`, // Texto escuro para os labels
  decimalCount: 0,
};

export default function Dashboard() {
  return (
    <ScrollView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F0F4F8" />

      {/* Cabeçalho */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Estação Meteorológica SESI</Text>
        <Text style={styles.headerSubtitle}>Mirandópolis - SP</Text>
      </View>

      {/* Cartão de últimas medições */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Últimas Medições</Text>
        <View style={styles.measurementsRow}>
          <View style={styles.measurementItem}>
            <Text style={styles.measurementDate}>12/06/2026</Text>
            <Text style={styles.measurementValue}>25°C</Text>
          </View>
          <View style={styles.measurementItem}>
            <Text style={styles.measurementDate}>11/06/2026</Text>
            <Text style={styles.measurementValue}>22°C</Text>
          </View>
          <View style={styles.measurementItem}>
            <Text style={styles.measurementDate}>12/06/2026</Text>
            <Text style={styles.measurementValue}>60%</Text>
          </View>
          <View style={styles.measurementItem}>
            <Text style={styles.measurementDate}>11/06/2026</Text>
            <Text style={styles.measurementValue}>80%</Text>
          </View>
        </View>
      </View>

      {/* Seção de gráfico de linha */}
      <View style={styles.chartSection}>
        <Text style={styles.sectionTitle}>Temperatura - Últimos 6 meses</Text>
        <LineChart
          data={dadosLinha}
          width={width - 48}
          height={220}
          chartConfig={chartConfig}
          style={styles.chart}
          bezier
          withInnerLines={false}
          withOuterLines={true}
        />
      </View>

      {/* Seção de gráfico de pizza */}
      <View style={styles.chartSection}>
        <Text style={styles.sectionTitle}>Temperatura por Bairro</Text>
        <PieChart
          data={dadosPizza}
          width={width - 48}
          height={220}
          chartConfig={chartConfig}
          accessor="temp"
          backgroundColor="transparent"
          paddingLeft="15"
          style={styles.chart}
        />
      </View>

      {/* Rodapé */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>Acompanhe em tempo real</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F4F8', // Fundo claro igual ao relatório
  },
  header: {
    paddingTop: 60,
    paddingBottom: 24,
    paddingHorizontal: 24,
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#0F172A', // Texto escuro
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#64748B', // Cinza médio
    marginTop: 4,
  },
  card: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 12,
  },
  measurementsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  measurementItem: {
    width: '48%',
    backgroundColor: '#F0F4F8', // Fundo clarinho
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  measurementDate: {
    fontSize: 12,
    color: '#64748B',
  },
  measurementValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0369A1', // Azul do badge do relatório
    marginTop: 4,
  },
  chartSection: {
    marginHorizontal: 16,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 12,
    marginLeft: 4,
  },
  chart: {
    borderRadius: 16,
    backgroundColor: '#FFFFFF', // fundo branco para o gráfico
  },
  footer: {
    alignItems: 'center',
    padding: 16,
    marginBottom: 20,
  },
  footerText: {
    color: '#94A3B8',
    fontSize: 14,
  },
});