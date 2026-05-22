import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Image,
} from 'react-native';
import Logo from '../../assets/images/logo.png';

export default function Ibge() {
  const [nome, setNome] = useState('');
  const [idade, setIdade] = useState('');
  const [localidade, setLocalidade] = useState('');
  const [qtdPessoas, setQtdPessoas] = useState('');

  const cadastrar = () => {
    console.log('Dados da pesquisa IBGE:');
    console.log({ nome, idade, localidade, qtdPessoas });
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.curvaSuperiorEsquerda} />
        <View style={styles.curvaInferiorDireita} />
        <View style={styles.logoContainer}>
          <Image
            source={Logo}
            style={styles.logoImagem}
            resizeMode="contain"
          />
        </View>
        <Text style={styles.titulo}>Pesquisa</Text>

        <View style={styles.form}>
          <Text style={styles.label}>Nome</Text>
          <TextInput
            style={styles.input}
            placeholder="Digite seu nome completo"
            value={nome}
            onChangeText={setNome}
            autoCapitalize="words"
          />

          <Text style={styles.label}>Idade</Text>
          <TextInput
            style={styles.input}
            placeholder="Ex: 25"
            keyboardType="numeric"
            value={idade}
            onChangeText={setIdade}
            maxLength={3}
          />

          <Text style={styles.label}>Localidade</Text>
          <TextInput
            style={styles.input}
            placeholder="Cidade ou bairro"
            value={localidade}
            onChangeText={setLocalidade}
          />

          <Text style={styles.label}>Quantas pessoas vivem na sua casa?</Text>
          <TextInput
            style={styles.input}
            placeholder="Ex: 4"
            keyboardType="numeric"
            value={qtdPessoas}
            onChangeText={setQtdPessoas}
            maxLength={2}
          />

          <TouchableOpacity
            style={styles.botao}
            onPress={cadastrar}
            activeOpacity={0.8}
          >
            <Text style={styles.textoBotao}>Cadastrar</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    position: 'relative',
  },
  curvaSuperiorEsquerda: {
    position: 'absolute',
    top: -80,
    left: -80,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: '#87CEFA',
    opacity: 0.4,
  },
  curvaInferiorDireita: {
    position: 'absolute',
    bottom: -100,
    right: -100,
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: '#87CEFA',
    opacity: 0.4,
  },
  logoContainer: {
    marginBottom: 24,
    zIndex: 1,
    width: 100,
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoImagem: {
    width: '100%',
    height: '100%',
    borderRadius: 20,
  },
  titulo: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#0B2B5E',
    marginBottom: 32,
    letterSpacing: 1,
    zIndex: 1,
  },
  form: {
    width: '100%',
    maxWidth: 400,
    zIndex: 1,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E3A5F',
    marginBottom: 8,
    marginLeft: 4,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#87CEFA',
    borderRadius: 14,
    padding: 14,
    fontSize: 16,
    color: '#333',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  botao: {
    backgroundColor: '#1E40AF',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 12,
    shadowColor: '#1E40AF',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 7,
  },
  textoBotao: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
});