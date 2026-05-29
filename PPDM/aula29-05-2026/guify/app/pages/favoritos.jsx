// app/pages/favoritos.jsx
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { favoritos } from '../dados/musicas';

export default function Favoritos({ navigation }) {

    return (
        <View style={styles.container}>
            <FlatList
                data={favoritos}
                keyExtractor={(item) => item.id}
                showsVerticalScrollIndicator={false}
                ListHeaderComponent={
                    <Text style={styles.header}>
                        Músicas Favoritas
                    </Text>
                }
                renderItem={({ item }) => (
                    <TouchableOpacity
                        style={styles.card}
                        onPress={() => navigation.navigate('Player')}
                    >
                        <Text style={styles.name}>
                            {item.nome}
                        </Text>
                        <Text style={styles.artist}>
                            {item.artista}
                        </Text>
                    </TouchableOpacity>
                )}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0F0F14',
        paddingHorizontal: 20,
        paddingTop: 10,
    },
    header: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#F8FAFC',
        marginBottom: 15,
    },
    card: {
        backgroundColor: '#1A1A24',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        borderLeftWidth: 5,
        borderLeftColor: '#7C3AED',
    },
    name: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#F8FAFC',
    },
    artist: {
        fontSize: 14,
        color: '#22C55E',
        marginTop: 4,
    },
});