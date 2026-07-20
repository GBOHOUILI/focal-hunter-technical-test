import { View, Text, Image, ScrollView, ActivityIndicator, StyleSheet, Pressable } from "react-native";
import { useState } from "react";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../navigation/types";
import { useProductDetail } from "../hooks/useProductDetail";
import { SignupModal } from "../components/SignupModal";
import { Toast } from "../components/Toast";

type Props = NativeStackScreenProps<RootStackParamList, "ProductDetail">;

export function ProductDetailScreen({ route }: Props) {
  const { productId } = route.params;
  const { data, isLoading, isError } = useProductDetail(productId);

  const [modalVisible, setModalVisible] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (isError || !data) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Impossible de charger ce produit.</Text>
      </View>
    );
  }

  const isOutOfStock = data.stock === 0;

  return (
    <>
      <ScrollView contentContainerStyle={styles.container}>
        <Image source={{ uri: data.imageUrl }} style={styles.image} />

        <View style={styles.body}>
          <Text style={styles.price}>
            {data.price.toLocaleString()} {data.currency}
          </Text>
          <Text style={styles.title}>{data.title}</Text>

          <View style={[styles.badge, isOutOfStock && styles.badgeOutOfStock]}>
            <Text style={[styles.badgeText, isOutOfStock && styles.badgeTextOutOfStock]}>
              {isOutOfStock ? "Rupture de stock" : `${data.stock} en stock`}
            </Text>
          </View>

          <Text style={styles.storeName}>Vendu par {data.storeName}</Text>

          <Text style={styles.descriptionLabel}>Description</Text>
          <Text style={styles.description}>{data.description}</Text>

          <Pressable style={styles.ctaButton} onPress={() => setModalVisible(true)}>
            <Text style={styles.ctaButtonText}>Ajouter à ma liste</Text>
          </Pressable>
        </View>
      </ScrollView>

      <SignupModal
        visible={modalVisible}
        productId={productId}
        onClose={() => setModalVisible(false)}
        onSuccess={() => setToastVisible(true)}
      />
      <Toast
        message="Vous êtes inscrit ! Vous recevrez un e-mail."
        visible={toastVisible}
        onHide={() => setToastVisible(false)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: { paddingBottom: 32 },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  errorText: { color: "#a91e1e", fontSize: 15 },
  image: { width: "100%", aspectRatio: 1, backgroundColor: "#f2f2f2" },
  body: { padding: 16 },
  price: { fontSize: 22, fontWeight: "800", color: "#1a1a1a" },
  title: { fontSize: 18, fontWeight: "600", color: "#333", marginTop: 4 },
  badge: {
    alignSelf: "flex-start",
    backgroundColor: "#eaf3ea",
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginTop: 10,
  },
  badgeOutOfStock: { backgroundColor: "#fbe9e7" },
  badgeText: { fontSize: 12, fontWeight: "600", color: "#2e6b3e" },
  badgeTextOutOfStock: { color: "#a91e1e" },
  storeName: { fontSize: 14, color: "#666", marginTop: 12 },
  descriptionLabel: { fontSize: 15, fontWeight: "700", color: "#1a1a1a", marginTop: 20 },
  description: { fontSize: 14, color: "#555", lineHeight: 20, marginTop: 6 },
  ctaButton: { backgroundColor: "#0B5D4A", borderRadius: 10, paddingVertical: 14, alignItems: "center", marginTop: 24 },
  ctaButtonText: { color: "#fff", fontWeight: "700", fontSize: 15 },
});
