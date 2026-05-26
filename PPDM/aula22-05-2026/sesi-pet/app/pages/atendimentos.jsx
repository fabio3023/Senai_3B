import { View, Text, StyleSheet, FlatList } from 'react-native';
import { atendimentos } from '../dados/profissionais';

export default function Atendimentos() {
    return (
        <View style={styles.container}>
            <Text style={styles.header}>Atendimentos</Text>
            <FlatList 
                data={atendimentos}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <View style={styles.card}>
                        <Text style={styles.petName}>{item.pet}</Text>
                        <Text style={styles.service}>{item.servico}</Text>
                        <Text style={styles.time}>{item.horario}</Text>
                    </View>
                )}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f9f9f9',
        paddingHorizontal: 20,
        paddingTop: 10,
    },
    header: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 15,
        marginLeft: 5,
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        borderLeftWidth: 5,
        borderLeftColor: '#FF914D',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    petName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    service: {
        fontSize: 14,
        color: '#FF914D',
        marginTop: 4,
    },
    time: {
        fontSize: 14,
        color: '#777',
        marginTop: 4,
    },
});