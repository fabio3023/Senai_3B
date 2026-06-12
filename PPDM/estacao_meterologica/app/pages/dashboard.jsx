import React from 'react';
import { View, Text, ScrollView, Dimensions, StyleSheet, StatusBar } from 'react-native';
import { LineChart, PieChart } from 'react-native-chart-kit';

const { width } = Dimensions.get('window');

const dadosLinha = {
  labels: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'],
  datasets: [{ data: [39, 37, 33, 28, 27, 25] }],
};

const dadosPizza = [
  { name: 'Jd Paulista', temp: 18, color: '#c0e711' },
  { name: 'Portal dos Nobres', temp: 20, color: '#192bd1' },
  { name: 'Três Pontes', temp: 15, color: '#30f422' },
  { name: 'Jd Alto da Boa Vista', temp: 15, color: '#d22020' },
];

const chartConfig = {
  backgroundGradientFrom: '#1E2923',
  backgroundGradientFromOpacity: 0.3,
  backgroundGradientTo: '#08130D',
  backgroundGradientToOpacity: 0.5,
  color: (opacity = 1) => `rgba(26, 255, 146, ${opacity})`,
  strokeWidth: 2,
  barPercentage: 0.5,
  useShadowColorFromDataset: false,
};

export default function Dashboard() {
  return (
    <ScrollView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0A1F1A" />
      
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
    backgroundColor: '#0D1B2A',
  },
  header: {
    paddingTop: 40,
    paddingBottom: 20,
    paddingHorizontal: 24,
    backgroundColor: '#0A1F1A',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#E0F2E9',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#8BA89A',
    marginTop: 4,
  },
  card: {
    backgroundColor: '#1B2E3C',
    marginHorizontal: 16,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#E0F2E9',
    marginBottom: 12,
  },
  measurementsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  measurementItem: {
    width: '48%',
    backgroundColor: '#243B4A',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  measurementDate: {
    fontSize: 12,
    color: '#8BA89A',
  },
  measurementValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1AFF92',
    marginTop: 4,
  },
  chartSection: {
    marginHorizontal: 16,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#E0F2E9',
    marginBottom: 12,
    marginLeft: 4,
  },
  chart: {
    borderRadius: 16,
  },
  footer: {
    alignItems: 'center',
    padding: 16,
    marginBottom: 20,
  },
  footerText: {
    color: '#8BA89A',
    fontSize: 14,
  },
});