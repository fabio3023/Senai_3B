import { useState } from "react";
import {
  View, Text, TextInput, StyleSheet,
  TouchableOpacity, Image, SafeAreaView
} from 'react-native';
import Logo from '../../assets/estacao.jpg';

export default function Login({ navigation }) {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.inner}>

        <View style={styles.logoWrapper}>
          <Image source={Logo} style={styles.logo} />
        </View>

        <Text style={styles.title}>Login</Text>

        <View style={styles.card}>
          <Text style={styles.label}>E-MAIL</Text>
          <TextInput
            style={styles.input}
            placeholder="seu@email.com"
            placeholderTextColor="#185FA5"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <Text style={styles.label}>SENHA</Text>
          <TextInput
            style={styles.input}
            placeholder="••••••••"
            placeholderTextColor="#185FA5"
            value={senha}
            onChangeText={setSenha}
            secureTextEntry
          />

          <TouchableOpacity
            style={styles.btnLogin}
            onPress={() => navigation.replace('Principal')}
          >
            <Text style={styles.btnLoginText}>Entrar</Text>
          </TouchableOpacity>

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>ou</Text>
            <View style={styles.dividerLine} />
          </View>

          <TouchableOpacity
            style={styles.btnRegister}
            onPress={() => navigation.navigate('Cadastro')}
          >
            <Text style={styles.btnRegisterText}>Criar uma conta</Text>
          </TouchableOpacity>
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
  logoWrapper: {
    width: 200,
    height: 150,
    borderRadius: 30,
    borderWidth: 3,
    borderColor: '#378ADD',
    overflow: 'hidden',
    marginBottom: 20,
  },
  logo: {
    width: '100%',
    height: '100%',
  },
  title: {
    color: '#E6F1FB',
    fontSize: 26,
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
  input: {
    backgroundColor: '#042C53',
    borderWidth: 0.5,
    borderColor: '#185FA5',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 11,
    color: '#E6F1FB',
    fontSize: 14,
    marginBottom: 16,
  },
  btnLogin: {
    backgroundColor: '#378ADD',
    borderRadius: 8,
    paddingVertical: 13,
    alignItems: 'center',
  },
  btnLoginText: {
    color: '#E6F1FB',
    fontSize: 15,
    fontWeight: '500',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
    gap: 8,
  },
  dividerLine: {
    flex: 1,
    height: 0.5,
    backgroundColor: '#185FA5',
  },
  dividerText: {
    color: '#185FA5',
    fontSize: 12,
  },
  btnRegister: {
    borderWidth: 0.5,
    borderColor: '#185FA5',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  btnRegisterText: {
    color: '#85B7EB',
    fontSize: 14,
  },
});