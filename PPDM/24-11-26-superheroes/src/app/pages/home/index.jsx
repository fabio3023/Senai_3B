import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Home() {
  const [herois, setHerois] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);
  const { width } = useWindowDimensions();
  const numColumns = width >= 900 ? 3 : width >= 560 ? 2 : 1;

  const carregaHeroes = async () => {
    try {
      setCarregando(true);
      setErro(null);

      const response = await fetch('https://superheroes-api-one.vercel.app/api/herois');
      if (!response.ok) {
        throw new Error('Erro ao buscar heróis');
      }

      const data = await response.json();
      const lista = Array.isArray(data) ? data : data?.herois || [];
      setHerois(lista);
    } catch (e) {
      setErro(e.message || 'Erro inesperado');
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    const loadTimer = setTimeout(() => {
      carregaHeroes();
    }, 0);

    return () => clearTimeout(loadTimer);
  }, []);

  const renderItem = ({ item }) => (
    <View style={[styles.card, numColumns > 1 && styles.cardInGrid]}>
      {item.foto && (
        <View style={styles.imageWrapper}>
          <Image
            source={{ uri: item.foto }}
            style={styles.heroImage}
            resizeMode="cover"
          />
          <View style={styles.powerBadge}>
            <Text style={styles.powerBadgeLabel}>FORCA</Text>
            <Text style={styles.powerBadgeValue}>{item.forca ?? '-'}</Text>
          </View>
        </View>
      )}
      <View style={styles.cardContent}>
        <Text style={styles.heroName}>{item.nome}</Text>
        <View style={styles.divider} />
        <Text style={styles.label}>HABILIDADES</Text>
        <Text style={styles.skills} numberOfLines={2}>
          {item.habilidade || 'Sem habilidade registrada'}
        </Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <StatusBar barStyle="light-content" backgroundColor="#090d18" />
      <View style={styles.container}>
        <View style={styles.header}>
          <View>
            <Text style={styles.eyebrow}>SUPERDATABASE</Text>
            <Text style={styles.title}>Heróis</Text>
          </View>
          {!carregando && !erro && (
            <View style={styles.countBadge}>
              <Text style={styles.countText}>{herois.length}</Text>
            </View>
          )}
        </View>

        {carregando && (
          <View style={styles.stateContainer}>
            <ActivityIndicator size="large" color="#ef4444" />
            <Text style={styles.stateText}>Reunindo os heróis...</Text>
          </View>
        )}

        {erro && (
          <View style={styles.stateContainer}>
            <Text style={styles.errorTitle}>Falha na missão</Text>
            <Text style={styles.errorText}>{erro}</Text>
            <Pressable
              onPress={carregaHeroes}
              style={({ pressed }) => [styles.retryButton, pressed && styles.pressed]}
            >
              <Text style={styles.retryText}>TENTAR NOVAMENTE</Text>
            </Pressable>
          </View>
        )}

        {!carregando && !erro && herois.length === 0 && (
          <View style={styles.stateContainer}>
            <Text style={styles.stateText}>Nenhum herói encontrado.</Text>
          </View>
        )}

        {!carregando && !erro && herois.length > 0 && (
          <FlatList
            data={herois}
            key={`grid-${numColumns}`}
            keyExtractor={(item, index) => String(item.id ?? index)}
            renderItem={renderItem}
            numColumns={numColumns}
            contentContainerStyle={styles.listContent}
            columnWrapperStyle={numColumns > 1 ? styles.columnWrapper : undefined}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#090d18',
  },
  container: {
    flex: 1,
    backgroundColor: '#f2f4f8',
  },
  header: {
    height: 112,
    paddingHorizontal: 24,
    paddingBottom: 18,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    backgroundColor: '#090d18',
  },
  eyebrow: {
    color: '#ef4444',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 3,
    marginBottom: 4,
  },
  title: {
    color: '#ffffff',
    fontSize: 38,
    lineHeight: 42,
    fontWeight: '900',
    letterSpacing: -1,
  },
  countBadge: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1,
    borderColor: '#30384a',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  countText: {
    color: '#ffffff',
    fontWeight: '800',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 32,
  },
  columnWrapper: {
    justifyContent: 'space-between',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    overflow: 'hidden',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e3e6ed',
    shadowColor: '#10131a',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  cardInGrid: {
    width: '48.5%',
  },
  imageWrapper: {
    height: 230,
    backgroundColor: '#dfe3eb',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  powerBadge: {
    position: 'absolute',
    right: 12,
    bottom: 12,
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: '#ef4444',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#ffffff',
  },
  powerBadgeLabel: {
    color: '#ffffff',
    fontSize: 8,
    fontWeight: '900',
  },
  powerBadgeValue: {
    color: '#ffffff',
    fontSize: 16,
    lineHeight: 18,
    fontWeight: '900',
  },
  cardContent: {
    minHeight: 118,
    paddingHorizontal: 18,
    paddingVertical: 16,
  },
  heroName: {
    color: '#111827',
    fontSize: 22,
    fontWeight: '900',
  },
  divider: {
    width: 32,
    height: 3,
    borderRadius: 2,
    backgroundColor: '#ef4444',
    marginVertical: 10,
  },
  label: {
    color: '#9298a5',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1.5,
    marginBottom: 4,
  },
  skills: {
    color: '#4b5563',
    fontSize: 14,
    lineHeight: 20,
  },
  stateContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  stateText: {
    color: '#6b7280',
    marginTop: 14,
    fontSize: 15,
  },
  errorTitle: {
    color: '#111827',
    fontSize: 22,
    fontWeight: '900',
    marginBottom: 6,
  },
  errorText: {
    color: '#6b7280',
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 18,
    backgroundColor: '#ef4444',
    borderRadius: 10,
    paddingHorizontal: 18,
    paddingVertical: 12,
  },
  retryText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1,
  },
  pressed: {
    opacity: 0.75,
  },
});