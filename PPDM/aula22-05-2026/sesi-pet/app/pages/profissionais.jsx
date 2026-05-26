import { View, Text, StyleSheet, FlatList } from 'react-native';
import { profissionais } from '../dados/profissionais';

export default function Profissionais() {
    return (
        <View style={styles.container}>
            <Text style={styles.header}>Profissionais</Text>
            <FlatList 
                data={profissionais}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <View style={styles.card}>
                        <Text style={styles.name}>{item.nome}</Text>
                        <Text style={styles.specialty}>{item.especialidade}</Text>
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
        borderLeftColor: '#4CAF50', // verde para diferenciar, mas ainda amigável
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    name: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    specialty: {
        fontSize: 14,
        color: '#4CAF50',
        marginTop: 4,
    },
});