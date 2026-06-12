import { useState } from 'react';
import {
  View, Text, TextInput, StyleSheet,
  TouchableOpacity, Alert, SafeAreaView
} from 'react-native';

export default function Cadastro() {
  const [temp, setTemp] = useState('');
  const [hum, setHum] = useState('');
  const [kmVento, setKmVento] = useState('');

  const handleSalvar = () => {
    if (!temp || !hum || !kmVento) {
      Alert.alert('Atenção', 'Preencha todos os campos antes de salvar.');
      return;
    }
    // lógica de salvar aqui
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.inner}>

        <View style={styles.iconWrapper}>
          {/* substitua por um ícone da sua lib, ex: Ionicons */}
          <Text style={styles.iconPlaceholder}>☁</Text>
        </View>

        <Text style={styles.title}>Cadastro de medição</Text>
        <Text style={styles.subtitle}>Registre os dados climáticos</Text>

        <View style={styles.card}>

          <Text style={styles.label}>TEMPERATURA</Text>
          <View style={styles.fieldWrap}>
            <TextInput
              style={styles.input}
              placeholder="0.0"
              placeholderTextColor="#185FA5"
              value={temp}
              onChangeText={setTemp}
              keyboardType="numeric"
            />
            <Text style={styles.unit}>°C</Text>
          </View>

          <Text style={styles.label}>HUMIDADE</Text>
          <View style={styles.fieldWrap}>
            <TextInput
              style={styles.input}
              placeholder="0"
              placeholderTextColor="#185FA5"
              value={hum}
              onChangeText={setHum}
              keyboardType="numeric"
            />
            <Text style={styles.unit}>%</Text>
          </View>

          <Text style={styles.label}>VELOCIDADE DO VENTO</Text>
          <View style={styles.fieldWrap}>
            <TextInput
              style={styles.input}
              placeholder="0"
              placeholderTextColor="#185FA5"
              value={kmVento}
              onChangeText={setKmVento}
              keyboardType="numeric"
            />
            <Text style={styles.unit}>km/h</Text>
          </View>

          <View style={styles.divider} />

          <TouchableOpacity style={styles.btnSave} onPress={handleSalvar}>
            <Text style={styles.btnSaveText}>Salvar medição</Text>
          </TouchableOpacity>

          <Text style={styles.hint}>Todos os campos são obrigatórios</Text>

        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#042C53',
  },
  inner: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  iconWrapper: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#0C447C',
    borderWidth: 0.5,
    borderColor: '#185FA5',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  iconPlaceholder: {
    fontSize: 32,
  },
  title: {
    color: '#E6F1FB',
    fontSize: 22,
    fontWeight: '500',
    marginBottom: 4,
  },
  subtitle: {
    color: '#85B7EB',
    fontSize: 14,
    marginBottom: 28,
  },
  card: {
    backgroundColor: '#0C447C',
    borderRadius: 12,
    borderWidth: 0.5,
    borderColor: '#185FA5',
    padding: 24,
    width: '100%',
  },
  label: {
    color: '#85B7EB',
    fontSize: 11,
    letterSpacing: 0.8,
    marginBottom: 6,
  },
  fieldWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#042C53',
    borderWidth: 0.5,
    borderColor: '#185FA5',
    borderRadius: 8,
    paddingHorizontal: 14,
    marginBottom: 16,
  },
  input: {
    flex: 1,
    color: '#E6F1FB',
    fontSize: 14,
    paddingVertical: 11,
  },
  unit: {
    color: '#378ADD',
    fontSize: 12,
    fontWeight: '500',
  },
  divider: {
    height: 0.5,
    backgroundColor: '#185FA5',
    marginVertical: 16,
  },
  btnSave: {
    backgroundColor: '#378ADD',
    borderRadius: 8,
    paddingVertical: 13,
    alignItems: 'center',
  },
  btnSaveText: {
    color: '#E6F1FB',
    fontSize: 15,
    fontWeight: '500',
  },
  hint: {
    color: '#185FA5',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 12,
  },
});