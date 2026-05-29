import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { musicas } from '../dados/musicas';

export default function Home({ navigation }) {

    return (
        <ScrollView 
            style={styles.scrollContainer}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
        >
            <View style={styles.header}>
                <Text style={styles.title}>Guify</Text>
            </View>

            <Text style={styles.subtitle}>Suas músicas favoritas</Text>
            <Text style={styles.section}>Destaques</Text>

            <View style={styles.cardDestaque}>
                <Text style={styles.cardTitle}>Playlist do Momento</Text>
                <Text style={styles.cardText}>As músicas mais ouvidas do Guify</Text>
            </View>

            <Text style={styles.section}>Músicas</Text>

            {musicas.map((item) => (
                <TouchableOpacity
                    key={item.id}
                    style={styles.card}
                    onPress={() => navigation.navigate('Player')}
                >
                    <Text style={styles.musicName}>{item.nome}</Text>
                    <Text style={styles.artistName}>{item.artista}</Text>
                    <Text style={styles.time}>{item.duracao}</Text>
                </TouchableOpacity>
            ))}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    scrollContainer: {
        flex: 1,
        backgroundColor: '#0F0F14',
    },
    scrollContent: {
        padding: 20,
    },
    header: {
        marginTop: 40,
        marginBottom: 20,
    },
    title: {
        fontSize: 36,
        fontWeight: 'bold',
        color: '#7C3AED',
    },
    subtitle: {
        fontSize: 16,
        color: '#A1A1AA',
        marginBottom: 25,
    },
    section: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#F8FAFC',
        marginBottom: 15,
        marginTop: 10,
    },
    cardDestaque: {
        backgroundColor: '#1A1A24',
        borderRadius: 12,
        padding: 20,
        marginBottom: 25,
    },
    cardTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#F8FAFC',
        marginBottom: 8,
    },
    cardText: {
        color: '#A1A1AA',
        fontSize: 15,
    },
    card: {
        backgroundColor: '#1A1A24',
        borderRadius: 10,
        padding: 15,
        marginBottom: 15,
    },
    musicName: {
        color: '#F8FAFC',
        fontSize: 18,
        fontWeight: 'bold',
    },
    artistName: {
        color: '#A1A1AA',
        fontSize: 15,
        marginTop: 5,
    },
    time: {
        color: '#22C55E',
        marginTop: 8,
        fontWeight: 'bold',
    },
});