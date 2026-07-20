import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Pressable,
} from "react-native";
import { RefreshCw, WifiOff } from "lucide-react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../navigation/types";
import { useProducts } from "../hooks/useProducts";
import { ProductCard } from "../components/ProductCard";
import { ProductCardSkeleton } from "../components/ProductCardSkeleton";

type Props = NativeStackScreenProps<RootStackParamList, "ProductList">;

export function ProductListScreen({ navigation }: Props) {
  const { data, isLoading, isError, refetch } = useProducts();

  if (isLoading) {
    return (
      <FlatList
        data={[1, 2, 3, 4, 5, 6]}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.list}
        keyExtractor={(item) => item.toString()}
        renderItem={() => <ProductCardSkeleton />}
        scrollEnabled={false}
      />
    );
  }

  if (isError) {
    return (
      <View style={styles.errorContainer}>
        <View style={styles.errorIcon}>
          <WifiOff size={42} color="#D32F2F" />
        </View>
        <Text style={styles.errorTitle}>Impossible de charger les produits</Text>
        <Text style={styles.errorMessage}>
          Une erreur est survenue pendant le chargement. Vérifiez votre connexion puis
          réessayez.
        </Text>
        <Pressable style={styles.retryButton} onPress={() => refetch()}>
          <RefreshCw size={18} color="#fff" />
          <Text style={styles.retryButtonText}>Réessayer</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <FlatList
      data={data}
      keyExtractor={(item) => item.id}
      numColumns={2}
      columnWrapperStyle={styles.row}
      contentContainerStyle={styles.list}
      showsVerticalScrollIndicator={false}
      renderItem={({ item }) => (
        <ProductCard
          product={item}
          onPress={() =>
            navigation.navigate("ProductDetail", { productId: item.id })
          }
        />
      )}
    />
  );
}

const styles = StyleSheet.create({
  list: {
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  row: {
    justifyContent: "space-between",
    marginBottom: 4,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  errorIcon: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: "#FDECEC",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#222",
    textAlign: "center",
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 24,
  },
  retryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#0B5D4A",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10,
    gap: 8,
  },
  retryButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
});
