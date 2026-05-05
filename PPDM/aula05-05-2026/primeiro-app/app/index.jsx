import { Text, View, StyleSheet, Image, ScrollView } from "react-native";
import Foto from '../assets/images/imagem.jpg'; 

export default function Index() {
  return (
    <ScrollView style={estilos.fundo}>
      <View style={estilos.cabecalho}>
        <Image source={Foto} style={estilos.fotoFlamingo} />
        <Text style={estilos.titulo}>My First App</Text>
      </View>
      <View style={estilos.cartao}>
        <Text style={estilos.tituloSecao}>Sobre o App</Text>
        <Text style={estilos.texto}>
          Aplicativo desenvolvido por estudantes do Sesi Mirandópolis para aprendizado do framework React Native.
        </Text>
      </View>
      <View style={estilos.cartao}>
        <Text style={estilos.tituloSecao}>O que aprenderemos</Text>
        <Text style={estilos.item}>📱 Layout Responsivo</Text>
        <Text style={estilos.item}>🔔 Push Notification</Text>
        <Text style={estilos.item}>🌐 Acesso a APIs</Text>
      </View>
      <View style={estilos.cartao}>
        <Text style={estilos.tituloSecao}>Do que precisamos</Text>
        <Text style={estilos.item}>💚 Node JS</Text>
        <Text style={estilos.item}>💙 VS Code</Text>
        <Text style={estilos.item}>🔥 Foco, Força e Fé</Text>
      </View>
    </ScrollView>
  );
}

const estilos = StyleSheet.create({
  fundo: {
    flex: 1,
    backgroundColor: '#eaf4ec', 
  },
  cabecalho: {
    backgroundColor: '#4f8596', 
    paddingVertical: 40,
    paddingHorizontal: 20,
    alignItems: 'center',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  fotoFlamingo: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: '#eaf4ec', 
    marginBottom: 15,
  },
  titulo: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  cartao: {
    backgroundColor: '#ffffff',
    marginHorizontal: 20,
    marginBottom: 15,
    padding: 20,
    borderRadius: 15,
    borderLeftWidth: 5,
    borderLeftColor: '#5f8b6f', 
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  tituloSecao: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2d5a48', 
    marginBottom: 10,
  },
  texto: {
    fontSize: 16,
    color: '#3a4d44',
    lineHeight: 24,
  },
  item: {
    fontSize: 16,
    color: '#3a4d44',
    marginBottom: 6,
    paddingLeft: 10,
  },
});