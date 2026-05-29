import { useState } from "react";
import { View, Text, TextInput, StyleSheet, TouchableOpacity } from 'react-native';

export default function Cadastro({ navigation }) {

    const [nome, setNome] = useState('');
    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState('');
    const [confSenha, setConfSenha] = useState('');

    return (
        <View style={styles.container}>

            <Text style={styles.title}>Guify</Text>
            <Text style={styles.subtitle}>Crie sua conta</Text>

            <TextInput 
                style={styles.input}
                placeholder='Nome do usuário'
                value={nome}
                onChangeText={setNome}
            />

            <TextInput 
                style={styles.input}
                placeholder='Insira seu e-mail'
                value={email}
                onChangeText={setEmail}
            />

            <TextInput 
                style={styles.input}
                placeholder='Digite sua senha'
                value={senha}
                onChangeText={setSenha}
                secureTextEntry
            />

            <TextInput 
                style={styles.input}
                placeholder='Confirme sua senha'
                value={confSenha}
                onChangeText={setConfSenha}
                secureTextEntry
            />

            <TouchableOpacity 
                style={styles.buttonPrimary}
                onPress={() => navigation.navigate('Login')}
            > 
                <Text style={styles.buttonPrimaryText}>Cadastrar</Text>
            </TouchableOpacity>

            <TouchableOpacity 
                style={styles.buttonSecondary}
                onPress={() => navigation.navigate('Login')}
            > 
                <Text style={styles.buttonSecondaryText}>
                    Já tenho conta
                </Text>
            </TouchableOpacity>

        </View>
    );
}

const styles = StyleSheet.create({

    container: {
        flex: 1,
        backgroundColor: '#0F0F14',
        justifyContent: 'center',
        paddingHorizontal: 30,
    },

    title: {
        fontSize: 36,
        fontWeight: 'bold',
        color: '#7C3AED',
        textAlign: 'center',
        marginBottom: 5,
    },

    subtitle: {
        fontSize: 16,
        color: '#A1A1AA',
        textAlign: 'center',
        marginBottom: 30,
    },

    input: {
        backgroundColor: '#1A1A24',
        borderRadius: 10,
        padding: 15,
        fontSize: 16,
        marginBottom: 15,
        borderWidth: 1,
        borderColor: '#2A2A35',
        color: '#F8FAFC',
    },

    buttonPrimary: {
        backgroundColor: '#7C3AED',
        paddingVertical: 15,
        borderRadius: 10,
        alignItems: 'center',
        marginTop: 10,
    },

    buttonPrimaryText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },

    buttonSecondary: {
        marginTop: 20,
        alignItems: 'center',
    },

    buttonSecondaryText: {
        color: '#22C55E',
        fontSize: 16,
        fontWeight: '600',
    },

});