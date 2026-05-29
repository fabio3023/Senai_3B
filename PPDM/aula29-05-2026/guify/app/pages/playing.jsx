// app/pages/playing.jsx
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';

export default function Player({ navigation }) {

    return (
        <ScrollView 
            style={styles.container}
            contentContainerStyle={styles.content}
            showsVerticalScrollIndicator={false}
        >
            <Text style={styles.header}>
                Tocando Agora
            </Text>

            <View style={styles.album}>
                <Text style={styles.albumText}>
                    CAPA DO ÁLBUM
                </Text>
            </View>

            <Text style={styles.musicName}>
                Neon Nights
            </Text>

            <Text style={styles.artistName}>
                Luna Vega
            </Text>

            <Text style={styles.status}>
                ▶ Reproduzindo
            </Text>

            <View style={styles.controls}>
                <TouchableOpacity style={styles.button}>
                    <Text style={styles.buttonText}>◀</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.button}>
                    <Text style={styles.buttonText}>⏸</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.button}>
                    <Text style={styles.buttonText}>▶</Text>
                </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.favoriteButton}>
                <Text style={styles.favoriteText}>❤ Favoritada</Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={styles.backButton}
                onPress={() => navigation.goBack()}
            >
                <Text style={styles.backText}>Voltar</Text>
            </TouchableOpacity>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0F0F14',
    },
    content: {
        alignItems: 'center',
        paddingVertical: 20,
        paddingHorizontal: 20,
    },
    header: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#F8FAFC',
        marginBottom: 30,
    },
    album: {
        width: 250,
        height: 250,
        backgroundColor: '#1A1A24',
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 30,
    },
    albumText: {
        color: '#A1A1AA',
        fontSize: 18,
        fontWeight: 'bold',
    },
    musicName: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#F8FAFC',
    },
    artistName: {
        fontSize: 18,
        color: '#22C55E',
        marginTop: 10,
    },
    status: {
        fontSize: 16,
        color: '#7C3AED',
        marginTop: 15,
        marginBottom: 30,
    },
    controls: {
        flexDirection: 'row',
        marginBottom: 30,
    },
    button: {
        backgroundColor: '#1A1A24',
        padding: 20,
        borderRadius: 50,
        marginHorizontal: 10,
    },
    buttonText: {
        color: '#F8FAFC',
        fontSize: 22,
        fontWeight: 'bold',
    },
    favoriteButton: {
        backgroundColor: '#7C3AED',
        paddingVertical: 12,
        paddingHorizontal: 30,
        borderRadius: 10,
        marginBottom: 20,
    },
    favoriteText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    backButton: {
        marginTop: 10,
    },
    backText: {
        color: '#22C55E',
        fontSize: 16,
        fontWeight: 'bold',
    },
});