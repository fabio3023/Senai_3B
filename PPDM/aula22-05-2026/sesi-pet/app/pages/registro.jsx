import { useState } from "react";
import { View, Text, TextInput, StyleSheet, TouchableOpacity } from 'react-native';

export default function Registro({ navigation }) {
    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState('');
    const [confSenha, setConfSenha] = useState('');

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Bem Vindo ao Sesi Pet</Text>
            <Text style={styles.subtitle}>Cadastre-se</Text>
            <TextInput 
                style={styles.input}
                placeholder='Insira seu e-mail'
                value={email}
                onChangeText={setEmail}
            />
            <TextInput 
                style={styles.input}
                placeholder='****'
                value={senha}
                onChangeText={setSenha}
                secureTextEntry
            />
            <TextInput 
                style={styles.input}
                placeholder='****'
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
                <Text style={styles.buttonSecondaryText}>Já tenho conta</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        justifyContent: 'center',
        paddingHorizontal: 30,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#FF914D',
        textAlign: 'center',
        marginBottom: 5,
    },
    subtitle: {
        fontSize: 16,
        color: '#777',
        textAlign: 'center',
        marginBottom: 30,
    },
    input: {
        backgroundColor: '#f2f2f2',
        borderRadius: 10,
        padding: 15,
        fontSize: 16,
        marginBottom: 15,
        borderWidth: 1,
        borderColor: '#e0e0e0',
    },
    buttonPrimary: {
        backgroundColor: '#FF914D',
        paddingVertical: 15,
        borderRadius: 10,
        alignItems: 'center',
        marginTop: 10,
        shadowColor: '#FF914D',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 5,
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
        color: '#FF914D',
        fontSize: 16,
        fontWeight: '600',
    },
});